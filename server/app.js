import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import cors from "cors";
import productRoutes from "./routes/products.js";
import dotenv from 'dotenv';
import { db } from "./connect.js";
dotenv.config();

const stripe = Stripe(process.env.STRIPE_TEST_KEY);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.CLIENT_URL,
}))

app.use('/orders', bodyParser.json());
app.use('/products', bodyParser.json());

async function saveSession(sessionId, products) {
    try {
        console.log("Inserting Session Into DB")
        const productsJSON = JSON.stringify(products);
    
        const sql = "INSERT INTO sessions (session_id, session_object) VALUES (?, ?)";
        const values = [sessionId, productsJSON];

        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
              if (err) {
                console.error("Error saving session:", err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
          console.log("Session saved successfully:", result.insertId);
        
      } catch (error) {
        console.error("Error saving session:", error);
    }
}

async function saveOrder(session) {
    try {
        console.log("Saving Order To DB -> First matching products")
        const getSessionQuery = "SELECT session_object FROM sessions WHERE session_id = ?";
        const sessionValues = [session.id];

        const sessionResult = await new Promise((resolve, reject) => {
            db.query(getSessionQuery, sessionValues, (err, result) => {
                if (err) {
                    console.error("Error querying session:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Extract the products from the session object
        console.log("Match", sessionResult)
        const sessionObject = JSON.parse(sessionResult[0].session_object);

        const sql = "INSERT INTO orders (session_id, order_object, products_matched, fulfilled) VALUES (?, ?, ?, ?)";
        const values = [session.id, JSON.stringify(session), JSON.stringify(sessionObject), 0];

        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
              if (err) {
                console.error("Error saving order:", err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
          console.log("Order saved successfully:", result.insertId);
        
      } catch (error) {
        console.error("Error saving order:", error);
    }
}

app.post('/orders', async (req, res) => {
  try {
    const { products } = req.body;

    const getProducts = () => {
      return new Promise((resolve, reject) => {
        const q = `SELECT * FROM products`;
        db.query(q, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };

    const fetchProducts = async () => {
      try {
        const productsList = await getProducts();
        return productsList;
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    const productsList = await fetchProducts();
    console.log(productsList)

    const lineItems = await Promise.all(
      products.map(async (product) => {
        const databaseProduct = productsList.find(p => p.id === product.id);

        if (!databaseProduct) {
          throw new Error(`Product with id ${product.id} not found in the database`);
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: databaseProduct.name,
            },
            unit_amount: databaseProduct.price * 100
          },
          quantity: product.quantity,
        };
      })
    );
    console.log(lineItems)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}?success=false`,
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      payment_method_types: ["card"],
    });

    try {
        let session_id = session.id
        await saveSession( session_id, products ); 
    } catch (error) {
        console.error("Error saving session to database:", error);
    }

    res.json({ stripeSession: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



const endpointSecret = "whsec_613mJtqrnBpshVLw2ecVetxZtBOhFPbj"
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('Received webhook request - Successful Checkout');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.completed':
        const session = event.data.object;
        try {
            await saveOrder(session); 
        } catch (error) {
            console.error("Error saving order to database", error);
        }
        break;
    default:
        console.log('Unhandled event type:', event.type);
  }

  res.sendStatus(200);
});






app.use("/products", productRoutes);
app.get('/',(req,res)=> {
    res.json({products: 1})
  }
)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
