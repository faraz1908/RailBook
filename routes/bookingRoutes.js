const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const nodemailer = require('nodemailer');

// --- 📧 EMAIL HELPER FUNCTION ---
const PDFDocument = require('pdfkit'); // Naya package PDF ke liye

// --- 📧 UPDATED EMAIL FUNCTION ---
// --- 📧 UPDATED EMAIL HELPER ---
const sendBookingEmail = async (userEmail, booking, trainDetails, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'faraz1908khan@gmail.com',
        pass: 'xpdk lpnj xdqj xmua' 
      }
    });

    // Agar userName nahi mila toh "Passenger" likha aayega (Undefined nahi!)
    const safeUserName = userName && userName !== "undefined" ? userName : "Passenger";
    const downloadLink = `http://localhost:5000/api/booking/download-pdf/${booking._id}`;

    const mailOptions = {
      from: '"RailBook Premium" <faraz1908khan@gmail.com>',
      to: userEmail,
      subject: `Ticket Confirmed: ${trainDetails.trainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 15px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #0072ff; text-align: center; margin-bottom: 20px;">🚆 RailBook Confirmation</h2>
          <p style="font-size: 16px;">Hello <b>${safeUserName}</b>,</p> 
          <p>Your ticket has <b>successfully confirmed!</b> Please check your journey schedule below:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 6px solid #0072ff;">
            <p style="margin: 8px 0;"><b>Train:</b> ${trainDetails.trainName} (#${trainDetails.trainNumber})</p> 
            <p style="margin: 8px 0; color: #d32f2f; font-size: 1.1rem;"><b>🕒 Departure Time: ${trainDetails.departureTime || 'TBA'}</b></p>
            <p style="margin: 8px 0;"><b>Route:</b> ${trainDetails.source} ➔ ${trainDetails.destination}</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p style="margin: 5px 0;"><b>Passenger:</b> ${booking.passengerName} (${booking.passengerAge} yrs)</p>
            <p style="margin: 5px 0;"><b>Email:</b> ${userEmail}</p>
            <p style="margin: 10px 0; font-size: 18px; color: #0072ff;"><b>Seat Number: ${booking.seatNumber}</b></p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${downloadLink}" style="background: #0072ff; color: white; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              📥 Download E-Ticket (PDF)
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

// --- 📄 PDF DOWNLOAD ROUTE (Add Departure Time here too) ---
router.get('/download-pdf/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trainId');
    const doc = new PDFDocument();
    
    res.setHeader('Content-disposition', `attachment; filename="Ticket_${booking.passengerName}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.fontSize(22).fillColor('#0072ff').text('RailBook E-Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#000').text(`Train: ${booking.trainId.trainName} (#${booking.trainId.trainNumber})`);
    doc.fontSize(16).fillColor('#d32f2f').text(`Departure Time: ${booking.trainId.departureTime || 'N/A'}`); // PDF mein bhi time!
    doc.moveDown();
    doc.fontSize(12).fillColor('#333').text(`Passenger: ${booking.passengerName}`);
    doc.text(`Seat: ${booking.seatNumber}`);
    doc.text(`Route: ${booking.trainId.source} to ${booking.trainId.destination}`);
    
    doc.pipe(res);
    doc.end();
  } catch (err) { res.status(500).send(err.message); }
});

// --- 📄 NAYA ROUTE: DIRECT PDF DOWNLOAD ---
router.get('/download-pdf/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trainId');
    if (!booking) return res.status(404).send("Ticket not found");

    const doc = new PDFDocument();
    const filename = `Ticket_${booking.passengerName}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    // PDF Layout design
    doc.fontSize(25).fillColor('#0072ff').text('RailBook E-Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#000').text(`Passenger Name: ${booking.passengerName}`);
    doc.text(`Age: ${booking.passengerAge}`);
    doc.text(`Seat Number: ${booking.seatNumber}`);
    doc.moveDown();
    doc.text(`Train: ${booking.trainId.trainName} (#${booking.trainId.trainNumber})`);
    doc.text(`Route: ${booking.trainId.source} to ${booking.trainId.destination}`);
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text('Wishing you a happy journey! - Team RailBook', { align: 'center' });

    doc.pipe(res);
    doc.end();

  } catch (err) {
    res.status(500).send("PDF Generation Error");
  }
});

// --- 1. TICKET BOOKING ROUTE ---
router.post('/book-ticket', async (req, res) => {
  try {
    const { trainId, userId, passengerName, passengerAge, userEmail } = req.body;

    // Train check karo
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: "Train nahi mili!" });
    }

    // Seats check karo
    if (train.availableSeats <= 0) {
      return res.status(400).json({ success: false, message: "Afsos! No seats available." });
    }

    // Nayi Booking create karo
    const newBooking = new Booking({
      trainId,
      userId,
      passengerName,
      passengerAge,
      seatNumber: `S-${Math.floor(Math.random() * 60) + 1}`,
      status: 'booked' // Status set karna zaroori hai
    });
    
    await newBooking.save();

    // Train ki seat update karo (Atomic decrease)
    train.availableSeats -= 1;
    await train.save();

    // --- TRIGGER EMAIL ---
    const targetEmail = userEmail || "faraz1908khan@gmail.com";
    // Yahan 3rd argument 'train' dena zaroori tha
    sendBookingEmail(targetEmail, newBooking, train); 

    res.status(201).json({ 
      success: true, 
      message: "Ticket Booked! Check your email. 🎫", 
      booking: newBooking 
    });

  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error: " + err.message });
  }
});

// --- 2. GET USER BOOKINGS ROUTE ---
router.get('/my-bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId: userId }) 
      .populate('trainId')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. CANCEL TICKET ROUTE (Updated to PUT for Status Change) ---
router.put('/cancel-ticket/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking nahi mili!" });
    
    if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: "Ticket pehle hi cancel ho chuki hai." });
    }

    // Seat wapas badhao
    const train = await Train.findById(booking.trainId);
    if (train) {
      train.availableSeats += 1;
      await train.save();
    }

    // Status update karo bajaye Delete karne ke (Data record ke liye)
    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: "Ticket Cancelled! Seat inventory updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Booking Cancel (Delete) Route
router.delete('/cancel/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    // Note: Yahan aap seats wapas increment karne ka logic bhi daal sakte ho
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;