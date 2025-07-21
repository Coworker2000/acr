const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.firstName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Respond with token and user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.firstName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
