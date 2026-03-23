const express = require('express');
const router = express.Router();
const Train = require('../models/Train');


router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const trains = await Train.find({
      source: { $regex: new RegExp(from, "i") },
      destination: { $regex: new RegExp(to, "i") }
    });
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: "Search Error" });
  }
});

module.exports = router;
