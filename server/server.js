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

// app.use('/api/auth/', authLimiter); // Temporarily disabled to check for delays

// Health Check for Render/Koyeb
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => res.status(200).send('Server is running...'));

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
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50, // Increased pool size
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 (sometimes faster in some networks)
    });
    const dbHost = mongoose.connection.host;
    console.log(`✅ MongoDB Connected (${dbHost})`);
  } catch (err) {
    console.log('❌ MongoDB Connection Error:', err.message);
    console.log('Note: App will run with dummy data if DB is not active.');
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
