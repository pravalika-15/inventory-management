// routes/payment.js
const express = require("express");
const router = express.Router();
const OrderPayment = require("../Schema/orderPaymentModel");

// Route to save payment details after a successful payment
router.post("/order-payments", async (req, res) => {
  try {
    const { orderId, paymentId, amount, currency, status } = req.body;

    // Create a new payment record
    const orderPayment = new OrderPayment({
      orderId,
      paymentId,
      amount,
      currency,
      status,
    });

    // Save the payment details to the database
    await orderPayment.save();

    res.json(orderPayment);
    // console.log(orderPayment);
  } catch (error) {
    console.error("Error saving payment details:", error);
    res.status(500).json({ error: "Failed to save payment details" });
  }
});

// Route to get payment details for a specific order
router.get("/order-payments/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const paymentDetails = await OrderPayment.find({ orderId });

    if (paymentDetails) {
      // console.log(paymentDetails);
      res.json(paymentDetails);
    } else {
      res
        .status(404)
        .json({ error: "Payment details not found for this order" });
    }
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});

module.exports = router;
