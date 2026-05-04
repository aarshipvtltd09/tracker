const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  plannedTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  notes: { type: String },
  mood: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 604800 }, // Auto-delete after 7 days
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
