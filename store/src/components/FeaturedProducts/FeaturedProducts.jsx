import React, { useEffect, useState } from "react";
import Card from "../Card/Card";
import "./FeaturedProducts.scss";
import useFetch from "../../hooks/useFetch";
import axios from "axios"
import urls from '../../config';

const FeaturedProducts = ({ type }) => {
  // const { data, loading, error } = useFetch(
  //   `/products?populate=*&[filters][type][$eq]=${type}`
  // );

  const [data, setData] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState(false) 

  const fetchProducts = async () => {
    try {
      const response = await axios.get(urls[0] + '/products');
      console.log(response.data)
      setLoading(false)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(true)
    }
  };

  useEffect(()=>{
    fetchProducts();
  },[])

  return (
    <div className="featuredProducts">
      <div className="top">
        <h1>{type} products</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum
          suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan
          lacus vel facilisis labore et dolore magna aliqua. Quis ipsum
          suspendisse ultrices gravida. Risus commodo viverra maecenas.
        </p>
      </div>
      <div className="bottom">
        {error
          ? "Something went wrong!"
          : loading
          ? "loading"
          : data?.map((item) => <Card item={item} key={item.id} />)}
      </div>
    </div>
  );
};

export default FeaturedProducts;
