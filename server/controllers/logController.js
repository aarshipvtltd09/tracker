const DailyLog = require('../models/DailyLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const newLog = new DailyLog({
      ...req.body,
      user: req.user.id
    });
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const updatedLog = await DailyLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedLog) return res.status(404).json({ message: "Log not found" });
    res.json(updatedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const deletedLog = await DailyLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedLog) return res.status(404).json({ message: "Log not found" });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
