// const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
// const express = require('express');
// const bodyParser = require('body-parser');

// const router = express.Router();
// router.use(bodyParser.json());

// async function createCheckoutSession(req, res) {
//   const { products } = req.body;

//   const lineItems = await Promise.all(
//     products.map(async (product) => {
//       // Retrieve product details (replace this with your own logic to fetch product details)
//       const item = {
//         title: product.title, // Assuming your product object has a "title" field
//         price: product.price, // Assuming your product object has a "price" field
//       };

//       return {
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: item.title,
//           },
//           unit_amount: item.price * 100,
//         },
//         quantity: product.quantity,
//       };
//     })
//   );

//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: 'payment',
//       success_url: `${process.env.CLIENT_URL}?success=true`,
//       cancel_url: `${process.env.CLIENT_URL}?success=false`,
//       line_items: lineItems,
//       shipping_address_collection: { allowed_countries: ['US', 'CA'] },
//       payment_method_types: ['card'],
//     });

//     // Save order details or any necessary information to your database here

//     res.status(200).json({ stripeSession: session });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
//   }
// };

// module.exports = {
//     createCheckoutSession
//   };