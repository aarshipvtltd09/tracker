const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', logController.getLogs);
router.post('/', logController.createLog);
router.patch('/:id', logController.updateLog);
router.delete('/:id', logController.deleteLog);

module.exports = router;
