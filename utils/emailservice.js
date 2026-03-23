const nodemailer = require('nodemailer');

const sendBookingEmail = async (userEmail, bookingDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // 👈 Tera Gmail
        pass: 'your-app-password'     // 👈 Google App Password (Normal password nahi)
      }
    });

    const mailOptions = {
      from: '"Railway Connect" <your-email@gmail.com>',
      to: userEmail,
      subject: 'Ticket Confirmation - Railway Connect 🎫',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #00f2ff; border-radius: 10px;">
          <h2 style="color: #0072ff;">Booking Successful!</h2>
          <p>Hi, your ticket has been confirmed.</p>
          <hr/>
          <p><b>Passenger:</b> ${bookingDetails.passengerName}</p>
          <p><b>Seat Number:</b> ${bookingDetails.seatNumber}</p>
          <p><b>Train ID:</b> ${bookingDetails.trainId}</p>
          <hr/>
          <p>Thank you for traveling with us!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = sendBookingEmail;