const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let user = await User.findOne({ email });
    
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires
      });
    }

    try {
      await sendEmail({
        email: user.email,
        subject: 'Tracker - Verify Your Account',
        otp: otp
      });
      res.status(201).json({ message: 'OTP sent to your email. Valid for 10 mins.' });
    } catch (emailErr) {
      console.error('Email Error:', emailErr);
      res.status(201).json({ 
        message: 'Account created but email failed. Try "Resend OTP".',
        email: user.email 
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Tracker - Your New OTP',
      otp: otp
    });

    res.json({ message: 'New OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'User not found' });

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: 'Email not verified',
        isVerified: false,
        email: user.email 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Email not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Tracker - Reset Password OTP',
      otp: otp
    });

    res.json({ message: 'Reset OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

