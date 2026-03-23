const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainName: { type: String, required: true },
  trainNumber: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: String, default: "10:30 PM" }, // 🕒 Time Field
  price: { type: Number, required: true },            // 💰 Price Field
  availableSeats: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);