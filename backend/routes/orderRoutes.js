const express = require("express");
const router = express.Router();
const Order = require("../Schema/orderModel"); // Assuming you have the Order model defined
const Cart = require("../Schema/cartSchema");
const nodemailer = require("nodemailer");
const User = require("../Schema//userModel");
const Product = require("../Schema/productModel");
const Supplier = require("../Schema/supplierModel");
const mongoose = require("mongoose");
const {
  sendCustomizedEmailToAdmin,
  sendCustomizedEmail,
  sendCustomizedEmailToSuppliers,
} = require("./mails");
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

// Function to fetch the user name based on userID
const getProductName = async (productID) => {
  try {
    const product = await Product.findById(productID);
    return product ? product.name : "Unknown product";
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product name");
  }
};

const getUserNameAndEmail = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user) {
      return { name: user.name, email: user.email };
    } else {
      return { name: "Unknown User", email: "unknown@example.com" };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user name and email");
  }
};

// Function to fetch supplier emails based on product IDs in items array
const getSupplierEmails = async (items) => {
  try {
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const supplierIds = products.map((product) => product.supplier);
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });
    return suppliers.map((supplier) => supplier.email);
  } catch (error) {
    console.error("Error fetching supplier emails:", error);
    throw new Error("Failed to fetch supplier emails");
  }
};

// Define a function to send email based on order details
const sendEmail = async (order) => {
  console.log("order", order);
  try {
    // Fetch user name
    const { name: userName, email: userEmail } = await getUserNameAndEmail(
      order.userID
    );

    // Fetch supplier emails
    const supplierEmails = await getSupplierEmails(order.items);

    // Define the email content as a plain-text string
    const text = `
Hello,

A new order has been created with the following details:

Order ID: ${order._id}
Customer: ${userName}
Supplier Emails: ${supplierEmails.join(", ")}
Items:
${order.items
  .map((item) => `${getProductName(item._id)} x ${item.quantity}`)
  .join("\n")}
Total Price: ${order.totalPrice}
Thank you for using our service. For more information, please visit our website: https://your_website.com.
    `;

    const recipients = [userEmail, ...supplierEmails, admin_mail].join(", ");

    // Define the email options with the recipients, subject and text content
    const mailOptions = {
      from: "stockcentral.app@gmail.com",
      to: recipients,
      subject: `Order #${order._id} created`,
      text,
    };
    // Send the email using the transporter object
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Route for creating a new order
router.post("/orders", async (req, res) => {
  try {
    const { userID, items, totalPrice } = req.body;
    const orderItems = items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    const order = new Order({
      userID,
      items: orderItems,
      totalPrice,
    });

    const savedOrder = await order.save();
    // Send email notification to admin, user and supplier
    await sendEmail(savedOrder);
    // Clear the cart items for the user
    await Cart.deleteMany({ userId: userID });
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create the order" });
  }
});

// Route for retrieving an order by ID
router.get("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve the order" });
  }
});

// Route for retrieving all orders
router.get("/orders", async (req, res) => {
  const { search } = req.query;
  const ordersPerPage = 3;

  try {
    let query = {};

    if (search) {
      const searchTerm = new RegExp(search, "i");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      query = {
        $or: [
          { userID: new mongoose.Types.ObjectId(search) },
          { orderDate: searchTerm },
          { status: searchTerm },
          { orderID: searchTerm },
        ],
      };
    }

    const totalOrders = await Order.countDocuments(query);
    // console.log("totalOrders", totalOrders);
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    const page = parseInt(req.query.page) || 1;
    let orderQuery = Order.find(query)
      .skip((page - 1) * ordersPerPage)
      .limit(ordersPerPage);

    const orders = await orderQuery.exec();
    console.log("orders", orders);

    return res.json({
      orders: orders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/orders/:id/edit", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (order) {
      res.render("OrderEdit", { order }); // Pass the order object to the OrderEdit view
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve the order" });
  }
});

// Route for updating an order by ID
router.put("/orders/:id/edit", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { customer, product, quantity, userID } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { customer, product, quantity, userID },
      { new: true }
    );
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update the order" });
  }
});

// Route for deleting an order by ID
router.delete("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (deletedOrder) {
      res.json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete the order" });
  }
});

// Route for retrieving orders for a specific user with search and pagination
router.get("/orders/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { search } = req.query;
  const ordersPerPage = 10;

  try {
    let query = { userID: userId };

    if (search) {
      const searchTerm = new RegExp(search, "i");
      query = {
        ...query,
        $or: [
          { orderDate: searchTerm },
          { status: searchTerm },
          { orderID: searchTerm },
        ],
      };
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    const page = parseInt(req.query.page) || 1;
    let orderQuery = Order.find(query)
      .skip((page - 1) * ordersPerPage)
      .limit(ordersPerPage);

    const orders = await orderQuery.exec();

    return res.json({
      orders: orders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Fetch the current order from the database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the status of the order
    order.status = status;
    const updatedOrder = await order.save();

    // Define email content and recipients based on the status
    let emailSubject;
    let emailContent;
    let recipients = [];

    if (status === "delivered") {
      emailSubject = `Order Delivered: Order #${orderId}`;
      emailContent = `Your order with Order ID ${orderId} has been delivered successfully. Thank you for shopping with us!`;
      recipients.push((await getUserNameAndEmail(orderId)).email); // Add user's email
    } else if (status === "Refund initiated") {
      emailSubject = `Refund Initiated: Order #${orderId}`;
      emailContent = `The refund process has been initiated for your order with Order ID ${orderId}. The amount will be refunded to your original payment method. If you have any questions, please contact our support team.`;
      recipients.push((await getUserNameAndEmail(orderId)).email); // Add user's email
    } else {
      emailSubject = `Order Status Updated: Order #${orderId}`;
      emailContent = `The status of your order with Order ID ${orderId} has been updated to "${status}". Thank you for shopping with us!`;
      recipients.push((await getUserNameAndEmail(orderId)).email); // Add user's email
    }

    // Send the emails
    await sendCustomizedEmail(recipients, emailSubject, emailContent);
    await sendCustomizedEmailToAdmin(order.status, orderId, updatedOrder);
    await sendCustomizedEmailToSuppliers(order.status, orderId, updatedOrder);

    res.json({ status: updatedOrder.status });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update the order status" });
  }
});

module.exports = router;
