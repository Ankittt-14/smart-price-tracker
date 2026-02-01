import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-white/5 border-t border-slate-200 dark:border-white/10 py-12 px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">insights</span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              PriceTracker India
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            India's leading smart price tracking platform. We monitor millions of products across 50+ stores to help you save every single rupee.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Company</h4>
            <ul className="text-sm space-y-2 font-medium">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Support</h4>
            <ul className="text-sm space-y-2 font-medium">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <span className="text-sm">📷</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-200 dark:border-white/10 text-center">
        <p className="text-xs text-slate-500 font-medium">
          © 2024 PriceTracker India. All prices are updated in real-time. We may earn a small commission on purchases via our links.
        </p>
      </div>
    </footer>
  );
};

export default Footer;