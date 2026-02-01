const axios = require('axios');
const cheerio = require('cheerio');
// Puppeteer is now lazy-loaded to prevent crashing on Vercel where 'puppeteer' package is missing

class ScraperService {
    async scrapeProduct(url) {
        try {
            const platform = this.detectPlatform(url);
            console.log(`🔍 Scraping ${platform} product: ${url}`);

            // 1. Try direct scraping with Cheerio (Fastest)
            console.log('🚀 Attempting fast scrape (Cheerio)...');
            let data = await this.scrapeWithCheerio(url, platform);

            // 2. If Cheerio fails or returns no price, try Puppeteer (Most Reliable)
            if (!data || data.currentPrice === 0) {
                if (data && data.currentPrice === 0) console.info('ℹ️ No price found in fast mode.');
                console.log('🔄 Activating Puppeteer (Advanced Scraper)...');
                data = await this.scrapeWithPuppeteer(url, platform);
            }

            if (data && data.currentPrice > 0) {
                // Ensure platform is set
                data.platform = platform;
                console.log(`✅ Successfully scraped: ${data.name} - ₹${data.currentPrice}`);
                return data;
            }

            // 3. Last Resort Fallback
            return {
                name: `Product from ${platform}`,
                currentPrice: 0,
                imageUrl: null,
                platform: platform,
                originalPrice: 0
            };
        } catch (error) {
            console.error('Final scraping error:', error.message);
            return null;
        }
    }

