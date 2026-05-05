const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 8000, // 8 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email Transporter Error:', error.message);
  } else {
    console.log('✅ Email Transporter Ready');
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Tracker Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">Account Verification</h2>
          <p>Hello,</p>
          <p>Thank you for joining Tracker. Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px;">
            ${options.otp}
          </div>
          <p style="margin-top: 20px;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Powered by Tracker Productivity System</p>
        </div>
      `,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;


