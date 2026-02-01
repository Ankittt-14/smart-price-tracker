const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
// const cronService = require('./services/cronService'); // Lazy loaded below

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Middleware
// Normalize FRONTEND_URL to remove trailing slash for CORS check
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

app.use(cors({
    origin: frontendUrl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PriceTracker India Server is Deployed & Running!',
        env_check: {
            mongo: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
            email_user: !!process.env.EMAIL_USER
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PriceTracker India API is running!',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

// Error handler middleware (should be last)
app.use(errorHandler);

// Start cron jobs for automated price checking
// Start cron jobs for automated price checking (Local only)
if (!process.env.VERCEL) {
    try {
        const cronService = require('./services/cronService');
        cronService.startPriceCheckJob();
    } catch (error) {
        console.error('Failed to start cron service:', error.message);
    }
}

// Start server
// Start server if not running in Vercel (Serverless)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
        console.log(`⏰ Cron jobs started for automated price checks`);
    });
}

// Export for Vercel Serverless
module.exports = app;