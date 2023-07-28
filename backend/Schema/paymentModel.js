const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Generate a unique order ID
const order_id = uuidv4();

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
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
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
