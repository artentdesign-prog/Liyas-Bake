import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Sun, Moon, Shield, X, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { siteData } = useData();
  const location = useLocation();

  const logoUrl = siteData.settings.logoUrl || '/logo.jpg';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Special Orders', path: '/special-orders' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 bg-white/40 dark:bg-chocolate-950/60 backdrop-blur-md border-b border-white/50 dark:border-gold-500/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          id="nav-brand-logo"
          className="flex items-center gap-3 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-md group-hover:scale-105 transition-transform duration-300 bg-[#FFF9F3] flex items-center justify-center shrink-0">
            <img
              src={logoUrl}
              alt="Liya's Bake Logo"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#3E2723] dark:text-cream-50 group-hover:text-gold-600 transition-colors leading-tight">
              {siteData.settings.siteName || "Liya's Bake"}
            </span>
            <span className="text-[10px] tracking-widest uppercase font-medium text-gold-600 dark:text-gold-400">
              • Baked with Love •
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold bg-white/50 dark:bg-chocolate-800/40'
                    : 'text-[#3E2723]/80 dark:text-cream-200 hover:text-[#D4AF37] dark:hover:text-gold-400 hover:bg-white/30 dark:hover:bg-chocolate-800/30'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <a
            href="/#store-directions-guide"
            id="nav-link-directions"
            className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-400/30 transition-all inline-flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Way to Bakery</span>
          </a>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-full bg-white/50 dark:bg-chocolate-800/80 text-[#3E2723] dark:text-gold-300 hover:text-gold-600 transition-colors border border-white/60 dark:border-gold-500/20 shadow-xs cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            id="nav-admin-login-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#3E2723] text-white dark:bg-gold-500 dark:text-chocolate-950 hover:opacity-90 shadow-md transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Admin Panel' : 'Admin Login'}</span>
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            id="mobile-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-cream-100 dark:bg-chocolate-800 text-chocolate-800 dark:text-gold-300 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-chocolate-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-chocolate-800 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/50 dark:border-gold-500/20 bg-white/70 dark:bg-chocolate-950/90 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-white/80 dark:bg-chocolate-800/80 text-[#D4AF37] font-bold border border-white/60 dark:border-gold-500/30'
                    : 'text-[#3E2723] dark:text-cream-200 hover:bg-white/40 dark:hover:bg-chocolate-800/40'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <a
            href="/#store-directions-guide"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-300 bg-gold-500/10 border border-gold-400/30"
          >
            📍 Way to Bakery & Store Pickup Directions
          </a>
          <div className="pt-2 border-t border-white/40 dark:border-gold-500/20">
            <Link
              to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 shadow-md"
            >
              <Shield className="w-4 h-4" />
              <span>{isAuthenticated ? 'Admin Panel' : 'Admin Login'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
