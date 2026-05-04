const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.get('/', protect, goalController.getGoals);
router.post('/', protect, goalController.createGoal);
router.put('/:id', protect, goalController.updateGoal);
router.delete('/:id', protect, goalController.deleteGoal);

module.exports = router;
