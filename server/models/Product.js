const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'Product URL is required'],
        trim: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'snapdeal', 'paytm', 'tatacliq', 'shopclues', 'nykaa', 'meesho', 'unknown'],
        lowercase: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    category: {
        type: String,
        default: 'Electronics'
    },
    availability: {
        type: String,
        enum: ['in-stock', 'out-of-stock', 'limited-stock'],
        default: 'in-stock'
    },
    lastChecked: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
productSchema.index({ userId: 1, isActive: 1 });
productSchema.index({ platform: 1 });

module.exports = mongoose.model('Product', productSchema);