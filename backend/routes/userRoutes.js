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
const nodemailer = require("nodemailer");
const admin_mail = "pravalikaattada15@gmail.com";
const company_mail = "stockcentral.app@gmail.com";
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
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res
        .status(400)
        .json({ error: "Username already exists", userExists: true });
    }

    // Check if the email already exists
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res
        .status(400)
        .json({ error: "Email already exists", userExists: true });
    }

    // Check if the phone number already exists
    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser) {
      return res
        .status(400)
        .json({ error: "Phone number already exists", userExists: true });
    }

    // Create a new user
    const newUser = new User({ username, password, phone, email });
    await newUser.save();
    // Send email to admin
    const adminEmailContent = `
      Hello Admin,
      
      A new user has been registered with the following details:
      
      Username: ${username}
      Email: ${email}
      Phone: ${phone}
      
      Regards,
      The StockCentral Team
    `;

    const adminMailOptions = {
      from: company_mail,
      to: admin_mail, // Replace with the admin's email address
      subject: "New User Registration",
      text: adminEmailContent,
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to admin:", error);
      } else {
        console.log("Email sent to admin:", info.response);
      }
    });

    // Send welcome email to user
    const userWelcomeContent = `
      Hello ${username},
      
      Welcome to our website! Thank you for registering with us.
      We're excited to have you on board.
      
      Regards,
      The StockCentral Team
    `;

    const userMailOptions = {
      from: company_mail,
      to: email,
      subject: "Welcome to Our Website",
      text: userWelcomeContent,
    };

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email to user:", error);
      } else {
        console.log("Welcome email sent to user:", info.response);
      }
    });

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

// Get all users
router.get("/users", async (req, res) => {
  const usersPerPage = 12;
  const { search } = req.query;

  try {
    let query = {};

    if (search) {
      const searchTerm = new RegExp(search, "i");
      query = {
        $or: [
          { username: searchTerm },
          { phone: searchTerm },
          { email: searchTerm },
        ],
      };
    }

    // Modify this line
    const totalUsers = await User.countDocuments(query);

    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const page = parseInt(req.query.page) || 1;
    let usersQuery = User.find(query)
      .skip((page - 1) * usersPerPage)
      .limit(usersPerPage);

    const users = await usersQuery.exec();

    return res.json({
      users: users,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, phone } = req.body;

  try {
    // Check if the updated username already exists
    const existingUsernameUser = await User.findOne({
      username,
      _id: { $ne: id },
    });
    if (existingUsernameUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if the updated email already exists
    const existingEmailUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingEmailUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if the updated phone number already exists
    const existingPhoneUser = await User.findOne({ phone, _id: { $ne: id } });
    if (existingPhoneUser) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // If no conflicts, update the user
    const user = await User.findByIdAndUpdate(
      id,
      { username, email, phone },
      { new: true }
    );
    const emailContent = `Hello ${user.username},\n\nYour details have been updated successfully. Here are your updated details:\n\nUsername: ${user.username}\nEmail: ${user.email}\nPhone: ${user.phone}\n\nThank you for using our service! \n\n Regards,
      The StockCentral Team`;

    const MailOptions = {
      from: company_mail,
      to: email,
      subject: "Your details have been updated!",
      text: emailContent,
    };

    transporter.sendMail(MailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email to user:", error);
      } else {
        console.log("Welcome email sent to user:", info.response);
      }
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    // Send the deletion email to the user
    const emailOptions = {
      from: company_mail, // Replace with your email address
      to: user.email, // Use the user's email address
      subject: "Account Deletion Notification",
      text: `Dear ${user.username},\n\nWe are sorry to inform you that your account has been deleted. We apologize for any inconvenience this may have caused. If you have any questions or concerns, please feel free to contact us.\n\nBest regards,\nRegards, The StockCentral Team`,
    };

    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

module.exports = router;
