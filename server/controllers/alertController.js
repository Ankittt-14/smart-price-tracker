const Alert = require('../models/Alert');

// @desc    Create price alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = async (req, res) => {
    try {
        const { productId, targetPrice } = req.body;

        const alert = await Alert.create({
            userId: req.user._id,
            productId,
            targetPrice
        });

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ 
            userId: req.user._id, 
            isActive: true 
        }).populate('productId');

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private
exports.updateAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        if (alert.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        alert.targetPrice = req.body.targetPrice || alert.targetPrice;
        alert.isActive = req.body.isActive !== undefined ? req.body.isActive : alert.isActive;
        
        await alert.save();

        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        if (alert.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        alert.isActive = false;
        await alert.save();

        res.json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};