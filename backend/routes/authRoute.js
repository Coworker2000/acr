const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

function generateJwt(user) {
  // Customize payload as needed
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      // add more fields if needed
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Google OAuth login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateJwt(req.user);
    res.redirect(`${process.env.CLIENT_URL}/plans?token=${token}`);
  }
);


// Logout route
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
