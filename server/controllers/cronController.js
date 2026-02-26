const cronService = require('../services/cronService');

exports.checkPrices = async (req, res) => {
    try {
        console.log('⏰ Received external cron request...');

        // Ensure that this endpoint can be triggered manually or via an external cron service
        // For additional security, you can verify a secret token passed in headers
        const authHeader = req.headers.authorization;
        const CRON_SECRET = process.env.CRON_SECRET;

        // If a CRON_SECRET is configured, we enforce it to avoid malicious crawling
        if (CRON_SECRET) {
            if (authHeader !== `Bearer ${CRON_SECRET}`) {
                console.warn('Unauthorized cron invocation attempt.');
                return res.status(401).json({ success: false, message: 'Unauthorized execution' });
            }
        }

        // Execute the price check asynchronously (don't force the service to await for it to end, Vercel gives 10-60s execution limit if serverless usually, edge functions vary)
        // Wait for it because Vercel/Railway kills functions soon after response is sent!
        await cronService.checkAllPrices();

        console.log('✅ External price check completed successfully.');
        res.status(200).json({ success: true, message: 'Price checks triggered successfully.' });
    } catch (error) {
        console.error('❌ Error executing external cron job:', error);
        res.status(500).json({ success: false, message: 'Error running price checks', error: error.message });
    }
};
