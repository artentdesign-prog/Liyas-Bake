import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  AlertTriangle,
  MapPin,
  Check,
  Copy,
  Share2,
  Phone,
  LocateFixed,
  ExternalLink,
  TramFront,
  Car,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const StoreDirections: React.FC = () => {
  const { siteData } = useData();
  const { settings, storeDirections } = siteData;
  const [copied, setCopied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [customOrigin, setCustomOrigin] = useState('');

  const address =
    storeDirections?.address ||
    settings.address ||
    'jolly mohalla masjid road pvr road bengaluru karnataka 560053';
  const landmark =
    storeDirections?.landmark ||
    'Near PVR Road Junction, Masjid Road, Jolly Mohalla, Chickpet Area, Bengaluru 560053';
  const mapEmbedUrl =
    storeDirections?.mapEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.084478330761!2d77.5746!3d12.9664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15e12f67dbb9%3A0x7d01878d6b8b0e71!2sJolly%20Mohalla%2C%20Chickpet%2C%20Bengaluru%2C%20Karnataka%20560053!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';
  const phone = settings.phone || '+91 8431126242';
  const pickupNotice =
    settings.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';
  const encodedDest = encodeURIComponent(address);

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Liya's Bake Bakery Pickup Location:${address}Google Maps: https://www.google.com/maps/dir/?api=1&destination=${encodedDest}Phone: ${phone}*Note: Direct counter pickup only.*`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleNavigateFromMyLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${encodedDest}`;
          window.open(url, '_blank');
        },
        (err) => {
          console.warn('Geolocation failed or denied:', err);
          setLocating(false);
          const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
          window.open(url, '_blank');
        },
        { timeout: 10000 }
      );
    } else {
      setLocating(false);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`,
        '_blank'
      );
    }
  };

  const openRouteFrom = (origin: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodedDest}`;
    window.open(url, '_blank');
  };

  const quickHubs = [
    {
      name: 'Chickpet Metro',
      distance: '800m (~3 min)',
      query: 'Chickpet Metro Station Bengaluru',
      icon: TramFront,
    },
    {
      name: 'Majestic / City Railway',
      distance: '1.8 km (~7 min)',
      query: 'KSR Bengaluru City Railway Station',
      icon: TramFront,
    },
    {
      name: 'KR Market',
      distance: '1.2 km (~5 min)',
      query: 'KR Market Bengaluru',
      icon: Car,
    },
    {
      name: 'Indiranagar',
      distance: '6.8 km (~22 min)',
      query: 'Indiranagar Bengaluru',
      icon: Car,
    },
    {
      name: 'Koramangala',
      distance: '6.2 km (~20 min)',
      query: 'Koramangala Bengaluru',
      icon: Car,
    },
    {
      name: 'Jayanagar',
      distance: '4.8 km (~15 min)',
      query: 'Jayanagar 4th Block Bengaluru',
      icon: Car,
    },
  ];

  return (
    <section
      id="store-directions-guide"
      className="store-directions-guide relative overflow-hidden rounded-[32px] p-6 sm:p-10 bg-gradient-to-br from-[#261512] via-[#3E2723] to-[#180C09] text-cream-50 shadow-2xl border border-gold-500/30"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider border border-gold-400/40">
            <Navigation className="w-3.5 h-3.5" />
            <span>Way to Address &amp; Store Pickup Guide</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-cream-200 border border-white/10">
            <Clock className="w-3 h-3 text-gold-400" />
            <span>Open Daily: 07:00 AM - 09:00 PM</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-cream-50 leading-tight">
            Visit &amp; Collect at Liya&apos;s Bake
          </h2>
          <p className="text-sm text-cream-200/90 max-w-3xl leading-relaxed">
            All handcrafted cakes, artisanal sourdoughs, and morning viennoiserie are
            freshly prepared and collected in person at our bakery counter. Use our
            interactive navigation tools below to plan your pickup.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/20 border border-gold-400/60 text-gold-200 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="uppercase tracking-wide text-gold-300 block font-black text-[11px]">
              Direct Counter Pickup Policy:
            </span>
            <p className="font-serif font-bold text-cream-100 text-sm leading-snug">
              &quot;{pickupNotice}&quot;
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Official Bakery Pickup Address:</span>
              </div>
              <p className="font-serif text-base sm:text-lg text-cream-100 font-semibold uppercase tracking-wide leading-relaxed">
                {address}
              </p>
              <p className="text-xs text-cream-300/80">
                Landmark: {landmark}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="copy-store-address-btn"
                onClick={handleCopyAddress}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cream-100 text-xs font-bold transition-all inline-flex items-center gap-2 border border-white/20 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                id="share-location-whatsapp-btn"
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Location on WhatsApp</span>
              </button>

              <a
                href={`tel:${phone}`}
                id="call-pickup-counter-btn"
                className="px-4 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500 hover:text-chocolate-950 text-gold-300 text-xs font-bold transition-all inline-flex items-center gap-2 border border-gold-400/40"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {phone}</span>
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gold-500/10 border border-gold-400/30 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block">
                Live GPS Navigation
              </span>
              <h3 className="font-serif text-lg font-bold text-cream-50">
                Turn-by-Turn Directions
              </h3>
              <p className="text-xs text-cream-200/80 leading-relaxed">
                Launch Google Maps with real-time GPS routing and continuous audio
                navigation directly to our bakery door.
              </p>
            </div>
            <button
              type="button"
              id="gps-current-location-btn"
              onClick={handleNavigateFromMyLocation}
              disabled={locating}
              className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'Navigate from My Location'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Quick Routes from Major Transit Hubs &amp; Neighborhoods:
            </span>
            <div className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                placeholder="Enter your location (e.g. Whitefield)..."
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && customOrigin && openRouteFrom(customOrigin)
                }
                className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-cream-50 placeholder:text-cream-200/50 focus:outline-none focus:border-gold-400"
              />
              <button
                type="button"
                onClick={() => customOrigin && openRouteFrom(customOrigin)}
                className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold shrink-0 cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickHubs.map((hub) => {
              const Icon = hub.icon;
              return (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => openRouteFrom(hub.query)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-gold-500/20 border border-white/10 hover:border-gold-400/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-3.5 h-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
                    <ExternalLink className="w-3 h-3 text-cream-200/40 group-hover:text-gold-300" />
                  </div>
                  <div className="font-semibold text-xs text-cream-100 group-hover:text-gold-300 truncate">
                    {hub.name}
                  </div>
                  <div className="text-[10px] text-cream-200/60">{hub.distance}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gold-500/30 shadow-xl aspect-16/9 sm:aspect-21/9 w-full bg-chocolate-950 relative">
          <iframe
            title="Liya's Bake Store Location Map"
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};
