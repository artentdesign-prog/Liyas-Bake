import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  MapPin,
  Shield,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { siteData } = useData();
  const { settings, businessHours } = siteData;
  const logoUrl = settings.logoUrl || '/logo.jpg';
  const pickupNotice =
    settings.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';

  return (
    <footer className="bg-[#180C09]/90 dark:bg-chocolate-950/90 backdrop-blur-xl text-cream-100 pt-16 pb-8 border-t border-white/20 dark:border-gold-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10 dark:border-chocolate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-md bg-[#FFF9F3] flex items-center justify-center shrink-0">
                <img
                  src={logoUrl}
                  alt="Liya's Bake Logo"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-cream-50 block leading-tight">
                  {settings.siteName || "Liya's Bake"}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-gold-400">
                  • Baked with Love •
                </span>
              </div>
            </div>
            <p className="text-sm text-chocolate-200 leading-relaxed">
              {settings.tagline || 'Freshly Baked Happiness Every Day.'}
            </p>
            <p className="text-xs text-chocolate-200/80 italic">
              Artisanal cakes, delicate viennoiserie, and bespoke celebration orders.
              Direct store collection only.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                id="footer-social-instagram"
                className="w-9 h-9 rounded-full bg-chocolate-800/80 hover:bg-gold-500 hover:text-chocolate-950 text-gold-400 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                id="footer-social-facebook"
                className="w-9 h-9 rounded-full bg-chocolate-800/80 hover:bg-gold-500 hover:text-chocolate-950 text-gold-400 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Quick Navigation
            </h4>
            <div className="space-y-2 text-sm text-chocolate-200 flex flex-col">
              <Link to="/" className="hover:text-gold-300 transition-colors">
                Home
              </Link>
              <a
                href="/#store-directions-guide"
                className="hover:text-gold-300 transition-colors inline-flex items-center gap-1 font-semibold text-gold-400"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Way to Bakery & Directions</span>
              </a>
              <Link to="/about" className="hover:text-gold-300 transition-colors">
                About Our Bakery
              </Link>
              <Link to="/products" className="hover:text-gold-300 transition-colors">
                Artisanal Products
              </Link>
              <Link to="/gallery" className="hover:text-gold-300 transition-colors">
                Bake Gallery
              </Link>
              <Link
                to="/special-orders"
                className="hover:text-gold-300 transition-colors"
              >
                Special Order Enquiry
              </Link>
              <Link
                to="/testimonials"
                className="hover:text-gold-300 transition-colors"
              >
                Guest Reviews
              </Link>
              <Link
                to="/privacy-policy"
                className="hover:text-gold-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/admin/login"
                className="text-gold-400 hover:underline inline-flex items-center gap-1 font-medium pt-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Visit & Contact Us
            </h4>
            <div className="space-y-3 text-sm text-chocolate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <span className="leading-snug">
                  {settings.address ||
                    'jolly mohalla masjid road pvr road bengaluru karnataka 560053'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`tel:${settings.phone || '+918431126242'}`}
                  className="hover:text-gold-300"
                >
                  {settings.phone || '+91 8431126242'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${settings.email || 'hello@liyasbake.com'}`}
                  className="hover:text-gold-300"
                >
                  {settings.email || 'hello@liyasbake.com'}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href="/#store-directions-guide"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500 hover:text-chocolate-950 text-xs font-bold transition-all border border-gold-400/30"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View Way & Directions</span>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-gold-400 tracking-wide">
              Bakery Hours
            </h4>
            <div className="space-y-1.5 text-xs text-chocolate-200">
              {businessHours.map((h) => (
                <div
                  key={h.day}
                  className="flex justify-between py-0.5 border-b border-chocolate-800/50"
                >
                  <span className="font-medium text-cream-100">{h.day}</span>
                  <span>
                    {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="my-8 p-4 rounded-2xl bg-amber-500/10 border border-gold-500/30 text-gold-200 text-xs sm:text-sm flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <strong className="text-gold-300 uppercase tracking-wide block sm:inline mr-2">
              Important Store Pickup Policy:
            </strong>
            <span>{pickupNotice}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-chocolate-200/70 gap-2 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Liya&apos;s Bake. All rights reserved.
            Handcrafted with passion.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-gold-300">
              Privacy Policy
            </Link>
            <span>•</span>
            <a href="/#store-directions-guide" className="hover:text-gold-300">
              Counter Collection Only
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
