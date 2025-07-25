const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      city,
      state,
      zipCode,
      creditGoals,
      hearAboutUs,
    } = req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !creditGoals ||
      !hearAboutUs
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hash,
      city,
      state,
      zipCode,
      creditGoals,
      hearAboutUs,
    });

    await user.save(); // <-- Save happens here

    // Generate token after saving
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.firstName, 
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log("JWT Payload:", jwt.decode(token));

    // Send response with token and user info
    res.status(201).json({
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.firstName,
        email: user.email,
      },
    });
    console.log("JWT Payload:", jwt.decode(token));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error registering user", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      userName: user.firstName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.json({
    token,
    user: { id: user._id, username: user.firstName, email: user.email },
  });
};
