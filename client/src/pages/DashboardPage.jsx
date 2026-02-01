import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Header and Footer are global now
import { productService, authService } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  // Form states
  const [productUrl, setProductUrl] = useState('');
  const [manualForm, setManualForm] = useState({
    name: '',
    currentPrice: '',
    platform: 'amazon',
    imageUrl: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductByUrl = async (e) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      toast.error('Please enter a product URL');
      return;
    }

    setAddingProduct(true);
    try {
      const newProduct = await productService.addProduct(productUrl);
      toast.success('Product added successfully!');
      setProducts([newProduct, ...products]);
      setProductUrl('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setAddingProduct(false);
    }
  };

  const handleAddManualProduct = async (e) => {
    e.preventDefault();

    if (!manualForm.name || !manualForm.currentPrice || !manualForm.platform) {
      toast.error('Please fill all required fields');
      return;
    }

    setAddingProduct(true);
    try {
      const newProduct = await productService.addProduct('', manualForm);
      toast.success('Product added successfully!');
      setProducts([newProduct, ...products]);
      setManualForm({ name: '', currentPrice: '', platform: 'amazon', imageUrl: '' });
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;

    try {
      await productService.deleteProduct(id);
      toast.success('Product removed!');
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeAlerts = products.filter(p => p.isActive).length;
  const totalSavings = products.reduce((sum, p) => {
    return sum + (p.originalPrice ? p.originalPrice - p.currentPrice : 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-bold tracking-wider">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Header is global */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              Dashboard <span className="text-primary text-base px-3 py-1 bg-primary/10 rounded-full">v2.0</span>
            </h1>
            <p className="text-slate-400 text-lg">Good to see you, {user?.name}. Here's your tracking overview.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/10 flex items-center gap-2 backdrop-blur-md"
          >
            <span className="material-symbols-outlined">add</span>
            Add Manually
          </button>
        </div>

        {/* Stats Cards - Glass Effect */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Total Products', value: totalProducts, icon: 'inventory_2', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Alerts', value: activeAlerts, icon: 'notifications_active', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Total Savings', value: `₹${totalSavings.toLocaleString()}`, icon: 'savings', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Platforms', value: [...new Set(products.map(p => p.platform))].length, icon: 'hub', color: 'text-purple-400', bg: 'bg-purple-500/10' }
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <span className="material-symbols-outlined text-6xl">{stat.icon}</span>
              </div>
              <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add Product Section - Floating Glass */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden mb-16">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500"></div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rocket_launch</span>
                Quick Track
              </h3>
              <p className="text-slate-400">Paste any product URL from Amazon, Flipkart, Myntra, or Nykaa.</p>
            </div>

            <div className="flex-[2] w-full">
              <form onSubmit={handleAddProductByUrl} className="relative group">
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-40 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-black/40 transition-all text-white outline-none"
                  disabled={addingProduct}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">link</span>

                <button
                  type="submit"
                  disabled={addingProduct}
                  className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {addingProduct ? (
                    <span className="flex items-center gap-2"><span className="animate-spin material-symbols-outlined text-sm">refresh</span> Fetching...</span>
                  ) : 'Track Price'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          Your Tracked Items
          <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-slate-300 font-normal">{products.length}</span>
        </h2>

        {products.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-16 border-2 border-dashed border-white/10 text-center hover:border-white/20 transition-colors">
            <span className="material-symbols-outlined text-slate-600 text-8xl mb-6 block">shopping_cart_checkout</span>
            <h3 className="text-2xl font-bold mb-3">No products yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Start building your watchlist by adding a product URL above. We'll handle the rest!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">

                {/* Image Area */}
                <div className="relative aspect-[4/3] bg-white rounded-xl mb-4 overflow-hidden p-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-slate-200">photo_camera</div>
                  )}

                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-white/10">
                    {product.platform}
                  </div>

                  {product.originalPrice > product.currentPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                      {Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg mb-1 leading-snug line-clamp-2 h-14 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-end gap-2 mb-4">
                  <span className="text-2xl font-black text-white">₹{product.currentPrice?.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/product/${product._id}`}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-all text-center text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    Details
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2.5 rounded-lg transition-all text-center text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Updated: {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - new Date(product.lastChecked)) / (1000 * 60 * 60)), 'hour')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Manual Add Modal - Glass Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full shadow-2xl transform transition-all scale-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                Add Manually
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddManualProduct} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Product Name</label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Price (₹)</label>
                  <input
                    type="number"
                    value={manualForm.currentPrice}
                    onChange={(e) => setManualForm({ ...manualForm, currentPrice: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Platform</label>
                  <select
                    value={manualForm.platform}
                    onChange={(e) => setManualForm({ ...manualForm, platform: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white transition-all outline-none appearance-none"
                    required
                  >
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="myntra">Myntra</option>
                    <option value="nykaa">Nykaa</option>
                    <option value="snapdeal">Snapdeal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Image URL</label>
                <input
                  type="url"
                  value={manualForm.imageUrl}
                  onChange={(e) => setManualForm({ ...manualForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 text-white transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingProduct}
                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
              >
                {addingProduct ? 'Adding...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer is global */}
    </div>
  );
};

export default DashboardPage;