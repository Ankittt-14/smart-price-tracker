import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        Our Mission
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                        We Help You <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                            Save Money Smartly.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        PriceTracker India was built with a simple goal: to stop you from overpaying.
                        We track millions of products 24/7 so you never miss a price drop again.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                    {[
                        { label: 'Products Tracked', value: '1M+' },
                        { label: 'Happy Users', value: '50k+' },
                        { label: 'Money Saved', value: '₹2Cr+' },
                        { label: 'Stores Supported', value: '50+' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                            <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Story Section */}
                <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-6">Built for Smart Shoppers, <br /> by Smart Shoppers.</h2>
                        <div className="space-y-6 text-slate-400 leading-relaxed">
                            <p>
                                We've all been there—buying a gadget only to see its price drop the very next day. It's frustrating.
                                That's why we built <span className="text-primary font-bold">PriceTracker India</span>.
                            </p>
                            <p>
                                Our advanced algorithms monitor prices across Amazon, Flipkart, Myntra, and more, updating every 6 hours.
                                When a price drops, we alert you instantly via Email. No spam, just savings.
                            </p>
                            <div className="pt-4">
                                <Link to="/register" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                    Join the Community <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl rounded-full"></div>
                        <div className="relative bg-black/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">100% Free Forever</h4>
                                    <p className="text-xs text-slate-400">No hidden charges. Just pure value.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <span className="material-symbols-outlined">bolt</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Real-time Updates</h4>
                                    <p className="text-xs text-slate-400">We check prices faster than anyone else.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                    <span className="material-symbols-outlined">lock</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Private & Secure</h4>
                                    <p className="text-xs text-slate-400">Your data is never sold to third parties.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-primary rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-background-dark mb-6">Ready to stop overpaying?</h2>
                        <Link
                            to="/register"
                            className="inline-block bg-background-dark text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                        >
                            Start Tracking Now
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;
