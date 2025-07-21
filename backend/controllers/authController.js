const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      ssn,
      address,
      city,
      state,
      zipCode,
      currentCreditScore,
      goalCreditScore,
      monthlyIncome,
      employmentStatus,
      housingStatus,
      bankruptcyHistory,
      creditGoals,
      hearAboutUs
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already in use' });
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
      dateOfBirth,
      ssn,
      address,
      city,
      state,
      zipCode,
      currentCreditScore,
      goalCreditScore,
      monthlyIncome,
      employmentStatus,
      housingStatus,
      bankruptcyHistory,
      creditGoals,
      hearAboutUs
    });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
};

