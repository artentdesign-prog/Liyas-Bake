import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Heart,
  Award,
  Star,
  Clock,
  Phone,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { StoreDirections } from '../components/StoreDirections';
import { RateProductModal } from '../components/RateProductModal';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { siteData } = useData();
  const { homepage, products, gallery, testimonials, businessHours, settings } =
    siteData;
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [ratingProduct, setRatingProduct] = useState<Product | null>(null);

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayName = dayNames[new Date().getDay()];
  const todayHours = businessHours.find(
    (h) => h.day.toLowerCase() === todayName.toLowerCase()
  ) || {
    day: todayName,
    openTime: '07:00 AM',
    closeTime: '08:00 PM',
    isClosed: false,
  };

  const featuredProducts = products
    .filter((p) => p.isFeatured && !p.isHidden)
    .slice(0, 4);
  const galleryPreview = gallery.slice(0, 4);
  const approvedTestimonials = testimonials
    .filter((t) => t.isApproved !== false)
    .slice(0, 2);

  const heroImage = homepage.heroImage || '/images/hero-bakery.jpg';
  const logoUrl = settings.logoUrl || '/logo.jpg';
  const pickupNotice =
    settings.pickupNotice ||
    homepage.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-[36px] mx-2 sm:mx-6 lg:mx-8 border border-white/60 dark:border-gold-500/20 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Artisanal Bakery Counter"
            className="w-full h-full object-cover scale-105 filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/95 via-chocolate-950/55 to-chocolate-950/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-16 space-y-6 text-cream-50">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-gold-400/80 shadow-2xl bg-[#FFF9F3] p-1">
            <img
              src={logoUrl}
              alt="Liya's Bake"
              className="w-full h-full object-cover object-center rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bengaluru&apos;s Luxury Patisserie &amp; Bespoke Tiers</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-cream-50 leading-tight">
            {homepage.heroTitle || "Liya's Bake"}
          </h1>

          <p className="font-sans text-base sm:text-xl text-cream-100 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            {homepage.tagline || 'Freshly Baked Happiness Every Day.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/products"
              id="hero-cta-products-btn"
              className="px-8 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>{homepage.ctaText1 || 'View Products'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/special-orders"
              id="hero-cta-orders-btn"
              className="px-8 py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-cream-50 text-xs sm:text-sm font-bold tracking-wider uppercase backdrop-blur-md border border-white/40 transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>{homepage.ctaText2 || 'Special Order Inquiry'}</span>
            </Link>
          </div>

          <div className="pt-4 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-gold-400/60 backdrop-blur-md text-gold-200 text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Direct Store Pickup Only: {pickupNotice}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white/40 dark:bg-chocolate-900/50 backdrop-blur-xl p-8 sm:p-12 rounded-[36px] border border-white/60 dark:border-gold-500/20 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block bg-[#FCE4EC] dark:bg-gold-500/20 px-3 py-1 rounded-full w-fit">
                {homepage.welcomeSubtitle ||
                  'Where Every Creation Tells A Celebration Story'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3E2723] dark:text-cream-50 mt-3 leading-tight">
                {homepage.welcomeTitle || 'Artisanal Craftsmanship & Pure Passion'}
              </h2>
            </div>
            <p className="text-sm text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
              {homepage.welcomeStory ||
                'Founded in the heart of the culinary district, Liya’s Bake brings timeless Parisian pastry techniques together with modern flavor palettes. We handcraft every batch using 100% organic French butter, Madagascar bourbon vanilla, and locally harvested berries.'}
            </p>
            <p className="text-xs font-semibold text-gold-700 dark:text-gold-400 italic">
              — Liya Vance, Founder &amp; Executive Pastry Chef
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-chocolate-900 dark:text-gold-400 hover:text-gold-600 transition-colors"
              >
                <span>Read Full Bakery Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/60 dark:bg-chocolate-800/60 border border-white/60 dark:border-gold-500/20 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-chocolate-900 dark:text-cream-100">
                Artisanal Ingredients
              </h4>
              <p className="text-xs text-chocolate-700 dark:text-cream-200 leading-relaxed">
                Single-origin Valrhona dark chocolate, Normandy butter, and Madagascar
                bourbon vanilla beans in every single recipe.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-chocolate-800/60 border border-white/60 dark:border-gold-500/20 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-chocolate-900 dark:text-cream-100">
                Baked Fresh Daily
              </h4>
              <p className="text-xs text-chocolate-700 dark:text-cream-200 leading-relaxed">
                Our team fires up hearth ovens before dawn. No preservatives, no
                frozen dough batches — always warm and fresh.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-chocolate-800/60 border border-white/60 dark:border-gold-500/20 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-chocolate-900 dark:text-cream-100">
                Bespoke Custom Art
              </h4>
              <p className="text-xs text-chocolate-700 dark:text-cream-200 leading-relaxed">
                From delicate hand-piped flowers to 24k gold leaf accents, every
                custom order is tailored to your exact celebration vision.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-chocolate-800/60 border border-white/60 dark:border-gold-500/20 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-chocolate-900 dark:text-cream-100">
                Master Pastry Chefs
              </h4>
              <p className="text-xs text-chocolate-700 dark:text-cream-200 leading-relaxed">
                French-trained pastry chefs with decades of combined experience in
                luxury wedding tiers and delicate patisserie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
              Handcrafted Perfection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-cream-50">
              {homepage.featuredSectionTitle || 'Our Signature Creations'}
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-chocolate-800 dark:text-gold-400 hover:text-gold-600 transition-colors"
          >
            <span>Browse Full Product Lineup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl overflow-hidden bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-cream-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3E2723]/80 text-[#FFF9F3] dark:bg-gold-500 dark:text-chocolate-950 backdrop-blur-md">
                  {product.availabilityBadge}
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 dark:bg-gold-500/20 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-500" />
                      <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3E2723] dark:text-cream-50 mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-chocolate-800/80 dark:text-cream-200 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gold-500/10 flex items-center justify-between">
                  <div>
                    <span className="font-serif text-sm font-bold text-chocolate-900 dark:text-gold-300 block">
                      {product.price ? `₹${product.price}` : 'Artisan Price'}
                      {product.rateUnit && (
                        <span className="text-[10px] font-normal text-chocolate-600 dark:text-cream-300 ml-1">
                          /{product.rateUnit}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRatingProduct(product)}
                      className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Rate this product"
                    >
                      <Star className="w-3 h-3 fill-gold-400" />
                      <span>Rate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(product)}
                      className="text-xs font-bold text-chocolate-800 dark:text-cream-200 hover:text-gold-600 transition-colors cursor-pointer"
                    >
                      Quick View →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreDirections />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
              Visual Moments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-cream-50">
              Gallery Snippet
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-chocolate-800 dark:text-gold-400 hover:text-gold-600 transition-colors"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryPreview.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-cream-50">
                <p className="font-serif text-sm font-bold">{item.title}</p>
                <p className="text-[10px] text-gold-300 uppercase tracking-widest">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/40 dark:bg-chocolate-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/60 dark:border-gold-500/20 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3E2723] dark:text-gold-400 block bg-[#FCE4EC] dark:bg-gold-500/20 px-3 py-1 rounded-full w-fit">
                Loved By Guests
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#3E2723] dark:text-cream-50 mt-2">
                Customer Testimonials
              </h2>
            </div>
            <Link
              to="/testimonials"
              className="text-xs font-bold uppercase tracking-widest text-[#3E2723] dark:text-gold-400 hover:text-gold-600 transition-colors"
            >
              View All Reviews
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white/50 dark:bg-chocolate-800/50 border border-white/60 dark:border-gold-500/10 backdrop-blur-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold-500">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-chocolate-600 dark:text-cream-300 uppercase tracking-widest">
                    {t.occasion}
                  </span>
                </div>
                <p className="text-xs text-chocolate-800/90 dark:text-cream-100 italic leading-relaxed font-sans">
                  &quot;{t.comment}&quot;
                </p>
                <p className="text-xs font-bold text-[#3E2723] dark:text-gold-400">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#3E2723]/90 dark:bg-chocolate-950/90 backdrop-blur-xl text-cream-50 p-8 rounded-[32px] border border-white/20 dark:border-gold-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/20 dark:border-chocolate-800 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-xl font-bold text-cream-50">
                  Business Hours
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  todayHours.isClosed
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                }`}
              >
                {todayHours.isClosed ? 'Closed Today' : 'Open Today'}
              </span>
            </div>

            <p className="text-xs text-cream-200/90 mt-4 mb-4">
              Today ({todayHours.day}):{' '}
              <strong className="text-gold-300">
                {todayHours.isClosed
                  ? 'Closed'
                  : `${todayHours.openTime} - ${todayHours.closeTime}`}
              </strong>
            </p>

            <div className="space-y-2 text-xs text-cream-200">
              {businessHours.map((h) => (
                <div
                  key={h.day}
                  className={`flex justify-between py-1 border-b border-white/10 dark:border-chocolate-800/40 ${
                    h.day === todayHours.day ? 'text-gold-300 font-bold' : ''
                  }`}
                >
                  <span>{h.day}</span>
                  <span>
                    {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 dark:border-chocolate-800 text-xs space-y-2">
            <p className="flex items-center gap-2 text-gold-300">
              <Phone className="w-3.5 h-3.5" />
              <span>{settings.phone || '+91 8431126242'}</span>
            </p>
            <p className="text-cream-200/80">
              {settings.address ||
                'jolly mohalla masjid road pvr road bengaluru karnataka 560053'}
            </p>
          </div>
        </div>
      </section>

      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/60 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-chocolate-900/95 backdrop-blur-2xl rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-white/60 dark:border-gold-500/30 relative">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#3E2723]/80 text-white hover:bg-[#3E2723] backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-4/3 overflow-hidden bg-cream-100/60">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                  {quickViewProduct.category}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FCE4EC] dark:bg-gold-500/20 text-[#3E2723] dark:text-gold-300">
                  {quickViewProduct.availabilityBadge}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3E2723] dark:text-cream-50">
                {quickViewProduct.name}
              </h3>
              <p className="text-xs text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
                {quickViewProduct.description}
              </p>

              {quickViewProduct.ingredients &&
                quickViewProduct.ingredients.length > 0 && (
                  <div className="text-xs space-y-1">
                    <strong className="text-[#3E2723] dark:text-gold-400 block font-bold">
                      Ingredients:
                    </strong>
                    <p className="text-chocolate-700 dark:text-cream-300">
                      {quickViewProduct.ingredients.join(', ')}
                    </p>
                  </div>
                )}

              {quickViewProduct.allergens &&
                quickViewProduct.allergens.length > 0 && (
                  <div className="text-xs space-y-1">
                    <strong className="text-rose-600 dark:text-rose-400 block font-bold">
                      Allergens:
                    </strong>
                    <p className="text-chocolate-700 dark:text-cream-300">
                      {quickViewProduct.allergens.join(', ')}
                    </p>
                  </div>
                )}

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gold-500/15">
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gold-600 dark:text-gold-400 mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
                    <span>
                      {quickViewProduct.rating
                        ? quickViewProduct.rating.toFixed(1)
                        : '5.0'}
                    </span>
                    <span className="text-[10px] text-chocolate-400 dark:text-cream-300">
                      ({quickViewProduct.ratingCount || 1} ratings)
                    </span>
                  </div>
                  <span className="font-serif text-xl font-bold text-chocolate-900 dark:text-gold-300">
                    {quickViewProduct.price
                      ? `₹${quickViewProduct.price}`
                      : 'Artisan Price'}
                    {quickViewProduct.rateUnit && (
                      <span className="text-xs font-normal text-chocolate-600 dark:text-cream-300 ml-1">
                        /{quickViewProduct.rateUnit}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = quickViewProduct;
                      setQuickViewProduct(null);
                      setRatingProduct(target);
                    }}
                    className="px-3.5 py-2 rounded-full bg-gold-500/20 hover:bg-gold-500 text-gold-700 hover:text-chocolate-950 dark:text-gold-300 dark:hover:text-chocolate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
                    <span>Rate</span>
                  </button>
                  <Link
                    to={`/special-orders?product=${encodeURIComponent(
                      quickViewProduct.name
                    )}`}
                    className="px-5 py-2 rounded-full bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold uppercase tracking-wider transition-all"
                    onClick={() => setQuickViewProduct(null)}
                  >
                    Inquire / Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ratingProduct && (
        <RateProductModal
          product={ratingProduct}
          onClose={() => setRatingProduct(null)}
        />
      )}
    </div>
  );
};
