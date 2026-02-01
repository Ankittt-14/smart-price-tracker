import React from 'react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
                <p className="text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
                    <p className="text-slate-300">
                        By accessing and using PriceTracker India, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">2. Use of Service</h2>
                    <p className="text-slate-300">
                        Our service allows you to track prices of products from various e-commerce websites. You agree to use this service only for personal, non-commercial purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">3. Disclaimer</h2>
                    <p className="text-slate-300">
                        PriceTracker India is not affiliated with any of the e-commerce stores we track. Product prices and availability are accurate as of the date/time indicated and are subject to change.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">4. Termination</h2>
                    <p className="text-slate-300">
                        We reserve the right to terminate your access to the site without cause or notice.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
