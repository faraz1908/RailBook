const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// ✅ 1. CORS
app.use(cors({
  origin: "https://railbook-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ 2. TRUST PROXY (important for Render)
app.set("trust proxy", 1);

// ✅ 3. SESSION FIX
app.use(session({
  secret: process.env.SESSION_SECRET || 'railway_secret_123',
  resave: false,              // ❗ FIXED
  saveUninitialized: false,
  proxy: true,
  cookie: { 
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ✅ 4. Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// ✅ 5. Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));

// ✅ 6. MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ✅ TEST
app.get('/', (req, res) => {
  res.send("Railway API running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server started");
});