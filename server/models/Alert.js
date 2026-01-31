const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    targetPrice: {
        type: Number,
        required: [true, 'Target price is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    triggeredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for active alerts
alertSchema.index({ userId: 1, isActive: 1 });
alertSchema.index({ productId: 1, isActive: 1 });

module.exports = mongoose.model('Alert', alertSchema);