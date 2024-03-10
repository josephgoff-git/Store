import React from "react";
import { useState, useEffect } from "react";
import "./Product.scss";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BalanceIcon from "@mui/icons-material/Balance";
import useFetch from "../../hooks/useFetch";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartReducer";
import axios from "axios"
import urls from '../../config';

const Product = () => {
  const id = useParams().id;
  const [selectedImg, setSelectedImg] = useState("img1");
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();
  // const { data, loading, error } = useFetch(`/products/${id}?populate=*`);

  let base = process.env.REACT_APP_API_URL.slice(0,-4);

  const [data, setData] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState(false) 

  const fetchProducts = async () => {
    try {
      const response = await axios.get(urls[0] + '/products');
      console.log(response.data)
      setLoading(false)
      setData(response.data[id])
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(true)
    }
  };

  useEffect(()=>{
    fetchProducts();
  },[])



  return (
    <div className="product">
      {loading ? (
        "loading"
      ) : (
        <>
          <div className="left">
            <div className="images">
              <img
                src={
                  data.img1
                }
                alt=""
                onClick={(e) => setSelectedImg("img1")}
              />
              <img
                src={
                  data.img2
                }
                alt=""
                onClick={(e) => setSelectedImg("img2")}
              />
            </div>
            <div className="mainImg">
              <img
                src={
                  data[selectedImg]
                }
                alt=""
              />
            </div>
          </div>
          <div className="right">
            <h1>{data?.name}</h1>
            <span className="price">${data?.price}</span>
            <p>{data?.desc}</p>
            <div className="quantity">
              <button
                onClick={() =>
                  setQuantity((prev) => (prev === 1 ? 1 : prev - 1))
                }
              >
                -
              </button>
              {quantity}
              <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>
            <button
              className="add"
              onClick={() =>
                dispatch(
                  addToCart({
                    id: data.id,
                    title: data.name,
                    desc: data.desc,
                    price: data.price,
                    img: data.img1,
                    quantity,
                  })
                )
              }
            >
              <AddShoppingCartIcon /> ADD TO CART
            </button>
            <div className="links">
              <div className="item">
                <FavoriteBorderIcon /> ADD TO WISH LIST
              </div>
              <div className="item">
                <BalanceIcon /> ADD TO COMPARE
              </div>
            </div>
            <div className="info">
              <span>Vendor: Polo</span>
              <span>Product Type: T-Shirt</span>
              <span>Tag: T-Shirt, Women, Top</span>
            </div>
            <hr />
            <div className="info">
              <span>DESCRIPTION</span>
              <hr />
              <span>ADDITIONAL INFORMATION</span>
              <hr />
              <span>FAQ</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Product;
