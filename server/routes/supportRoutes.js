const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/contact', supportController.sendFeedback);

module.exports = router;
