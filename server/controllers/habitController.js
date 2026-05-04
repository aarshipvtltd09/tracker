const Habit = require('../models/Habit');

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      user: req.user.id
    });
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.trackHabit = async (req, res) => {
  try {
    const { id, date } = req.body;
    const habit = await Habit.findOne({ _id: id, user: req.user.id });
    
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    if (habit.completedDates.includes(date)) {
      habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
      habit.completedDates.push(date);
    }

    habit.completedDates.sort();
    habit.streak = habit.completedDates.length; 

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
