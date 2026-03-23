const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // Password sirf tab chahiye jab user manually register kare
  password: { 
    type: String, 
    required: function() {
      return !this.googleId; // Agar googleId nahi hai, toh password zaroori hai
    }
  },
  // googleId optional kar di taaki manual user bhi save ho sake
  googleId: { 
    type: String,
    required: false 
  },
  avatar: { 
    type: String,
    default: "https://ui-avatars.com/api/?name=User" // Default avatar agar user upload na kare
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);