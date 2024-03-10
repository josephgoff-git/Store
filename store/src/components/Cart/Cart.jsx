import React, { useState } from "react";
import "./Cart.scss";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useSelector } from "react-redux";
import { removeItem, resetCart } from "../../redux/cartReducer";
import { useDispatch } from "react-redux";
import { makeRequest } from "../../makeRequest";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios"
import urls from '../../config';

const Cart = () => { 
  const products = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();

  const totalPrice = () => {
    let total = 0;
    products.forEach((item) => {
      total += item.quantity * item.price;
    });
    return total.toFixed(2);
  };

  // const test_key = "pk_test_51Oh3E4LPJzMApbD6uEsS2RoWXwEQ7j9blkT2k3b8fa1aVx4jlq4UxIl95bLelxAJ8NwheUYNCrqGMX3ww74OFzfB00LfcW4moZ"
  // const live_key = "pk_live_51Oh3E4LPJzMApbD6jEYJRE84WuH6seO6mblvFX0taArKO9L4rHhhCD0Wqhvlk4tTegsngCvFNzrg8utW8ymAkJ1J00y0lpmGSa"
  // // npm install --save @stripe/react-stripe-js @stripe/stripe-js
  // const stripePromise = loadStripe(
  //   test_key
  // );
  // const handlePayment = async () => {
  //   console.log("checking out!")
  //   try {
  //     const stripe = await stripePromise;
  //     console.log(products)
  //     const res = await makeRequest.post("/orders", {
  //       products
  //     });
  //     await stripe.redirectToCheckout({
  //       sessionId: res.data.stripeSession.id,
  //     });

  //   } catch (err) {
  //     console.log(err);
  //   }
  // };



  const [productsList, setProductsList] = useState([
    { id: 1, title: 'Product 1', desc: 'Product 1 desc', price: 10, quantity: 1 },
  ]);

  const test_key = "pk_test_51Oh3E4LPJzMApbD6uEsS2RoWXwEQ7j9blkT2k3b8fa1aVx4jlq4UxIl95bLelxAJ8NwheUYNCrqGMX3ww74OFzfB00LfcW4moZ"
  const live_key = "pk_live_51Oh3E4LPJzMApbD6jEYJRE84WuH6seO6mblvFX0taArKO9L4rHhhCD0Wqhvlk4tTegsngCvFNzrg8utW8ymAkJ1J00y0lpmGSa"
  // npm install --save @stripe/react-stripe-js @stripe/stripe-js

  const server_url = urls[0]

  const stripePromise = loadStripe(test_key);
  const handlePayment = async () => {
    try { 
      const response = await fetch(server_url + '/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: productsList }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      const stripeSessionId = data.stripeSession.id;

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({
        sessionId: stripeSessionId,
      });

      console.log('Stripe Payment Successful');

    } catch (err) {
      console.log(err);
    }
  };



  


  // const handlePayment = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:8080/api/orders/create-checkout-session', {
  //       products: productsList
  //     });
  //     console.log('Stripe session created:', response.data.stripeSession);
  //   } catch (error) {
  //     console.error('Error creating Stripe session:', error);
  //   }
  // };

  return (
    <div className="cart">
      <h1>Products in your cart</h1>
      {products?.map((item) => (
        <div className="item" key={item.id}>
          <img src={item.img} alt="" />
          <div className="details">
            <h1>{item.title}</h1>
            <p>{item.desc?.substring(0, 100)}</p>
            <div className="price">
              {item.quantity} x ${item.price}
            </div>
          </div>
          <DeleteOutlinedIcon
            className="delete"
            onClick={() => dispatch(removeItem(item.id))}
          />
        </div>
      ))}
      <div className="total">
        <span>SUBTOTAL</span>
        <span>${totalPrice()}</span>
      </div>
      <button onClick={handlePayment}>PROCEED TO CHECKOUT</button>
      <span className="reset" onClick={() => dispatch(resetCart())}>
        Reset Cart
      </span>
    </div>
  );
};

export default Cart;
