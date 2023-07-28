const express = require("express");
const app = express();
const port = 3006;
const cors = require("cors");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orderRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productsRoutes");
const paymentRoutes = require("./routes/paymentsRoutes");
const orderPaymentRoutes = require("./routes/orderPaymentRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectToDatabase = require("./config/db");
const razorpay = require("razorpay");

// Call the function to connect and fetch collections
connectToDatabase();
const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
});
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

require("./config/Passport");
require("./Schema/customerModel");
require("./Schema/orderModel");
require("./Schema/productModel");
require("./Schema/supplierModel");
require("./Schema/userModel");
require("./Schema/paymentModel");
require("./Schema/orderPaymentModel");

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // the details we wish to get from the user
  })
);

// after giving the consent, handling call back function
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/home");
  }
);

// Connecting to the database
app.use(cors());
app.use(bodyParser.json());
app.use("/api", cors(), orderRoutes);
app.use("/api", cors(), supplierRoutes);
app.use("/api", cors(), productRoutes);
app.use("/api", cors(), userRoutes);
app.use("/api", cors(), paymentRoutes);
app.use("/api", cors(), cartRoutes);
app.use("/api", cors(), orderPaymentRoutes);
const instance = new razorpay({
  key_id: "rzp_test_v0t2cnfncCAg3M", // Replace with your actual API key
  key_secret: "HR5BMEELdzxoYrXmNMskFqfw", // Replace with your actual API secret
});

app.post("/api/payments", async (req, res) => {
  try {
    console.log(req.body);
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: "order_receipt", // Replace with your receipt identifier
      payment_capture: 1,
    };

    const response = await instance.orders.create(options);

    res.json({ order: response });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
