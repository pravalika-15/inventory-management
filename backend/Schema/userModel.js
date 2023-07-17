// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

// const UserSchema = new mongoose.Schema({
//   sub: {
//     type: String,
//     required: true,
//   },
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     default: "",
//   },
//   email: {
//     type: String,
//     required: true,
//     lowercase: true,
//     unique: true,
//     trim: true,
//   },
//   role: {
//     type: Number, // 0-> creator, 1-> student
//     default: 0,
//   },
//   image: {
//     type: String,
//     default: "",
//   },
//   phone: {
//     type: String,
//     default: "+91 1234567890",
//   },
//   createdAt: {
//     type: Number,
//     default: Date.now(),
//   },
//   sessionID: {
//     type: String,
//     default: null,
//   },
// });

// UserSchema.pre("save", function (next) {
//   const user = this;

//   // Generate and assign a session ID
//   const sessionID = jwt.sign({ userID: user._id }, "your-secret-key", {
//     expiresIn: "1h", // Set the expiration time as desired
//   });
//   user.sessionID = sessionID;

//   next();
// });

// const User = mongoose.model("users", UserSchema);

// module.exports = User;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: "+91 1234567890",
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  next();
});

// Compare the provided password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
