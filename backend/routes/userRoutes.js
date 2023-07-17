// const express = require("express");
// const router = express.Router();
// const User = require("../schema/UserModel"); // Assuming you have the Order model defined

// router.post("/users", async (req, res) => {
//   try {
//     console.log("request");
//     console.log(req.body);
//     const { sub, given_name, family_name, email, picture } = req.body;
//     const existingUser = await User.findOne({ sub });

//     if (existingUser) {
//       return res.status(409).json({ error: "User already exists" });
//     }

//     const user = new User({ sub, given_name, family_name, email, picture });
//     const savedUser = await user.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ error: "Failed to create the user" });
//   }
// });
// router.get("/users/:googleID", async (req, res) => {
//   try {
//     const googleID = req.params.googleID;
//     const user = await User.findOne({ googleID });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error("Error retrieving user:", error);
//     res.status(500).json({ error: "Failed to retrieve the user" });
//   }
// });

// module.exports = router;

//////////////////////////////////////////////////////////

const express = require("express");
const router = express.Router();
const User = require("../Schema/userModel"); // Replace with the correct path to your userSchema file
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token with an expiration time of 1 day
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "2d",
    });
    console.log("Token expiration time:", jwt.decode(token).exp);
    console.log(Date.now() * 1000);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, phone, email } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username already exists", userExists: true });
    }

    // Create a new user
    const newUser = new User({ username, password, phone, email });
    await newUser.save();

    // Generate a JWT token with an expiration time of 1 day
    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", {
      expiresIn: "1d",
    });
    console.log("Token expiration time:", jwt.decode(token).exp);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

module.exports = router;
