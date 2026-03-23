const express = require('express');
const passport = require('passport');
const router = express.Router();

// ✅ Google Login
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 🔥 FIX: direct frontend pe bhej
    res.redirect('https://railbook-frontend.vercel.app');
  }
);

// ✅ Logout FIX
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('https://railbook-frontend.vercel.app'); // ❗ FIXED
  });
});

// ✅ Login Success
router.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "User authenticated",
      user: req.user,
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Not Authorized"
    });
  }
});

module.exports = router;