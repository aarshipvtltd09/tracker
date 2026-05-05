const nodemailer = require('nodemailer');

// Universal fast config for Gmail on Cloud
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  tls: {
    rejectUnauthorized: false // Skip verification for cloud network compatibility
  },
  connectionTimeout: 10000, // 10s
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Tracker" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: `Your OTP is: ${options.otp}`, // Fallback text
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #6366f1;">Verification Code</h2>
        <p>Your code is: <b style="font-size: 24px;">${options.otp}</b></p>
        <p>Valid for 10 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email Sent Successfully to:', options.email);
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ FATAL Email Error:', error.message);
    if (error.message.includes('auth')) {
      console.error('HINT: Your EMAIL_USER or EMAIL_PASS (App Password) might be wrong.');
    }
    throw error;
  }
};

module.exports = sendEmail;
