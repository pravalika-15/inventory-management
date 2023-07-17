import React, { useState } from "react";
import axios from "axios";

const OrderForm = () => {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const navigate = useState();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newOrder = {
      customer,
      product,
      quantity,
    };
    console.log(newOrder);

    try {
      await axios.post("http://localhost:3006/api/orders", newOrder);
      console.log("New order created");
      setCustomer("");
      setProduct("");
      setQuantity("");
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div>
      <h2>Create New Order</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="customer">Customer:</label>
        <input
          type="text"
          id="customer"
          value={customer}
          onChange={(event) => setCustomer(event.target.value)}
        />

        <label htmlFor="product">Product:</label>
        <input
          type="text"
          id="product"
          value={product}
          onChange={(event) => setProduct(event.target.value)}
        />

        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />

        <button type="submit">Create Order</button>
      </form>
    </div>
  );
};

export default OrderForm;
