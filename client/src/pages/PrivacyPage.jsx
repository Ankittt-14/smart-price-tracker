import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
                <p className="text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
                    <p className="text-slate-300">
                        We collect basic information required to provide our services, specifically your email address for account creation and price alert notifications. We do not sell your personal data to third parties.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Data</h2>
                    <p className="text-slate-300">
                        Your data is used solely for:
                    </p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-2">
                        <li>Sending you price drop alerts.</li>
                        <li>Managing your account and preferences.</li>
                        <li>Improving our service performance.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">3. Cookies</h2>
                    <p className="text-slate-300">
                        We use essential cookies to keep you logged in and remember your preferences. These are necessary for the website to function properly.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">4. Contact Us</h2>
                    <p className="text-slate-300">
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:masterrajaniket@gmail.com" className="text-primary">masterrajaniket@gmail.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
