const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Yahan galti thi: mongoose.Schema.Types.ObjectId hona chahiye
  trainId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Train', 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  passengerName: { 
    type: String, 
    required: true 
  },
  passengerAge: { 
    type: Number, 
    required: true 
  },
  seatNumber: { 
    type: String 
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    default: 'Confirmed' 
  }
});

module.exports = mongoose.model('Booking', bookingSchema);