    async scrapeWithCheerio(url, platform) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                },
                timeout: 10000,
                maxRedirects: 5
            });

            const $ = cheerio.load(response.data);

            // Try JSON-LD first (Most reliable structured data)
            let data = this.parseJsonLd($, platform);
            if (data && data.currentPrice > 0) return data;

            // Platform specific parsing
            switch (platform) {
                case 'amazon': return this.parseAmazon($);
                case 'flipkart': return this.parseFlipkart($);
                case 'myntra': return this.parseMyntra($);
                case 'ajio': return this.parseAjio($);
                case 'snapdeal': return this.parseSnapdeal($);
                case 'tatacliq': return this.parseTataCliq($);
                case 'nykaa': return this.parseNykaa($);
                case 'meesho': return this.parseMeesho($);
                case 'jiomart': return this.parseJioMart($);
                case 'croma': return this.parseCroma($);
                case 'reliancedigital': return this.parseRelianceDigital($);
                default: return this.parseGeneric($, platform);
            }

        } catch (error) {
            if (error.response && (error.response.status === 403 || error.response.status === 503)) {
                console.log(`🔒 Fast scraper blocked (${error.response.status}), switching to advanced mode...`);
            } else {
                console.error(`❌ Cheerio error for ${platform}:`, error.message);
            }
            return null;
        }
    }

    async scrapeWithPuppeteer(url, platform) {
        let browser = null;
        try {
            // Common launch options
            const defaultArgs = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled' // basic stealth
            ];

            // Vercel / Production Environment
            if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.NODE_ENV === 'production') {
                console.log('🚀 Launching Puppeteer Core with Chromium for Serverless...');
                const chromium = require('@sparticuz/chromium');
                const puppeteer = require('puppeteer-core');

                // Optimized args for Vercel/AWS Lambda
                chromium.setGraphicsMode = false; // Ensure headless

                const executablePath = await chromium.executablePath();
                console.log(`ℹ️ Chromium Executable Path: ${executablePath}`);

                browser = await puppeteer.launch({
                    args: [
                        ...chromium.args,
                        '--hide-scrollbars',
                        '--disable-web-security',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process', // Critical for memory constrained envs
                        '--disable-gpu'
                    ],
                    defaultViewport: chromium.defaultViewport,
                    executablePath: executablePath,
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
                    dumpio: true // Log stdout/stderr from browser
                });
                console.log('✅ Browser launched successfully (Serverless Mode)');

            } else {
                // Local Development
                console.log('💻 Launching Puppeteer (Local)...');
                try {
                    const puppeteer = require('puppeteer-extra');
                    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
                    puppeteer.use(StealthPlugin());

                    browser = await puppeteer.launch({
                        headless: "new",
                        args: defaultArgs,
                        executablePath: require('puppeteer').executablePath()
                    });
                } catch (e) {
                    console.warn("Local Puppeteer Extra failed, trying standard puppeteer");
                    const puppeteer = require('puppeteer');
                    browser = await puppeteer.launch({
                        headless: "new",
                        args: defaultArgs
                    });
                }
            }

            const page = await browser.newPage();

            // Block images/css/activex/fonts for speed
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Set User Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 }); // Slightly increased timeout

            // Get page content
            const content = await page.content();
            const $ = cheerio.load(content);

            let data = this.parseJsonLd($, platform);
            if (data && data.currentPrice > 0) return data;

            switch (platform) {
                case 'amazon': data = this.parseAmazon($); break;
                case 'flipkart': data = this.parseFlipkart($); break;
                case 'myntra': data = this.parseMyntra($); break;
                case 'ajio': data = this.parseAjio($); break;
                case 'snapdeal': data = this.parseSnapdeal($); break;
                case 'tatacliq': data = this.parseTataCliq($); break;
                case 'nykaa': data = this.parseNykaa($); break;
                case 'meesho': data = this.parseMeesho($); break;
                case 'jiomart': data = this.parseJioMart($); break;
                case 'croma': data = this.parseCroma($); break;
                case 'reliancedigital': data = this.parseRelianceDigital($); break;
                default: data = this.parseGeneric($, platform);
            }

            return data;

        } catch (error) {
            console.error(`❌ Puppeteer error for ${platform}:`, error.message);
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }

    // --- Parsing Strategies ---

    parseJsonLd($, platform) {
        try {
            let productData = null;
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const json = JSON.parse($(el).html());
                    const items = Array.isArray(json) ? json : (json['@graph'] || [json]);

                    const product = items.find(item =>
                        item['@type'] === 'Product' || item['@type'] === 'SoftwareApplication'
                    );

                    if (product) {
                        const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;

                        if (offer) {
                            productData = {
                                name: product.name,
                                currentPrice: parseFloat(offer.price || offer.highPrice),
                                originalPrice: parseFloat(offer.priceSpecification?.maxPrice || 0),
                                imageUrl: Array.isArray(product.image) ? product.image[0] : (product.image?.url || product.image),
                                platform: platform
                            };
                            return false; // break loop
                        }
                    }
                } catch (e) { /* ignore parse errors */ }
            });
            return productData;
        } catch (e) {
            return null;
        }
    }

    parseAmazon($) {
        try {
            const name = $('#productTitle').text().trim() ||
                $('h1 span#productTitle').text().trim() ||
                $('span.product-title-word-break').text().trim();

            let priceText = $('.a-price-whole').first().text() ||
                $('.a-price .a-offscreen').first().text() ||
                $('#priceblock_ourprice').text() ||
                $('#priceblock_dealprice').text();

            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));

            const originalPriceText = $('.a-text-price .a-offscreen').first().text() ||
                $('#priceblock_saleprice').text();
            let originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : 0;

            // Sanity check: Original price shouldn't be astronomically larger than current price (e.g. > 20x)
            if (currentPrice > 0 && originalPrice > currentPrice * 20) {
                originalPrice = 0;
            }

            const imageUrl = $('#landingImage').attr('data-old-hires') ||
                $('#landingImage').attr('src') ||
                $('.a-dynamic-image').first().attr('src');

            return {
                name: name || 'Amazon Product',
                currentPrice: currentPrice || 0,
                originalPrice: originalPrice,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Amazon Product', currentPrice: 0 }; }
    }

    parseFlipkart($) {
        try {
            const name = $('.B_NuCI').text().trim() || $('.VU-ZEz').text().trim() || $('h1').text().trim();

            const priceText = $('._30jeq3._16Jk6d').text() || $('._30jeq3').first().text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));

            const originalPriceText = $('._3I9_wc._2p6lqe').text() || $('._3I9_wc').first().text();
            const originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : null;

            const imageUrl = $('._396cs4._2amPTt img').attr('src') || $('img._2r_T1I').attr('src');

            return {
                name: name || 'Flipkart Product',
                currentPrice: currentPrice || 0,
                originalPrice: originalPrice,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Flipkart Product', currentPrice: 0 }; }
    }

    parseMyntra($) {
        try {
            const name = $('.pdp-title').text().trim() || $('h1.pdp-title').text().trim();
            const priceText = $('.pdp-price strong').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.image-grid-image').attr('src');

            return {
                name: name || 'Myntra Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Myntra Product', currentPrice: 0 }; }
    }

    parseAjio($) {
        try {
            const name = $('h1.prod-title').text().trim();
            const priceText = $('.prod-sp').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.product-image img').attr('src');

            return {
                name: name || 'Ajio Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Ajio Product', currentPrice: 0 }; }
    }

    parseSnapdeal($) {
        try {
            const name = $('h1.pdp-e-i-head').text().trim();
            const priceText = $('.payBlkBig').text() || $('.pdp-final-price').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.cloudzoom').attr('src') || $('.pdp-image-gallery-small').first().attr('src');

            return {
                name: name || 'Snapdeal Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Snapdeal Product', currentPrice: 0 }; }
    }

    parseTataCliq($) {
        try {
            const name = $('.ProductDescriptionPage__productName').text().trim() || $('h1').text().trim();
            const priceText = $('.ProductDetailsMainCard__price').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            // TataCliq often lazy loads, relies heavily on JSON-LD, but trying selector:
            const imageUrl = $('.ImageGallery__image img').attr('src');

            return {
                name: name || 'Tata CLiQ Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Tata CLiQ Product', currentPrice: 0 }; }
    }

    parseNykaa($) {
        try {
            const name = $('.product-title').text().trim() || $('h1').text().trim();
            const priceText = $('.css-1jczs19').text() || $('.post-card__content-price-offer').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.css-12ydk9l img').attr('src');

            return {
                name: name || 'Nykaa Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Nykaa Product', currentPrice: 0 }; }
    }

    parseMeesho($) {
        try {
            const name = $('h1').text().trim();
            const priceText = $('h4').text(); // Valid for current Meesho layout
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('img').first().attr('src');

            return {
                name: name || 'Meesho Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Meesho Product', currentPrice: 0 }; }
    }

    parseJioMart($) {
        try {
            const name = $('#pdp_product_name').text().trim();
            const priceText = $('#pdp_product_price').text() || $('.price-box .price').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.large-image img').attr('src');

            return {
                name: name || 'JioMart Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'JioMart Product', currentPrice: 0 }; }
    }

    parseCroma($) {
        try {
            const name = $('h1.pd-title').text().trim();
            const priceText = $('.new-price').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('#0image').attr('src');

            return {
                name: name || 'Croma Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Croma Product', currentPrice: 0 }; }
    }

    parseRelianceDigital($) {
        try {
            const name = $('h1.pdp__title').text().trim();
            const priceText = $('.pdp__offerPrice').text();
            const currentPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
            const imageUrl = $('.pdp__mainImg').attr('src');

            return {
                name: name || 'Reliance Digital Product',
                currentPrice: currentPrice || 0,
                originalPrice: 0,
                imageUrl: imageUrl || null
            };
        } catch (e) { return { name: 'Reliance Digital Product', currentPrice: 0 }; }
    }

    parseGeneric($, platform) {
        try {
            const name = $('h1').first().text().trim() || $('title').text().trim();
            const priceElements = $('body').text().match(/(?:₹|Rs\.?|INR)\s*([\d,]+)/i);
            const currentPrice = priceElements ? parseInt(priceElements[1].replace(/,/g, '')) : 0;

            return {
                name: name || `${platform} Product`,
                currentPrice: currentPrice,
                originalPrice: 0,
                imageUrl: null
            };
        } catch (e) { return { name: 'Product', currentPrice: 0 }; }
    }

    detectPlatform(url) {
        if (!url) return 'unknown';
        const u = url.toLowerCase();
        if (u.includes('amazon')) return 'amazon';
        if (u.includes('flipkart')) return 'flipkart';
        if (u.includes('myntra')) return 'myntra';
        if (u.includes('ajio')) return 'ajio';
        if (u.includes('snapdeal')) return 'snapdeal';
        if (u.includes('tatacliq')) return 'tatacliq';
        if (u.includes('nykaa')) return 'nykaa';
        if (u.includes('meesho')) return 'meesho';
        if (u.includes('jiomart')) return 'jiomart';
        if (u.includes('croma')) return 'croma';
        if (u.includes('reliancedigital')) return 'reliancedigital';
        return 'unknown';
    }
}

module.exports = new ScraperService();