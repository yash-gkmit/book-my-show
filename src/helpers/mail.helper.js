const nodemailer = require('nodemailer');
const { throwCustomError } = require('./common.helper');
const path = require('path');
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp) => {
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

const sendTransactionEmail = async ({
  to,
  subject,
  templateName,
  templateData,
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      '../templates',
      `${templateName}.ejs`,
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      templateData,
      subject,
    });

    const mailOptions = {
      from: 'yashgupta@gkmit.co',
      to,
      subject,
      html: htmlContent,
    };

    transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    throwCustomError(`Error sending email: ${error}`, 400);
  }
};

module.exports = {
  sendOtpEmail,
  sendTransactionEmail,
};
