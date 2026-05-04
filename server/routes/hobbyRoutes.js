const express = require('express');
const router = express.Router();
const hobbyController = require('../controllers/hobbyController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', hobbyController.getHobbies);
router.post('/', hobbyController.createHobby);
router.patch('/:id', hobbyController.updateHobby);
router.delete('/:id', hobbyController.deleteHobby);

module.exports = router;
