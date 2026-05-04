const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const newGoal = new Goal({
      ...req.body,
      user: req.user.id
    });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedGoal) return res.status(404).json({ message: "Goal not found" });
    res.json(updatedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedGoal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
