const express = require("express");
const router = express.Router();
const Supplier = require("../Schema/supplierModel");
const admin_mail = "pravalikaattada15@gmail.com";
const company_mail = "stockcentral.app@gmail.com";
const nodemailer = require("nodemailer");
const Product = require("../Schema/productModel");
const multer = require("multer");
const csvtojson = require("csvtojson");
const xlsxtojson = require("xlsx-to-json");
const ExcelJS = require("exceljs");
// Set up the multer storage for file upload
const upload = multer({ dest: "uploads/" });
const xlsx = require("xlsx");

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
// Get all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10; // Number of items per page

    // Construct the search query
    const searchQuery = {};
    if (req.query.search) {
      searchQuery.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { contactName: { $regex: req.query.search, $options: "i" } },
        // Add more fields for searching, if needed
      ];
    }

    // Fetch suppliers with pagination and search
    const totalSuppliers = await Supplier.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalSuppliers / itemsPerPage);
    const suppliers = await Supplier.find(searchQuery)
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    // res.json({ suppliers, totalPages });
    return res.json({
      suppliers: suppliers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving suppliers:", error);
    res.status(500).json({ error: "Failed to retrieve suppliers" });
  }
});

// Create a new supplier
// Send a welcome email to the supplier
const sendWelcomeEmail = async (supplier) => {
  try {
    // Compose the email
    const mailOptions = {
      from: company_mail,
      to: supplier.email,
      subject: "Welcome to Our Supplier Platform",
      text: `Dear ${supplier.name},\n\nWelcome to our supplier platform! We are excited to have you on board as a supplier. Thank you for joining us.\n\nBest regards,\nYour StockCentral Team`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", supplier.email);
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// Export suppliers data in CSV or Excel format
router.get("/suppliers/export", async (req, res) => {
  const format = req.query.format;

  if (format === "csv") {
    try {
      // Fetch the supplier data from the database
      const suppliers = await Supplier.find();

      // Convert the supplier data to CSV format
      const csv = suppliers
        .map((supplier) => Object.values(supplier).join(","))
        .join("\n");

      // Set the response content type and attachment header
      res.setHeader("Content-Type", "text/csv");
      res.attachment("suppliers.csv");

      // Send the CSV file in the response
      return res.send(csv);
    } catch (error) {
      console.error("Error exporting suppliers:", error.message);
      return res.status(500).json({ error: "Error exporting suppliers" });
    }
  } else if (format === "excel") {
    try {
      // Fetch the supplier data from the database
      const suppliers = await Supplier.find();

      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Suppliers");

      // Define the headers for the worksheet
      worksheet.columns = [
        { header: "ID", key: "_id", width: 10 },
        { header: "Name", key: "name", width: 20 },
        { header: "Contact Name", key: "contactName", width: 20 },
        { header: "Phone Number", key: "phoneNumber", width: 15 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Email", key: "email", width: 30 },
        { header: "Address", key: "address", width: 30 },
        { header: "Payment Status", key: "paymentStatus", width: 20 },
      ];

      // Add the suppliers data to the worksheet
      suppliers.forEach((supplier) => {
        worksheet.addRow(supplier);
      });

      // Set the response content type and attachment header
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment("suppliers.xlsx");

      // Send the Excel file in the response
      return workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } catch (error) {
      console.error("Error exporting suppliers:", error.message);
      return res.status(500).json({ error: "Error exporting suppliers" });
    }
  } else {
    res.status(400).json({ error: "Invalid export format" });
  }
});

// Function to send an email to the supplier
async function sendEmailToSupplier(supplier) {
  try {
    // Send an email with defined transport object
    let info = await transporter.sendMail({
      from: company_mail, // Sender email address
      to: supplier.email, // Receiver email address (supplier's email)
      subject: "Supplier Details Updated", // Subject of the email
      text: `Dear ${supplier.name},\n\nYour details have been updated successfully. Here are the updated details:\n\nName: ${supplier.name}\nContact Name: ${supplier.contactName}\nPhone Number: ${supplier.phoneNumber}\nEmail: ${supplier.email}\nAddress: ${supplier.address}\nAmount: ${supplier.amount}\nPayment Status: ${supplier.paymentStatus}\n\nThank you for being a valued supplier.\n\nBest Regards,\nStockCentral`, // Email content
    });

    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

router.post("/suppliers", async (req, res) => {
  try {
    const { name, contactName, phoneNumber, email, address, amount } = req.body;

    // Check if a supplier with the same email or phone number already exists
    const existingSupplierWithEmail = await Supplier.findOne({ email });
    const existingSupplierWithPhoneNumber = await Supplier.findOne({
      phoneNumber,
    });

    if (existingSupplierWithEmail || existingSupplierWithPhoneNumber) {
      return res.status(400).json({
        error: "Supplier with the same email or phone number already exists",
      });
    }

    const newSupplier = new Supplier({
      name,
      contactName,
      phoneNumber,
      email,
      address,
      amount,
    });

    const savedSupplier = await newSupplier.save();

    // Send the welcome email to the new supplier
    sendWelcomeEmail(savedSupplier);

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
router.put("/suppliers/:id/payment", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { amount, paymentStatus } = req.body;
    // Determine the payment status based on the amount
    // const paymentStatus = amount === 0 ? "Payment Done" : "Payment Pending";

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { amount, paymentStatus },
      { new: true }
    );

    if (updatedSupplier) {
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    console.error("Error updating supplier payment:", error);
    res.status(500).json({ error: "Failed to update supplier payment" });
  }
});

// Route for updating a supplier

router.put("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = req.params.id;
    console.log(req.body);
    const { name, contactName, phoneNumber, email, address, amount } = req.body;

    // Determine the payment status based on the amount
    const paymentStatus = amount === 0 ? "Payment Done" : "Payment Pending";

    // Check if a supplier with the same email or phone number already exists
    const existingSupplierWithEmail = await Supplier.findOne({ email });
    const existingSupplierWithPhoneNumber = await Supplier.findOne({
      phoneNumber,
    });

    if (
      existingSupplierWithEmail &&
      existingSupplierWithEmail._id.toString() !== supplierId
    ) {
      return res.status(400).json({
        error: "Supplier with the same email already exists",
      });
    }

    if (
      existingSupplierWithPhoneNumber &&
      existingSupplierWithPhoneNumber._id.toString() !== supplierId
    ) {
      return res.status(400).json({
        error: "Supplier with the same phone number already exists",
      });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { name, contactName, phoneNumber, email, address, amount, paymentStatus },
      { new: true }
    );

    if (updatedSupplier) {
      // Send an email to the supplier with the updated details
      sendEmailToSupplier(updatedSupplier);
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
      // Delete all products associated with the supplier
      const deletedProducts = await Product.deleteMany({
        supplier: supplierId,
      });
      console.log("deleted products", deletedProducts);
      const mailOptions = {
        from: company_mail,
        to: deletedSupplier.email,
        subject: "Cancellation of Supplier Contract",
        text: "Dear Supplier, \n\nWe regret to inform you that we no longer require your products and have decided to cancel our supplier contract. \n\nThank you for your services until now. \n\nBest regards, \nStockCentral",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.json({
        message: "Supplier and associated products deleted successfully",
      });
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete the supplier" });
  }
});

// Supplier bulk import endpoint
router.post("/suppliers/import", upload.single("file"), async (req, res) => {
  const file = req.file;

  // Check if a file was uploaded
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Determine the file type (CSV or Excel) based on the file extension
  const fileType = file.originalname.endsWith(".csv") ? "csv" : "xlsx";

  // Process the file based on its type
  try {
    if (fileType === "csv") {
      // Parse the CSV file
      const data = await csvtojson().fromFile(file.path);
      console.log(data);

      // Perform data validation and transformation as needed
      const suppliers = data.map((supplier) => {
        // Example: Map CSV fields to Supplier model fields
        return {
          name: supplier.name,
          contactName: supplier.contactName,
          phoneNumber: supplier.phoneNumber,
          amount: Number(supplier.amount),
          email: supplier.email,
          address: supplier.address,
          paymentStatus: supplier.paymentStatus,
        };
      });

      // Bulk insert the suppliers to the database
      await Supplier.insertMany(suppliers);

      return res.json({ message: "Suppliers data imported successfully" });
    } else if (fileType === "xlsx") {
      // Parse the Excel file
      // Convert Excel to JSON
      data = await convertExcelToJson(file.path);
      console.log("data", data);
      // Perform data validation and transformation as needed
      const suppliers = data.map((supplier) => {
        // Example: Map Excel fields to Supplier model fields
        return {
          name: supplier.name,
          contactName: supplier.contactName,
          phoneNumber: supplier.phoneNumber,
          amount: Number(supplier.amount),
          email: supplier.email,
          address: supplier.address,
          paymentStatus: supplier.paymentStatus,
        };
      });

      // Bulk insert the suppliers to the database
      await Supplier.insertMany(suppliers);

      return res.json({ message: "Suppliers data imported successfully" });
    } else {
      return res.status(400).json({ error: "Invalid file format" });
    }
  } catch (error) {
    console.error("Error importing suppliers:", error.message);
    return res.status(500).json({ error: "Error importing suppliers" });
  }
});

// Function to convert Excel file to JSON using exceljs
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
