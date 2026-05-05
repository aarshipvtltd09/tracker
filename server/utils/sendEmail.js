const nodemailer = require('nodemailer');

// Global transporter with pooling for speed
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL is faster than TLS (587) for Gmail in many cases
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Keep connections open
  maxConnections: 3,
  socketTimeout: 5000,
  connectionTimeout: 5000,
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Tracker Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Verification Code</h2>
        <p>Hello,</p>
        <p>Your verification code for Tracker is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px;">
          ${options.otp}
        </div>
        <p style="margin-top: 20px;">This code is valid for 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Tracker Productivity System</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;




