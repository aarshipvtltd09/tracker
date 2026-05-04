const Hobby = require('../models/Hobby');

exports.getHobbies = async (req, res) => {
  try {
    const hobbies = await Hobby.find({ user: req.user.id });
    res.json(hobbies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHobby = async (req, res) => {
  try {
    const hobby = new Hobby({
      ...req.body,
      user: req.user.id
    });
    const newHobby = await hobby.save();
    res.status(201).json(newHobby);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateHobby = async (req, res) => {
  try {
    const { timeSpent } = req.body;
    const hobby = await Hobby.findOne({ _id: req.params.id, user: req.user.id });
    if (!hobby) return res.status(404).json({ message: "Hobby not found" });

    hobby.timeSpent += timeSpent;
    hobby.lastPracticed = new Date();
    await hobby.save();
    res.json(hobby);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteHobby = async (req, res) => {
  try {
    const deletedHobby = await Hobby.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedHobby) return res.status(404).json({ message: "Hobby not found" });
    res.json({ message: 'Hobby deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
