const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    default: uuidv4,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      "order placed",
      "packed",
      "dispatched",
      "shipped",
      "in transit",
      "delivered",
      "Waiting for cancellation confirmation",
      "Refund initiated",
    ],
    default: "order placed",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
