const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const scraperService = require('../services/scraperService');

// @desc    Add new product to track
// @route   POST /api/products
// @access  Private
exports.addProduct = async (req, res) => {
    try {
        const { url, name, currentPrice, imageUrl, platform } = req.body;

        let productData;

        // If manual data provided, use it directly
        if (name && currentPrice && platform) {
            productData = {
                name,
                currentPrice: parseFloat(currentPrice),
                imageUrl: imageUrl || null,
                platform: platform.toLowerCase(),
                originalPrice: parseFloat(currentPrice) // Can be updated later
            };
        } else if (url) {
            // Try to scrape (with fallback)
            try {
                productData = await scraperService.scrapeProduct(url);

                if (!productData) {
                    // Scraping failed, create with minimal info
                    productData = {
                        name: 'Product from ' + new URL(url).hostname,
                        currentPrice: 0,
                        imageUrl: null,
                        platform: scraperService.detectPlatform(url),
                        originalPrice: 0
                    };
                }
            } catch (scrapeError) {
                console.error('Scraping failed:', scrapeError.message);

                // Extract platform from URL
                const detectedPlatform = scraperService.detectPlatform(url);

                productData = {
                    name: `Product from ${detectedPlatform}`,
                    currentPrice: 0,
                    imageUrl: null,
                    platform: detectedPlatform,
                    originalPrice: 0
                };
            }
        } else {
            return res.status(400).json({ message: 'Please provide either URL or product details' });
        }

        // Create product
        const product = await Product.create({
            userId: req.user._id,
            ...productData,
            url: url || '#'
        });

        // Create initial price history entry ONLY if price > 0
        if (product.currentPrice > 0) {
            try {
                await PriceHistory.create({
                    productId: product._id,
                    price: product.currentPrice
                });
            } catch (historyError) {
                console.error('Price history creation error:', historyError.message);
                // Continue even if price history fails
            }
        }

        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all products for user
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({
            userId: req.user._id,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product belongs to user
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get price history
        let priceHistory = [];
        try {
            priceHistory = await PriceHistory.find({
                productId: product._id
            }).sort({ timestamp: 1 });
        } catch (historyError) {
            console.error('Price history fetch error:', historyError);
            // Return product even if history fails
        }

        res.json({ product, priceHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending/latest products (Public)
// @route   GET /api/products/public/trending
// @access  Public
exports.getTrendingProducts = async (req, res) => {
    try {
        // Filter out invalid/incomplete products
        const products = await Product.find({
            isActive: true,
            currentPrice: { $gt: 0 },
            imageUrl: { $ne: null, $ne: '' },
            platform: { $nin: ['unknown', 'other'] },
            name: { $not: { $regex: /^Product from/ } } // Exclude generic names
        })
            .sort({ createdAt: -1 })
            .limit(12)
            .select('name currentPrice originalPrice imageUrl platform url createdAt');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product.isActive = false;
        await product.save();

        res.json({ message: 'Product removed from tracking' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update fields
        if (req.body.name) product.name = req.body.name;
        if (req.body.currentPrice) {
            const newPrice = parseFloat(req.body.currentPrice);
            if (newPrice !== product.currentPrice) {
                // Add to price history
                try {
                    await PriceHistory.create({
                        productId: product._id,
                        price: newPrice
                    });
                } catch (historyError) {
                    console.error('Price history error:', historyError);
                }
                product.currentPrice = newPrice;
            }
        }
        if (req.body.imageUrl) product.imageUrl = req.body.imageUrl;

        product.lastChecked = Date.now();
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};