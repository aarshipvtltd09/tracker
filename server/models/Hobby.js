const mongoose = require('mongoose');

const hobbySchema = new mongoose.Schema({
  name: { type: String, required: true },
  timeSpent: { type: Number, default: 0 }, // in minutes
  lastPracticed: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Hobby', hobbySchema);
