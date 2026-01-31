const cron = require('node-cron');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Alert = require('../models/Alert');
const scraperService = require('./scraperService');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class CronService {
    startPriceCheckJob() {
        // Run every 6 hours: 0 */6 * * *
        // For testing, use: */5 * * * * (every 5 minutes)
        cron.schedule('0 */6 * * *', async () => {
            console.log('⏰ Running automated price check...');
            await this.checkAllPrices();
        });

        console.log('✅ Cron job scheduled: Price checks every 6 hours');
    }

    async checkAllPrices() {
        try {
            const products = await Product.find({ isActive: true }).limit(50);
            console.log(`📦 Checking ${products.length} products...`);

            for (const product of products) {
                try {
                    await this.delay(2000); // 2 second delay between requests

                    const scrapedData = await scraperService.scrapeProduct(product.url);
                    const newPrice = scrapedData ? scrapedData.currentPrice : null;

                    if (newPrice && newPrice !== product.currentPrice) {
                        // Update product price
                        const oldPrice = product.currentPrice;
                        product.currentPrice = newPrice;
                        product.lastChecked = Date.now();
                        await product.save();

                        // Add to price history
                        await PriceHistory.create({
                            productId: product._id,
                            price: newPrice
                        });

                        console.log(`✓ Price updated for ${product.name}: ₹${newPrice}`);
                    } else {
                        product.lastChecked = Date.now();
                        await product.save();
                        console.log(`✓ No change for ${product.name}`);
                    }

                    // Check alerts regardless of price change (to catch new alerts)
                    if (newPrice) {
                        await this.checkAlerts(product._id, newPrice, product.currentPrice);
                    }
                } catch (error) {
                    console.error(`Error checking ${product.name}:`, error.message);
                }
            }

            console.log('✅ Price check completed');
        } catch (error) {
            console.error('Error in price check job:', error);
        }
    }

    async checkAlerts(productId, newPrice, oldPrice) {
        try {
            const alerts = await Alert.find({
                productId,
                isActive: true,
                emailSent: false
            }).populate('userId productId');

            for (const alert of alerts) {
                if (newPrice <= alert.targetPrice) {
                    await this.sendPriceDropEmail(alert, newPrice, oldPrice);
                    alert.emailSent = true;
                    alert.triggeredAt = Date.now();
                    await alert.save();
                }
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }

    async sendPriceDropEmail(alert, newPrice, oldPrice) {
        try {
            const user = alert.userId;
            const product = alert.productId;
            const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `🎉 Price Drop Alert: ${product.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #13ec5b;">Price Drop Alert! 🎉</h2>
                        <p>Great news, ${user.name}!</p>
                        <p>The price of <strong>${product.name}</strong> has dropped!</p>

                        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin: 10px auto; display: block;">` : ''}
                        
                        
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Old Price:</strong> <span style="text-decoration: line-through;">₹${oldPrice.toLocaleString()}</span></p>
                            <p style="margin: 5px 0;"><strong>New Price:</strong> <span style="color: #13ec5b; font-size: 24px; font-weight: bold;">₹${newPrice.toLocaleString()}</span></p>
                            <p style="margin: 5px 0;"><strong>You Save:</strong> ₹${(oldPrice - newPrice).toLocaleString()} (${discount}% OFF)</p>
                        </div>
                        
                        <a href="${product.url}" style="display: inline-block; background: #13ec5b; color: #102216; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                            Buy Now
                        </a>
                        
                        <p style="margin-top: 30px; color: #666; font-size: 12px;">
                            You're receiving this because you set a price alert on PriceTracker India.
                        </p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`✓ Email sent to ${user.email} for ${product.name}`);
        } catch (error) {
            console.error('Error sending email:', error.message);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new CronService();