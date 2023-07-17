const express = require("express");
const router = express.Router();
const Product = require("../Schema/productModel");
const Supplier = require("../Schema/supplierModel");
const productsPerPage = 10;

router.get("/products", async (req, res) => {
  const { search } = req.query;

  try {
    let query = {};

    if (search) {
      const searchTerm = new RegExp(search, "i");
      query = {
        $or: [
          { name: searchTerm },
          { category: searchTerm },
          // Add other fields to search in as needed
        ],
      };
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const page = parseInt(req.query.page) || 1;
    let productsQuery = Product.find(query)
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    const products = await productsQuery.exec();

    // Fetch supplier information for each product
    const productsWithSupplier = await Promise.all(
      products.map(async (product) => {
        const supplier = await Supplier.findById(product.supplier);
        console.log(supplier);
        return { ...product._doc, supplier };
      })
    );

    return res.json({
      products: productsWithSupplier,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    // Extract the product data from the request body
    const { name, category, price, description, supplier, quantity } = req.body;

    // Create a new product instance
    const newProduct = new Product({
      name,
      category,
      price,
      description,
      supplier,
      quantity,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;

    const product = await Product.findByIdAndUpdate(id, updatedProduct, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
