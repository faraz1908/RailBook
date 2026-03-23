const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const user = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const app = express(); 
// 1. Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());

// 2. Session Setup
app.use(session({
  secret: 'railway_secret_123',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// 3. Passport Setup
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/booking' , bookingRoutes);

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log(" MongoDB Connection Error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send("Railway API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});