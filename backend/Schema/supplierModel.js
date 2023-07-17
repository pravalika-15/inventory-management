const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const supplierSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
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
  email: {
    type: String,
  },
  address: {
    type: String,
  },
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
