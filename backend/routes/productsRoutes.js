const express = require("express");
const router = express.Router();
const Product = require("../Schema/productModel");
const Supplier = require("../Schema/supplierModel");
const productsPerPage = 10;
const nodemailer = require("nodemailer");
const multer = require("multer");
const csvtojson = require("csvtojson");
const xlsxtojson = require("xlsx-to-json");
const ExcelJS = require("exceljs");
const admin_mail = "pravalikaattada15@gmail.com";
const company_mail = "stockcentral.app@gmail.com";
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "stockcentral.app@gmail.com",
    pass: "nrbvttfzcgpyovyp",
  },
});

// Endpoint for exporting product data
router.get("/products/export", async (req, res) => {
  const format = req.query.format;

  try {
    console.log("format", format);
    const products = await Product.find({}); // Fetch the products from the database

    if (format !== "csv" && format !== "excel") {
      return res.status(400).json({ error: "Invalid export format" });
    }
    if (format === "csv") {
      // Convert products data to CSV format
      const csv = products
        .map((product) => {
          // Map the product fields to CSV format
          return `${product.name},${product.price},${product.description},${product.category},${product.quantity}`;
        })
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.attachment("products.csv");
      return res.send(csv);
    } else if (format === "excel") {
      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Products");

      // Define the headers for the worksheet
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Price", key: "price", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Category", key: "category", width: 20 },
        { header: "Quantity", key: "quantity", width: 10 },
      ];

      // Add the products data to the worksheet
      products.forEach((product) => {
        worksheet.addRow(product);
      });

      // Set the response content type and attachment header
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment("products.xlsx");

      // Send the Excel file in the response
      return workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } else {
      res.status(400).json({ error: "Invalid export format" });
    }
  } catch (error) {
    console.error("Error exporting products:", error.message);
    return res.status(500).json({ error: "Error exporting products" });
  }
});
router.get("/products", async (req, res) => {
  const { search } = req.query;

  try {
    let query = {};

    if (search) {
      const searchTerm = new RegExp(search, "i");
      query = {
        $or: [{ name: searchTerm }, { category: searchTerm }],
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
        // console.log(supplier);
        // If product quantity is 0, send an out-of-stock email to the supplier

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

    // Check if a product with the same name and supplier already exists
    const existingProduct = await Product.findOne({ name, supplier });

    if (existingProduct) {
      // If a product with the same name and supplier already exists, return an error response
      return res
        .status(400)
        .json({ error: "Product with same name and supplier already exists" });
    }

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

    const supplierdata = await Supplier.findById(savedProduct.supplier);
    // console.log("mail", supplierdata.email);
    const mailOptions = {
      from: company_mail,
      to: supplierdata.email,
      subject: "New Product Created",
      text: `Dear ${supplier.contactName},\n\nA new product named "${name}" has been created and added to your inventory.\n\nThank you for your business!\n\nSincerely,\nThe StockCentral Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    if (savedProduct.quantity === 0) {
      // sendOutOfStockEmail(supplier.email, product.name);
      const mailOptions = {
        from: company_mail,
        to: supplierdata.email,
        subject: "Product Out of Stock",
        text: `Dear Supplier,\n\nWe are writing to inform you that the product "${savedProduct.name}" is currently out of stock. Please send us more stock as soon as possible.\n\nThank you.\n\nBest regards,\nThe StockCentral Team`,
      };

      try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("out of stock Email sent:", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }

    res.json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("supplier");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;

    // Check if a product with the same name and supplier already exists
    const existingProduct = await Product.findOne({
      name: updatedProduct.name,
    });

    if (existingProduct && existingProduct._id.toString() !== id) {
      // If a product with the same name and supplier already exists (excluding the current product being updated), return an error response
      return res.status(400).json({
        error: "Product with the same name already exists",
      });
    }

    const product = await Product.findByIdAndUpdate(id, updatedProduct, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const supplierdata = await Supplier.findById(product.supplier);
    res.json(product);
    console.log(supplierdata);

    // Email content
    const mailOptions = {
      from: company_mail,
      to: supplierdata.email,
      subject: "Product Update Notification",
      text: `Dear Supplier,\n\nYour product '${product.name}' has been updated.\n\nThank you,\nThe StockCentral Team`,
    };

    try {
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent to supplier:", info.response);
    } catch (error) {
      console.error("Error sending email to supplier:", error);
    }
    if (product.quantity === 0) {
      // sendOutOfStockEmail(supplier.email, product.name);
      const mailOptions = {
        from: company_mail,
        to: supplierdata.email,
        subject: "Product Out of Stock",
        text: `Dear Supplier,\n\nWe are writing to inform you that the product "${product.name}" is currently out of stock. Please send us more stock as soon as possible.\n\nThank you.\n\nBest regards,\nThe StockCentral Team`,
      };

      try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("out of stock Email sent:", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by its ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get the supplier ID associated with the product
    const supplierId = product.supplier.toString();

    // Delete the product
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

    // If the supplier is not already deleted, send an email about the product deletion
    const supplierdata = await Supplier.findById(supplierId);
    if (supplierdata) {
      const mailOptions = {
        from: company_mail, // Replace with your company's email address
        to: supplierdata.email, // Supplier's email address
        subject: "Product Deletion",
        text: `Dear Supplier,\n\nWe regret to inform you that the product "${deletedProduct.name}" has been deleted from our inventory, and we no longer require it. If you have any questions or concerns, please feel free to contact us.\n\nBest regards,\nThe StockCentral Team`,
      };

      try {
        // Send the email
        await transporter.sendMail(mailOptions);

        console.log("deletion Email sent successfully");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Multer middleware for handling file uploads
const upload = multer({ dest: "uploads/" });

// Endpoint for bulk import of products from a CSV file
router.post("/products/import", upload.single("file"), async (req, res) => {
  const file = req.file;

  // Check if a file was uploaded
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Determine the file type (CSV or Excel) based on the file extension
  const fileType = file.originalname.endsWith(".csv") ? "csv" : "xlsx";

  try {
    let products;

    // Process the file based on its type
    if (fileType === "csv") {
      // Convert CSV to JSON
      products = await csvtojson().fromFile(file.path);
    } else if (fileType === "xlsx") {
      // Convert Excel to JSON
      products = await convertExcelToJson(file.path);
    } else {
      return res.status(400).json({ error: "Invalid file format" });
    }

    // Validate and transform the data before importing
    const transformedProducts = products.map(async (product) => {
      // Validate and sanitize each product field as needed
      const name = product.Name.trim();
      const category = product.Category.trim();
      const price = parseFloat(product.Price);
      const description = product.Description.trim();
      const quantity = parseInt(product.Quantity);
      const supplierId = product.Supplier.trim();

      // Additional data validation and handling can be done here
      if (
        !name ||
        !category ||
        isNaN(price) ||
        !description ||
        isNaN(quantity) ||
        !ObjectId.isValid(supplierId)
      ) {
        throw new Error(
          "Invalid data format. Please check all fields are provided and in the correct format."
        );
      }

      if (price <= 0 || quantity < 0) {
        throw new Error(
          "Price must be greater than 0 and quantity cannot be negative."
        );
      }

      // Check if the supplier with the given ObjectId exists
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        throw new Error("Supplier not found for the given ObjectId.");
      }

      // Return the transformed product object with fields matching the Product schema
      return {
        name,
        category,
        price,
        description,
        quantity,
        supplier: supplier._id,
      };
    });
    console.log("Transformed Products:", transformedProducts);
    const resolvedProducts = await Promise.all(transformedProducts);
    console.log("resolvedProducts:", resolvedProducts);
    // Check for duplicates based on name and supplier fields and update existing products
    for (const productData of resolvedProducts) {
      const { name } = productData;

      // Check if a product with the same name already exists
      const existingProduct = await Product.findOne({ name });

      if (existingProduct) {
        // If a product with the same name already exists, update the existing product
        await Product.updateOne(
          { _id: existingProduct._id },
          { $set: productData }
        );
      } else {
        // If the product does not exist, create a new product
        const newProduct = new Product(productData);
        const saved = await newProduct.save();
        console.log(saved);
      }
    }
    console.log("Product data imported successfully");

    return res.json({ message: "Product data imported successfully" });
  } catch (error) {
    console.error("Error importing products:", error.message);
    return res.status(500).json({ error: error.message });
  }
});
async function convertExcelToJson(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  // Assuming the suppliers data is in the first sheet of the workbook
  const worksheet = workbook.worksheets[0];

  // Get the dimensions of the worksheet (number of rows and columns)
  const dimensions = worksheet.dimensions.model; // Access the 'model' object within dimensions
  const startRow = dimensions.top; // Access 'top' property of 'model'
  const endRow = dimensions.bottom; // Access 'bottom' property of 'model'
  const startColumn = dimensions.left; // Access 'left' property of 'model'
  const endColumn = dimensions.right;
  // Inside the convertExcelToJson function

  console.log("Sheet Name:", worksheet.name);

  console.log("Dimensions:", dimensions);
  console.log("startRow", startRow);
  console.log("endRow", endRow);
  // console.log("startRow", startRow);

  // ... rest of the code

  // Convert the rows to JSON, omitting empty rows and columns
  const jsonData = [];
  for (let rowNumber = startRow + 1; rowNumber <= endRow; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const rowData = {};

    for (let colNumber = startColumn; colNumber <= endColumn; colNumber++) {
      const cell = row.getCell(colNumber);
      const cellValue = cell.value;

      // Check if the cell is not empty and contains a value
      if (cellValue !== undefined && cellValue !== null) {
        const headerCell = worksheet.getRow(1).getCell(colNumber);
        const headerValue = headerCell.value;
        rowData[headerValue] = cellValue;
      }
    }

    // Skip the row if it contains only empty cells
    if (Object.keys(rowData).length > 0) {
      jsonData.push(rowData);
    }
  }

  console.log("Converted Data:", jsonData);

  return jsonData;
}

module.exports = router;
