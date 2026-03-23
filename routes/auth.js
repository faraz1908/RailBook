const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // 👈 Ye add karo
const router = express.Router();

const FRONTEND_URL = "https://railbook-frontend.vercel.app";
const JWT_SECRET = process.env.JWT_SECRET || "udaipur_secret_key"; // Env mein daal dena

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    // 1. User data se Token banao
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 2. Token ko URL parameter mein bhej do
    res.redirect(`${FRONTEND_URL}?token=${token}`);
  }
);

router.get('/logout', (req, res) => {
  // Client side se localStorage clear karna hoga, bas redirect kar do
  res.redirect(FRONTEND_URL);
});

router.get('/login/success', async (req, res) => {
  // Ab hum Headers se token uthayenge, session se nahi
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // User model import hona chahiye yahan (const User = require('../models/User'))
    const User = require('../models/User'); 
    const user = await User.findById(decoded.id);
    
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
});

module.exports = router;