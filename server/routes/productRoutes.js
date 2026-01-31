const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.post('/', protect, productController.addProduct);
router.get('/public/trending', productController.getTrendingProducts);
router.get('/', protect, productController.getProducts);
router.get('/:id', protect, productController.getProduct);
router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;