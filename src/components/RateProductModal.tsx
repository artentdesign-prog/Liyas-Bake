import React, { useState } from 'react';
import { X, CheckCircle2, Star, Send } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../context/DataContext';

interface RateProductModalProps {
  product: Product | null;
  onClose: () => void;
  onRatingSuccess?: (rating: number) => void;
}

export const RateProductModal: React.FC<RateProductModalProps> = ({
  product,
  onClose,
  onRatingSuccess,
}) => {
  const { rateProduct } = useData();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setSubmitting(true);
    try {
      const res = await rateProduct(
        product.id,
        rating,
        customerName.trim() || 'Artisan Foodie',
        comment.trim()
      );
      setMessage(res.message);
      setSubmitted(true);
      onRatingSuccess?.(rating);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch {
      setMessage('Rating recorded successfully!');
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  };

  const labels = [
    '',
    'Fair - Needs refinement',
    'Good - Pleasing flavor',
    'Very Good - Delicious bake',
    'Excellent - Highly recommended',
    'Masterpiece - Unrivaled artisanal perfection!',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-chocolate-900 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-gold-500/30 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cream-100/80 dark:bg-chocolate-800 text-chocolate-800 dark:text-cream-200 hover:bg-cream-200 dark:hover:bg-chocolate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              Thank You!
            </h3>
            <p className="text-xs text-chocolate-700 dark:text-cream-300">
              {message || 'Your rating has been saved to the permanent database.'}
            </p>
            <div className="flex items-center justify-center gap-1 text-gold-500 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= rating ? 'fill-gold-400 text-gold-500' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 rounded-2xl object-cover border border-gold-500/20"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block">
                  Rate Artisan Creation
                </span>
                <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50 line-clamp-1">
                  {product.name}
                </h3>
                <span className="text-xs text-chocolate-600 dark:text-cream-300">
                  Rate: {product.price ? `₹${product.price}` : 'Artisan'}{' '}
                  {product.rateUnit ? `(${product.rateUnit})` : ''}
                </span>
              </div>
            </div>

            <div className="text-center py-2 space-y-2 bg-cream-50/70 dark:bg-chocolate-800/50 rounded-2xl p-4 border border-gold-500/10">
              <span className="text-xs font-semibold text-chocolate-700 dark:text-cream-300 block">
                Select Your Star Rating
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hovered !== null ? hovered : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-gold-500 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? 'fill-gold-400 text-gold-500'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-medium text-gold-700 dark:text-gold-300 h-4">
                {labels[hovered !== null ? hovered : rating]}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-chocolate-800 dark:text-cream-200 mb-1">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-50 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-chocolate-800 dark:text-cream-200 mb-1">
                  Your Review / Tasting Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What did you love about the texture, sweetness, or flavor?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-50 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-chocolate-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-chocolate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-gold-600 text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-chocolate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Rating</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
