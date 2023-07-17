const express = require("express");
const router = express.Router();
const Order = require("../Schema/orderModel"); // Assuming you have the Order model defined

// Route for creating a new order
router.post("/orders", async (req, res) => {
  try {
    const { customer, product, quantity } = req.body;
    console.log(req.body);
    const order = new Order({ customer, product, quantity });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create the order" });
  }
});

// Route for retrieving an order by ID
router.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    // console.log("hi");
    const order = await Order.findById(orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve the order" });
  }
});

// Route for retrieving all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

router.get("/orders/:id/edit", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (order) {
      res.render("OrderEdit", { order }); // Pass the order object to the OrderEdit view
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve the order" });
  }
});

// Route for updating an order by ID

router.put("/orders/:id/edit", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { customer, product, quantity } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { customer, product, quantity },
      { new: true }
    );
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update the order" });
  }
});

// Route for deleting an order by ID
router.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (deletedOrder) {
      res.json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete the order" });
  }
});

module.exports = router;
