import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const navigate = useNavigate();

  const handleEdit = (orderId) => {
    navigate(`/orders/${orderId}/edit`);
  };
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3006/api/orders");
      setOrders(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const handleDelete = (orderId) => {
    // Perform delete operation using the supplierId
    axios
      .delete(`http://localhost:3006/api/orders/${orderId}`)
      .then(() => {
        // Remove the deleted supplier from the suppliers list
        const updatedSuppliers = orders.filter(
          (supplier) => supplier._id !== orderId
        );
        setOrders(updatedSuppliers);
        console.log("Order deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Order:", error);
      });
  };

  return (
    <div>
      <h2>Order List</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.customer}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>
                <button onClick={() => handleEdit(order._id)}>Edit</button>
                <button onClick={() => handleDelete(order._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
