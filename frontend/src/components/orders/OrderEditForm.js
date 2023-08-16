import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router";
const url = "https://inventory-5yt3.onrender.com/api";
const OrderEditForm = () => {
  const { id } = useParams();
  console.log(id);
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  //   const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${url}/orders/${id}`)
      .then((response) => {
        setOrder(response.data);
        setCustomer(response.data.customer);
        setProduct(response.data.product);
        setQuantity(response.data.quantity);
      })
      .catch((error) => {
        console.error("Error fetching order:", error);
      });
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Update the order using the modified data
    const updatedOrder = {
      ...order,
      customer,
      product,
      quantity,
    };

    // Send the updated order to the backend API
    axios
      .put(`${url}/orders/${id}/edit`, updatedOrder)
      .then((response) => {
        console.log("Order updated:", response.data);
        // window.location.href = "/orders";
      })
      .catch((error) => {
        console.error("Error updating order:", error);
      });
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Edit Order #{order.id}</h2>
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

        <button type="submit">Update Order</button>
      </form>
    </div>
  );
};

export default OrderEditForm;
