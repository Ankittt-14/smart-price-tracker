const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.post('/', protect, alertController.createAlert);
router.get('/', protect, alertController.getAlerts);
router.put('/:id', protect, alertController.updateAlert);
router.delete('/:id', protect, alertController.deleteAlert);

module.exports = router;