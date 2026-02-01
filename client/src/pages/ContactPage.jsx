import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/support/contact', formData);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white pt-24 pb-12 px-6">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black mb-4">Contact Us</h1>
                    <p className="text-slate-400">Have a question or feedback? We'd love to hear from you.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Message</label>
                            <textarea
                                required
                                rows="5"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white outline-none transition-all resize-none"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center text-slate-500 text-sm">
                    <p>Or email us directly at:</p>
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=masterrajaniket@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline"
                    >
                        masterrajaniket@gmail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
