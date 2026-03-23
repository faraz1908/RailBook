const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// 🔥 Live URL for PDF Links
const LIVE_BACKEND_URL = "https://railbook-3mys.onrender.com";

const sendBookingEmail = async (userEmail, booking, trainDetails, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'faraz1908khan@gmail.com',
        pass: 'xpdk lpnj xdqj xmua' 
      }
    });

    const safeUserName = userName && userName !== "undefined" ? userName : "Passenger";
    // ❗ FIXED: Localhost ko Live URL se replace kiya
    const downloadLink = `${LIVE_BACKEND_URL}/api/booking/download-pdf/${booking._id}`;

    const mailOptions = {
      from: '"RailBook Premium" <faraz1908khan@gmail.com>',
      to: userEmail,
      subject: `Ticket Confirmed: ${trainDetails.trainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 15px; padding: 25px;">
          <h2 style="color: #0072ff; text-align: center;">🚆 RailBook Confirmation</h2>
          <p>Hello <b>${safeUserName}</b>, Your ticket is confirmed!</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; border-left: 5px solid #0072ff;">
            <p><b>Train:</b> ${trainDetails.trainName} (#${trainDetails.trainNumber})</p>
            <p style="color: #d32f2f;"><b>🕒 Departure: ${trainDetails.departureTime}</b></p>
            <p><b>Seat:</b> ${booking.seatNumber}</p>
          </div>
          <div style="text-align: center; margin-top: 25px;">
            <a href="${downloadLink}" style="background: #0072ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              📥 Download E-Ticket (PDF)
            </a>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (error) { console.error("❌ Email Error:", error); }
};

// --- PDF DOWNLOAD ROUTE ---
router.get('/download-pdf/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trainId');
    if (!booking) return res.status(404).send("Ticket not found");

    const doc = new PDFDocument();
    res.setHeader('Content-disposition', `attachment; filename="Ticket_${booking.passengerName}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.fontSize(25).fillColor('#0072ff').text('RailBook E-Ticket', { align: 'center' });
    doc.moveDown().fontSize(14).fillColor('#000');
    doc.text(`Passenger: ${booking.passengerName}`);
    doc.text(`Seat: ${booking.seatNumber}`);
    doc.text(`Train: ${booking.trainId.trainName} (#${booking.trainId.trainNumber})`);
    doc.text(`Route: ${booking.trainId.source} ➔ ${booking.trainId.destination}`);
    doc.text(`Departure: ${booking.trainId.departureTime}`);
    doc.end();
    doc.pipe(res);
  } catch (err) { res.status(500).send("PDF Generation Error"); }
});

// --- BOOK TICKET ---
router.post('/book-ticket', async (req, res) => {
  try {
    const { trainId, userId, passengerName, passengerAge, userEmail } = req.body;
    const train = await Train.findById(trainId);
    if (!train || train.availableSeats <= 0) return res.status(400).json({ success: false, message: "No seats available" });

    const newBooking = new Booking({
      trainId, userId, passengerName, passengerAge,
      seatNumber: `S-${Math.floor(Math.random() * 60) + 1}`,
      status: 'booked'
    });
    
    await newBooking.save();
    train.availableSeats -= 1;
    await train.save();

    sendBookingEmail(userEmail || "faraz1908khan@gmail.com", newBooking, train, passengerName); 

    res.status(201).json({ success: true, message: "Ticket Booked! 🎫", booking: newBooking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;