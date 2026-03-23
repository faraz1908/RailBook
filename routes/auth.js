const express = require('express');
const passport = require('passport');
const router = express.Router();

const FRONTEND_URL = "https://railbook-frontend.vercel.app";

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(FRONTEND_URL);
  });
});

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(403).json({ success: false, message: "Not Authorized" });
  }
});

module.exports = router;