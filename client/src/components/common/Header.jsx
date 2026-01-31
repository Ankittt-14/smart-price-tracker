import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">insights</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PriceTracker <span className="text-primary">India</span>
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/product/demo" className="text-sm font-medium hover:text-primary transition-colors">
              Demo
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 justify-end items-center gap-4 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Search products..."
              type="text"
            />
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="size-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-white/20 cursor-pointer hover:border-primary transition-colors"
              >
                <img
                  alt="User profile"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=13ec5b&color=102216&bold=true`}
                  className="w-full h-full object-cover"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-white/10 shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="material-symbols-outlined text-sm mr-2 align-middle">dashboard</span>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors text-red-400"
                  >
                    <span className="material-symbols-outlined text-sm mr-2 align-middle">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all whitespace-nowrap"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;