const express = require("express");
const app = express();
const port = 3006;
const cors = require("cors");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orderRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productsRoutes");
const userRoutes = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectToDatabase = require("./config/db");

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
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
