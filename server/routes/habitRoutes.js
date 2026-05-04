const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.patch('/track', habitController.trackHabit);

module.exports = router;
