import React, { useMemo, useState } from 'react';
import { Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { GalleryItem } from '../types';

export const Gallery: React.FC = () => {
  const { siteData } = useData();
  const gallery = siteData.gallery || [];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Cakes', 'Cookies', 'Bread', 'Pastries', 'Events'];

  const filteredItems = useMemo(() => {
    return selectedCategory === 'All'
      ? gallery
      : gallery.filter(
          (item) =>
            item.category.toLowerCase() === selectedCategory.toLowerCase()
        );
  }, [gallery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visual Feasts &amp; Celebration Art</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
          Bakery Gallery
        </h1>
        <p className="text-sm sm:text-base text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
          Browse our portfolio of custom wedding tiers, morning viennoiserie, and
          private dessert banquets. Handcrafted with obsession for detail.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white/30 dark:bg-chocolate-900/30 rounded-3xl border border-white/50 dark:border-gold-500/10 p-8">
          <ImageIcon className="w-10 h-10 text-gold-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-100">
            No images in this category
          </h3>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-chocolate-950 text-xs font-bold"
          >
            View All Images
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-gold-500/20 bg-cream-100"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/90 via-chocolate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-cream-50">
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-widest block">
                  {item.category}
                </span>
                <h4 className="font-serif text-base font-bold text-cream-50">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-chocolate-900 rounded-3xl overflow-hidden shadow-2xl border border-gold-500/40 p-4">
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-chocolate-950/80 text-white hover:bg-gold-500 hover:text-chocolate-950 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-16/9 rounded-2xl overflow-hidden bg-black">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2 text-cream-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  {lightboxItem.category}
                </span>
                {lightboxItem.uploadDate && (
                  <span className="text-[10px] text-cream-300">
                    Uploaded: {lightboxItem.uploadDate}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl font-bold">
                {lightboxItem.title}
              </h3>
              {lightboxItem.description && (
                <p className="text-xs text-cream-200/90 leading-relaxed font-sans">
                  {lightboxItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
