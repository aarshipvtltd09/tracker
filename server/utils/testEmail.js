const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('--- Email Configuration Test ---');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '******** (Hidden)' : 'MISSING');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  try {
    console.log('Connecting to Gmail...');
    await transporter.verify();
    console.log('✅ Connection Successful!');

    console.log('Sending Test Email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Tracker Test Email',
      text: 'If you see this, your email configuration is 100% correct!'
    });
    console.log('✅ Test Email Sent Successfully!');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.log('\n--- Troubleshooting ---');
    if (error.message.includes('auth')) {
      console.log('1. Use an APP PASSWORD (not your normal password).');
      console.log('2. Enable 2-Step Verification in your Google Account.');
    } else {
      console.log('Check your internet or firewall settings.');
    }
  }
};

testEmail();
