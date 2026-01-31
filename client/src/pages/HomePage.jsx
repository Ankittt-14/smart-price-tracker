import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { productService } from '../services/api';

const HomePage = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await productService.getTrendingProducts();
        setTrending(data);
      } catch (error) {
        console.error('Failed to load trending products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background-dark text-white overflow-hidden">
      <Header />

      {/* Hero Section with Floating Animation */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">

        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>

        <div className="text-center mb-24 relative z-10">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-bounce">
            <span className="text-primary font-bold">✨ New v2.0 Released</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Track Prices. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Save Big Money.
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop checking websites every day. We monitor 50+ stores like Amazon, Flipkart, Myntra, and Nykaa 24/7 for you.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="group bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 transform hover:-translate-y-1"
            >
              Start Tracking Free
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              to="/product/demo"
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-10 rounded-xl transition-all border border-white/10 backdrop-blur-sm hover:border-white/20"
            >
              See Live Demo
            </Link>
          </div>
        </div>

        {/* Live Community Tracker (Trending) */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-white/10 flex-1"></div>
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Live Community Tracker 🔴</h2>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-10">Loading live data...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((product) => (
                <a
                  key={product._id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-2xl p-4 transition-all hover:-translate-y-2 duration-300"
                >
                  <div className="relative aspect-square rounded-xl bg-white p-4 mb-4 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md uppercase">
                      {product.platform}
                    </div>
                  </div>
                  <h3 className="font-bold text-white line-clamp-1 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-primary">₹{product.currentPrice.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">Just added</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Features Grid with Glassmorphism */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: 'notifications_active', title: 'Instant Alerts', desc: 'Get email notifications within seconds of a price drop.' },
            { icon: 'trending_down', title: 'Price History', desc: 'See the cheapest time to buy with our advanced charts.' },
            { icon: 'bolt', title: 'Lightning Fast', desc: 'Our scrapers check prices every 6 hours automatically.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/10">
              <span className="material-symbols-outlined text-primary text-5xl mb-6 block">{feature.icon}</span>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;