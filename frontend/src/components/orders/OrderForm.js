import React, { useState } from "react";
import axios from "axios";
const url = "https://inventory-5yt3.onrender.com/api";
const OrderForm = ({ userId }) => {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(userId);
    const newOrder = {
      customer,
      product,
      quantity,
      userID: userId,
    };

    try {
      await axios.post(`${url}/orders`, newOrder);
      console.log("New order created");
      setCustomer("");
      setProduct("");
      setQuantity("");
      // Navigate to the desired page, e.g., orders page
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-5">
      <h2 className="text-xl font-bold mb-4">Create New Order</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4  items-center justify-center my-auto"
      >
        <input type="hidden" value={userId} />

        <div>
          <label htmlFor="customer" className="block font-semibold">
            Customer:
          </label>
          <input
            type="text"
            id="customer"
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label htmlFor="product" className="block font-semibold">
            Product:
          </label>
          <input
            type="text"
            id="product"
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block font-semibold">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Create Order
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
