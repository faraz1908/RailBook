const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // 🔥 ADD THIS
require('dotenv').config();

const app = express();

// ✅ 1. CORS
app.use(cors({
  origin: "https://railbook-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ 2. TRUST PROXY (Render ke liye zaroori)
app.set("trust proxy", 1);

// ✅ 3. SESSION (🔥 FIXED WITH MONGODB STORE)
app.use(session({
  secret: process.env.SESSION_SECRET || 'railway_secret_123',
  resave: false,
  saveUninitialized: false,
  proxy: true,

  store: MongoStore.create({   // 🔥 MAIN FIX
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),

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

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send("Railway API running...");
});

// ✅ SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});