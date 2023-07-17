const express = require("express");
const router = express.Router();
const Supplier = require("../Schema/supplierModel");

// Get all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    console.error("Error retrieving suppliers:", error);
    res.status(500).json({ error: "Failed to retrieve suppliers" });
  }
});

// Create a new supplier
router.post("/suppliers", async (req, res) => {
  try {
    const { name, contactName, phoneNumber, email, address } = req.body;
    const newSupplier = new Supplier({
      name,
      contactName,
      phoneNumber,
      email,
      address,
    });
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create the supplier" });
  }
});

router.get("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findById(supplierId);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    console.error("Error retrieving supplier:", error);
    res.status(500).json({ error: "Failed to retrieve the supplier" });
  }
});

// Route for updating a supplier
router.put("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { name, contactName, phoneNumber, email, address } = req.body;
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { name, contactName, phoneNumber, email, address },
      { new: true }
    );
    if (updatedSupplier) {
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Failed to update the supplier" });
  }
});

// Route for deleting a supplier
router.delete("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    if (deletedSupplier) {
      res.json({ message: "Supplier deleted successfully" });
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete the supplier" });
  }
});

module.exports = router;
