const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter inside for better serverless compatibility
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Helps with some cloud network issues
    }
  });

  const mailOptions = {
    from: `"Tracker Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Account Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px;">
          ${options.otp}
        </div>
        <p style="margin-top: 20px;">This code will expire in 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Powered by Tracker Productivity System</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email Sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;



