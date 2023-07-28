const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  amount: {
    type: Number,
    default: 100,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: "Payment Pending!",
  },
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
