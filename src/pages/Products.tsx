import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  X,
  Cake,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { RateProductModal } from '../components/RateProductModal';
import { Product } from '../types';

export const Products: React.FC = () => {
  const { siteData } = useData();
  const products = siteData.products || [];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [ratingProduct, setRatingProduct] = useState<Product | null>(null);

  const categories = [
    'All',
    'Birthday Cakes',
    'Wedding Cakes',
    'Cupcakes',
    'Cookies',
    'Bread',
    'Pastries',
    'Seasonal Specials',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isHidden) return false;
      const matchesCat =
        selectedCategory === 'All' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Artisan Creations &amp; Fresh Daily Counter</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
          Our Patisserie &amp; Bakery Menu
        </h1>
        <p className="text-sm sm:text-base text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
          Discover our selection of handcrafted celebration cakes, laminated French
          croissants, and crusty sourdough loaves. All baked with pure,
          uncompromised ingredients.
        </p>
      </div>

      <div className="space-y-6">
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-chocolate-600 dark:text-cream-300 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="product-search-input"
            placeholder="Search cakes, pastries, sourdough..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-full bg-white/70 dark:bg-chocolate-900/70 border border-white/80 dark:border-gold-500/30 text-xs sm:text-sm text-chocolate-900 dark:text-cream-50 placeholder:text-chocolate-600/60 dark:placeholder:text-cream-300/50 shadow-md backdrop-blur-md focus:outline-none focus:border-gold-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-chocolate-600 hover:text-chocolate-900 dark:hover:text-cream-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3E2723] text-white dark:bg-gold-500 dark:text-chocolate-950 shadow-md'
                  : 'bg-white/50 dark:bg-chocolate-900/40 text-chocolate-800 dark:text-cream-200 hover:bg-white/80 dark:hover:bg-chocolate-800 border border-white/60 dark:border-gold-500/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white/30 dark:bg-chocolate-900/30 rounded-3xl border border-white/50 dark:border-gold-500/10 p-8">
          <Cake className="w-10 h-10 text-gold-500 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-100">
            No products found
          </h3>
          <p className="text-xs text-chocolate-700 dark:text-cream-300">
            Try adjusting your search criteria or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2 rounded-full bg-gold-500 text-chocolate-950 text-xs font-bold uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                      <span>
                        {product.rating ? product.rating.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-[9px] text-chocolate-600/80 dark:text-cream-300/80 font-normal">
                        ({product.ratingCount || 1})
                      </span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3E2723] dark:text-cream-50 mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-chocolate-800/80 dark:text-cream-200 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gold-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-chocolate-600 dark:text-cream-300 uppercase tracking-wider block">
                      Rate / Price
                    </span>
                    <span className="font-serif text-base font-bold text-chocolate-900 dark:text-gold-300">
                      {product.price ? `₹${product.price}` : 'Artisan'}
                      {product.rateUnit && (
                        <span className="text-[10px] font-normal text-chocolate-600 dark:text-cream-300 ml-1">
                          /{product.rateUnit}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRatingProduct(product)}
                      className="px-2.5 py-1.5 rounded-full bg-gold-500/20 hover:bg-gold-500 text-gold-700 hover:text-chocolate-950 dark:text-gold-300 dark:hover:text-chocolate-950 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Add your review and rating"
                    >
                      <Star className="w-3 h-3 fill-gold-400 text-gold-500" />
                      <span>Rate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="px-3 py-1.5 rounded-full bg-[#3E2723] hover:bg-gold-600 text-white dark:bg-gold-500 dark:text-chocolate-950 text-xs font-bold transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/60 backdrop-blur-md">
          <div className="bg-white/95 dark:bg-chocolate-900/95 backdrop-blur-2xl rounded-[32px] max-w-xl w-full overflow-hidden shadow-2xl border border-white/60 dark:border-gold-500/30 relative">
            <button
              type="button"
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#3E2723]/80 text-white hover:bg-[#3E2723] backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-4/3 overflow-hidden bg-cream-100/60">
              <img
                src={detailProduct.image}
                alt={detailProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                  {detailProduct.category}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FCE4EC] dark:bg-gold-500/20 text-[#3E2723] dark:text-gold-300">
                  {detailProduct.availabilityBadge}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2723] dark:text-cream-50">
                {detailProduct.name}
              </h3>
              <p className="text-xs sm:text-sm text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
                {detailProduct.description}
              </p>

              {detailProduct.ingredients && detailProduct.ingredients.length > 0 && (
                <div className="text-xs space-y-1 pt-2 border-t border-gold-500/15">
                  <strong className="text-[#3E2723] dark:text-gold-400 block font-bold uppercase tracking-wider text-[10px]">
                    Ingredients:
                  </strong>
                  <p className="text-chocolate-700 dark:text-cream-300">
                    {detailProduct.ingredients.join(', ')}
                  </p>
                </div>
              )}

              {detailProduct.allergens && detailProduct.allergens.length > 0 && (
                <div className="text-xs space-y-1">
                  <strong className="text-rose-600 dark:text-rose-400 block font-bold uppercase tracking-wider text-[10px]">
                    Contains Allergens:
                  </strong>
                  <p className="text-chocolate-700 dark:text-cream-300">
                    {detailProduct.allergens.join(', ')}
                  </p>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gold-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-chocolate-600 dark:text-cream-300 uppercase tracking-widest block">
                      Rate / Price
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-gold-600 dark:text-gold-400">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
                      <span>
                        {detailProduct.rating
                          ? detailProduct.rating.toFixed(1)
                          : '5.0'}
                      </span>
                      <span className="text-[10px] text-chocolate-600 dark:text-cream-300">
                        ({detailProduct.ratingCount || 1} ratings)
                      </span>
                    </div>
                  </div>
                  <span className="font-serif text-2xl font-bold text-chocolate-900 dark:text-gold-300">
                    {detailProduct.price
                      ? `₹${detailProduct.price}`
                      : 'Artisan Price'}
                    {detailProduct.rateUnit && (
                      <span className="text-xs font-normal text-chocolate-600 dark:text-cream-300 ml-1.5">
                        /{detailProduct.rateUnit}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailProduct;
                      setDetailProduct(null);
                      setRatingProduct(target);
                    }}
                    className="px-4 py-2.5 rounded-full bg-gold-500/20 hover:bg-gold-500 text-gold-700 hover:text-chocolate-950 dark:text-gold-300 dark:hover:text-chocolate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
                    <span>Rate this Cake</span>
                  </button>
                  <Link
                    to={`/special-orders?product=${encodeURIComponent(
                      detailProduct.name
                    )}`}
                    className="px-6 py-2.5 rounded-full bg-[#3E2723] hover:bg-gold-600 text-white dark:bg-gold-500 dark:text-chocolate-950 text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                    onClick={() => setDetailProduct(null)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Inquire / Order</span>
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
