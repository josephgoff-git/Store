// Get Node SSL Tutorial - https://www.youtube.com/watch?v=yhiuV6cqkNs
// Stripe webhook endpoint: whsec_613mJtqrnBpshVLw2ecVetxZtBOhFPbj
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
app.use(bodyParser.json());

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

    res.json({ stripeSession: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


async function createOrder(data) {
  try {
    const { stripeId, products } = data;
    const productsJSON = JSON.stringify(products);

    const sql = "INSERT INTO orders (sessionId, data) VALUES (?, ?)";
    const values = [stripeId, productsJSON];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error creating order:", err);
      } else {
        console.log("Order created successfully:", result.insertId);
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

app.use("/products", productRoutes);
app.get('/',(req,res)=> {
    res.json({products: 1})
    console.log(productRoutes)
  }
)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.post('/webhooks/stripe', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);

      // Extract product data
      const lineItems = session.display_items.map(item => ({
        id: item.custom.id,
        name: item.custom.name,
        quantity: item.quantity,
        price: item.amount_total / 100, // amount_total is in cents, convert to dollars
      }));

      // Perform any actions you want after successful payment
      // For example, you can call your createOrder function here
      await createOrder({ stripeId: session.id, products: lineItems });
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  res.sendStatus(200);
});