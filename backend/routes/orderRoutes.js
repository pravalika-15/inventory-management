const express = require("express");
const router = express.Router();
const Order = require("../Schema/orderModel"); // Assuming you have the Order model defined
const Cart = require("../Schema/cartSchema");
const nodemailer = require("nodemailer");
const User = require("../Schema//userModel");
const Product = require("../Schema/productModel");
const Supplier = require("../Schema/supplierModel");
const mongoose = require("mongoose");
const { startOfDay, endOfDay, parseISO } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");
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
    console.log("product", product.name);
    if (product) {
      return product.name;
    } else {
      return "Unknown product";
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product name");
  }
};

const getUserNameAndEmail = async (userID) => {
  try {
    const user = await User.findById(userID);
    // console.log("user", user);
    if (user) {
      return { name: user.username, email: user.email };
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
${await Promise.all(
  order.items.map(async (item) => {
    const productName = await getProductName(item.product);
    console.log("productName", productName);
    return `${productName} x ${item.quantity}`;
  })
).join("\n")}
Total Price: ${order.totalPrice}
Thank you for using our service. For more information, please visit our website: https://sensational-muffin-3ff308.netlify.app.
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
  const { search, date } = req.query;

  const ordersPerPage = 12;

  try {
    let query = {};

    if (search) {
      const searchTerm = new RegExp(search, "i");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      query = {
        $or: [
          {
            userID: isObjectId
              ? new mongoose.Types.ObjectId(search)
              : undefined,
          },
          // {
          //   orderDate: isObjectId ? undefined : orderDateCondition,
          // },
          { status: searchTerm },
          {
            orderID: isObjectId
              ? new mongoose.Types.ObjectId(search)
              : new RegExp(search, "i"), // Use a regular expression for partial matches
          },
        ],
      };
    }
    if (date) {
      // If the date parameter is provided, convert it to a date object and extract the date part
      const dateObject = new Date(date);
      if (!isNaN(dateObject)) {
        // Set the query to match the selected date (without considering the time)
        query.orderDate = {
          $gte: dateObject.toISOString(), // Start of the selected date (00:00:00)
          $lt: new Date(dateObject.getTime() + 86400000).toISOString(), // End of the selected date (23:59:59)
        };
      }
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

// Route for retrieving orders for a specific user with search, date, and pagination
router.get("/orders/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { search, date } = req.query;
  console.log(req.query);
  console.log("search", search);
  console.log("date", date);
  const ordersPerPage = 10;

  try {
    let query = { userID: userId };

    if (search || date) {
      const conditions = [];

      if (search) {
        const searchTerm = new RegExp(search, "i");
        conditions.push({
          $or: [{ status: searchTerm }, { orderID: searchTerm }],
        });
      }

      if (date) {
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);
        console.log(startDate);
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);
        console.log(endDate);
        conditions.push({ orderDate: { $gte: startDate, $lte: endDate } });
      }

      query = { ...query, $and: conditions };
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

// for analytics

// Route for getting product sales data
router.get("/product-sales", async (req, res) => {
  try {
    const pipeline = [
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 0,
          product: "$productDetails.name",
          totalQuantitySold: 1,
        },
      },
      {
        $sort: { totalQuantitySold: -1 },
      },
    ];

    const productSales = await Order.aggregate(pipeline);
    res.json(productSales);
  } catch (error) {
    console.error("Error fetching product sales data:", error);
    res.status(500).json({ error: "Failed to fetch product sales data" });
  }
});

router.get("/customer-orders", async (req, res) => {
  try {
    const pipeline = [
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$userID",
          totalQuantityOrdered: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { totalQuantityOrdered: -1 },
      },
    ];

    const customerOrders = await Order.aggregate(pipeline);
    res.json(customerOrders);
  } catch (error) {
    console.error("Error fetching customer order data:", error);
    res.status(500).json({ error: "Failed to fetch customer order data" });
  }
});

router.get("/monthly-revenue/:year", async (req, res) => {
  try {
    let year = req.params.year
      ? parseInt(req.params.year)
      : new Date().getFullYear();

    if (isNaN(year)) {
      // Handle the case where the year parameter is not a valid number
      year = new Date().getFullYear(); // Set default to current year
    }
    console.log(year);
    const pipeline = [
      {
        $match: {
          orderDate: {
            $gte: new Date(year, 0, 1), // Start of the year
            $lt: new Date(year + 1, 0, 1), // Start of the next year
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDate" } },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ];

    const monthlyRevenue = await Order.aggregate(pipeline);
    res.json(monthlyRevenue);
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    res.status(500).json({ error: "Failed to fetch monthly revenue data" });
  }
});

// Route for fetching monthly order count data
router.get("/monthly-order-count/:year", async (req, res) => {
  try {
    const { year } = req.params;

    const pipeline = [
      {
        $match: {
          orderDate: {
            $gte: new Date(year, 0, 1), // Start of the year
            $lt: new Date(year + 1, 0, 1), // Start of the next year
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDate" } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ];

    const monthlyOrderCount = await Order.aggregate(pipeline);
    res.json(monthlyOrderCount);
  } catch (error) {
    console.error("Error fetching monthly order count data:", error);
    res.status(500).json({ error: "Failed to fetch monthly order count data" });
  }
});

// Route to get order analytics for a user by user ID and year
router.get("/order-analytics/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log("userId", userId);
    const year = new Date().getFullYear();

    const orders = await Order.find({
      userID: userId,
      orderDate: {
        $gte: new Date(year, 0, 1), // Start of the year
        $lt: new Date(year + 1, 0, 1), // Start of the next year
      },
    });

    const orderCountByMonth = new Array(12).fill(0);

    orders.forEach((order) => {
      const month = order.orderDate.getMonth();
      orderCountByMonth[month] += 1;
    });

    res.json(orderCountByMonth);
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    res.status(500).json({ error: "Failed to fetch order analytics" });
  }
});

module.exports = router;
