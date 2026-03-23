const express = require('express');
const router = express.Router();
const Train = require('../models/Train');
const User = require('../models/User');
const Booking = require('../models/Booking');

// A. DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const totalTrains = await Train.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Real Revenue Calculation
    const bookings = await Booking.find().populate('trainId');
    const totalIncome = bookings.reduce((sum, b) => sum + (b.trainId?.price || 0), 0);

    const graphData = [
      { name: 'Mon', income: 4000 }, { name: 'Tue', income: 3000 },
      { name: 'Wed', income: 5000 }, { name: 'Thu', income: 7000 },
      { name: 'Fri', income: 4500 }, { name: 'Sat', income: 9000 }, { name: 'Sun', income: 12000 }
    ];

    res.json({ totalTrains, totalBookings, totalIncome, graphData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// B. GET ALL TRAINS (Manage Section)
router.get('/all-trains', async (req, res) => {
  try {
    const trains = await Train.find().sort({ createdAt: -1 });
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// C. ADD NEW TRAIN
router.post('/add-train', async (req, res) => {
  try {
    const { trainName, trainNumber, source, destination, departureTime, price } = req.body;
    
    const newTrain = new Train({
      trainName,
      trainNumber,
      source,
      destination,
      departureTime,
      price: Number(price) // Ensuring price is a Number
    });

    await newTrain.save();
    res.status(201).json({ success: true, message: "Train Added Successfully!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// D. GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// E. DELETE TRAIN
router.delete('/trains/:id', async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;