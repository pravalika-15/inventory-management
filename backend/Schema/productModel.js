const mongoose = require("mongoose");
const Supplier = require("./supplierModel");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
