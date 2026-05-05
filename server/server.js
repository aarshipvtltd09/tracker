const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7860;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting (Strict only for Auth to prevent Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 mins for login/register
  message: { message: "Too many login attempts, please try again later." }
});
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/hobbies', require('./routes/hobbyRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));

// Database Connection with Retry Logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const dbHost = mongoose.connection.host;
    console.log(`✅ MongoDB Connected (${dbHost})`);
  } catch (err) {
    console.log('❌ MongoDB Connection Error:', err.message);
    console.log('Note: App will run with dummy data if DB is not active.');
  }
};

connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
