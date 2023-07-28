// models/payment.js
const mongoose = require("mongoose");

const OrderPaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
});

const OrderPayment = mongoose.model("OrderPayment", OrderPaymentSchema);

module.exports = OrderPayment;
