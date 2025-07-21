const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  creditGoals: String,
  hearAboutUs: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
