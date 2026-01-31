const PriceHistory = require('../models/PriceHistory');
const Product = require('../models/Product');
const scraperService = require('../services/scraperService');

// @desc    Get price history for a product
// @route   GET /api/prices/:productId
// @access  Private
exports.getPriceHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const history = await PriceHistory.find({
            productId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manual price check
// @route   POST /api/prices/check
// @access  Private
exports.checkPrice = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newPrice = await scraperService.checkPrice(product.url);

        if (newPrice) {
            product.currentPrice = newPrice;
            product.lastChecked = Date.now();
            await product.save();

            await PriceHistory.create({
                productId: product._id,
                price: newPrice
            });

            res.json({ message: 'Price updated', newPrice });
        } else {
            res.status(400).json({ message: 'Unable to fetch price' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};