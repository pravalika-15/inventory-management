const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema({
  items: [cartItemSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
