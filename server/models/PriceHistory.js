const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    availability: {
        type: Boolean,
        default: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster time-series queries
priceHistorySchema.index({ productId: 1, timestamp: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);