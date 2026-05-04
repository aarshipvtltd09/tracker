const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

router.use(protect); // All routes below this will be protected

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
