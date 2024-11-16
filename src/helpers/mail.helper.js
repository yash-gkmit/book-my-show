const nodemailer = require('nodemailer');
const { throwCustomError } = require('./common.helper');

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Account Verification Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
    throwCustomError('Failed to send OTP email', 403);
  }
};

exports.sendTransactionEmail = async ({
  to,
  subject,
  description,
  movie_name,
  show_time,
  show_date,
  booking_date,
  total_amount,
  total_gst,
  amount_paid,
  booking_status,
}) => {
  const emailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: `
      <h1>${subject}</h1>
      <p>${description}</p>
      <p><strong>Movie:</strong> ${movie_name}</p>
      <p><strong>Show Time:</strong> ${show_time}</p>
      <p><strong>Show Date:</strong> ${show_date}</p>
      <p><strong>Booking Date:</strong> ${new Date(booking_date).toLocaleString()}</p>
      <p><strong>Total Amount:</strong> ₹${total_amount}</p>
      <p><strong>Total GST:</strong> ₹${total_gst}</p>
      <p><strong>Amount Paid:</strong> ₹${amount_paid}</p>
      <p><strong>Booking Status:</strong> ${booking_status}</p>
    `,
  };

  await transporter.sendMail(emailOptions);
};
