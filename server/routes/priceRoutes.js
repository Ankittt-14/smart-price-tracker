const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { protect } = require('../middleware/auth');

router.get('/:productId', protect, priceController.getPriceHistory);
router.post('/check', protect, priceController.checkPrice);

module.exports = router;