const express = require("express");
const router = express.Router();
const Payment = require("../Schema/paymentModel");
const nodemailer = require("nodemailer");
const Supplier = require("../Schema/supplierModel");
const admin_mail = "pravalikaattada15@gmail.com";
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

// Create a new payment and send notification email to supplier and admin
router.post("/payments", async (req, res) => {
  try {
    const { supplierId, amount, currency } = req.body;

    // Create a new payment instance
    const newPayment = new Payment({
      supplierId,
      amount,
      currency,
    });

    // Save the payment to the database
    const savedPayment = await newPayment.save();

    // Get the supplier details from the database
    const supplier = await Supplier.findById(supplierId);

    // Send email notification to supplier
    const emailContentSupplier = `Dear ${supplier.name},\n\nThis is to inform you that a payment of ${amount} ${currency} has been credited to your account.\n\nThank you for your business.\n\nBest regards,\nStockCentral`;

    await transporter.sendMail({
      from: "stockcentral.app@gmail.com",
      to: supplier.email,
      subject: "Payment Update",
      text: emailContentSupplier,
    });

    // Send email notification to admin (optional)
    const emailContentAdmin = `A payment of ${amount} ${currency} has been credited to ${supplier.name}'s account (ID: ${supplier._id}).`;

    await transporter.sendMail({
      from: "stockcentral.app@gmail.com",
      to: admin_mail,
      subject: "Payment Update - Admin",
      text: emailContentAdmin,
    });

    res.json(savedPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all payments
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/suppliers/:id/payments", async (req, res) => {
  try {
    const supplierId = req.params.id;

    // Retrieve payments for the specified supplier ID from the database
    const payments = await Payment.find({ supplierId });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/payment", async (req, res) => {
  const { supplierId } = req.query;

  try {
    const payments = await Payment.find({ supplierId });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
