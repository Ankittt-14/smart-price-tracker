const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

// Define route
router.get('/check-prices', cronController.checkPrices);
// Also support POST just in case external systems try to trigger using post
router.post('/check-prices', cronController.checkPrices);

module.exports = router;
