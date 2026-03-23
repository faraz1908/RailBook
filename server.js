const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// ✅ 1. CORS Setup
app.use(cors({
  origin: "https://railbook-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ 2. Proxy Trust (Render ke liye TOP par)
app.set("trust proxy", 1);

// ✅ 3. Session Config
app.use(session({
  secret: process.env.SESSION_SECRET || 'railway_secret_123',
  resave: true, 
  saveUninitialized: false,
  proxy: true,
  cookie: { 
    secure: true,      // HTTPS compulsory
    sameSite: 'none',  // Cross-domain cookies
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// ✅ 4. Passport Initialize
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// ✅ 5. Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));

// ✅ 6. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

app.get('/', (req, res) => {
  res.send("Railway API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});