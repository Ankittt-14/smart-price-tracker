const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

// Models must be registered before use
require('./models/User');
require('./models/Product');
require('./models/PriceHistory');
require('./models/Alert');

const cronService = require('./services/cronService');

const manualCheck = async () => {
    try {
        console.log('🔌 Connecting to Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        console.log('🚀 Starting Manual Price Check...');
        await cronService.checkAllPrices();

        console.log('✨ All Done! Check your email if you had valid alerts.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

manualCheck();
