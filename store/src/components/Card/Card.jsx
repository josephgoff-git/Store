import React from "react";
import "./Card.scss";
import { Link } from "react-router-dom";

const Card = ({ item }) => {
  console.log("CARD")
  console.log(item);
  let base = process.env.SERVER_URL

  return (
    <Link className="link" to={`/product/${item.id}`}>
      <div className="card">
        <div className="image">
          {item?.isNew == 1 && <span>New Season</span>}
          <img
            src={
              item.img1
            }
            alt=""
            className="mainImg"
          />
          <img
            style={{backgroundColor: "white"}}
            src={
              item.img2
            }
            alt=""
            className="secondImg"
          />
        </div>
        <h2>{item?.name}</h2>
        <div className="prices">
          <h3>{item.oldPrice || (item?.price + 20).toFixed(2)}</h3>
          <h3>${item?.price}</h3>
        </div>
      </div>
    </Link>
  );
};

export default Card;
