import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
// Header and Footer are global now
import { productService, alertService } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState('');
  const [creatingAlert, setCreatingAlert] = useState(false);

  useEffect(() => {
    if (id === 'demo') {
      // Demo data
      setProduct({
        _id: 'demo',
        name: 'Apple iPhone 15 (128GB) - Blue',
        currentPrice: 65999,
        originalPrice: 79900,
        imageUrl: 'https://m.media-amazon.com/images/I/71657TiFeHL._SX679_.jpg',
        platform: 'amazon',
        url: 'https://amazon.in/demo',
        createdAt: new Date(),
        lastChecked: new Date(),
        isActive: true
      });
      setPriceHistory([
        { date: 'OCT 01', price: 68000, timestamp: '2024-10-01' },
        { date: 'OCT 08', price: 67500, timestamp: '2024-10-08' },
        { date: 'OCT 15', price: 72900, timestamp: '2024-10-15' },
        { date: 'OCT 22', price: 69200, timestamp: '2024-10-22' },
        { date: 'OCT 31', price: 65999, timestamp: '2024-10-31' },
        { date: 'NOV 05', price: 65999, timestamp: '2024-11-05' }
      ]);
      setLoading(false);
    } else {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const data = await productService.getProduct(id);
      setProduct(data.product);

      const formattedHistory = data.priceHistory.map(item => ({
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.price,
        timestamp: item.timestamp
      }));
      setPriceHistory(formattedHistory);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAlert = async (e) => {
    e.preventDefault();
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      toast.error('Please enter a valid target price');
      return;
    }

    setCreatingAlert(true);
    try {
      await alertService.createAlert({
        productId: product._id,
        targetPrice: parseFloat(targetPrice)
      });
      toast.success('Price alert created successfully!');
      setTargetPrice('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create alert');
    } finally {
      setCreatingAlert(false);
    }
  };

  const calculateDiscount = () => {
    if (!product?.originalPrice || !product?.currentPrice) return 0;
    return Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);
  };

  const getLowestPrice = () => {
    if (priceHistory.length === 0) return product?.currentPrice || 0;
    return Math.min(...priceHistory.map(h => h.price));
  };

  const getHighestPrice = () => {
    if (priceHistory.length === 0) return product?.currentPrice || 0;
    return Math.max(...priceHistory.map(h => h.price));
  };

  const getAveragePrice = () => {
    if (priceHistory.length === 0) return product?.currentPrice || 0;
    const sum = priceHistory.reduce((acc, h) => acc + h.price, 0);
    return Math.round(sum / priceHistory.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-bold tracking-wider">Loading Product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        <div className="text-center">
          <div className="text-slate-500 text-6xl mb-4">❌</div>
          <p className="text-xl">Product not found</p>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Header is global */}

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400">
          <a href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 line-clamp-1 max-w-md">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Image & Pricing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Image Card */}
            <div className="bg-white rounded-3xl p-8 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span className="material-symbols-outlined text-9xl text-slate-200">image</span>
              )}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase border border-white/10">
                {product.platform}
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-black text-white">₹{product.currentPrice?.toLocaleString()}</span>
                {product.originalPrice > product.currentPrice && (
                  <div className="mb-2">
                    <span className="text-lg text-slate-500 line-through mr-2">₹{product.originalPrice?.toLocaleString()}</span>
                    <span className="text-primary font-bold">{discount}% OFF</span>
                  </div>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Updated {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - new Date(product.lastChecked)) / (1000 * 60 * 60)), 'hour')}
              </p>

              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Buy on {product.platform}
              </a>
            </div>
          </div>

          {/* RIGHT: Charts & Analysis */}
          <div className="lg:col-span-7 space-y-6">

            {/* Chart Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-[400px] relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">ssid_chart</span>
                  Price History
                </h3>
                <div className="flex gap-2 text-xs font-bold">
                  <button className="px-3 py-1 bg-white/10 rounded-full text-white">Last 30 Days</button>
                </div>
              </div>

              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#13ec5b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ color: '#13ec5b' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#13ec5b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-6xl mb-4 opacity-50">bar_chart_4_bars</span>
                  <p>Not enough data yet</p>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Lowest</p>
                <p className="text-2xl font-black text-primary">₹{getLowestPrice().toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Highest</p>
                <p className="text-2xl font-black text-slate-300">₹{getHighestPrice().toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Average</p>
                <p className="text-2xl font-black text-blue-400">₹{getAveragePrice().toLocaleString()}</p>
              </div>
            </div>

            {/* Alert Set Section */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-3xl p-6 border border-primary/20">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Set Price Alert</h3>
                  <p className="text-sm text-slate-400">Get notified when it drops below:</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">notifications_active</span>
              </div>

              <form onSubmit={handleSetAlert} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={`Target Price (< ₹${product.currentPrice})`}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={creatingAlert}
                  className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  {creatingAlert ? 'Saving...' : 'Set Alert'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
      {/* Footer is global */}
    </div>
  );
};

export default ProductDetailPage;