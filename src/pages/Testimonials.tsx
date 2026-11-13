import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquarePlus,
  Star,
  Quote,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Testimonials: React.FC = () => {
  const { siteData, submitTestimonial } = useData();
  const approvedTestimonials = (siteData.testimonials || []).filter(
    (t) => t.isApproved !== false
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    rating: 5,
    occasion: 'Celebration',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      setErrorMsg('Please enter your name and review comment.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitTestimonial(form);
      if (res.success) {
        setSuccessMsg(res.message);
        setForm({ name: '', rating: 5, occasion: 'Celebration', comment: '' });
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg(null);
        }, 2000);
      } else {
        setErrorMsg(res.message || 'Error submitting review.');
      }
    } catch {
      setErrorMsg('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold-500/20 pb-8">
        <div className="space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Experiences &amp; Memories</span>
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
            Customer Testimonials
          </h1>
          <p className="text-sm text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
            Read stories and feedback from patrons who have celebrated with
            Liya&apos;s Bake.
          </p>
        </div>

        <button
          type="button"
          id="open-write-review-modal-btn"
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-full bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write A Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedTestimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 sm:p-8 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({
                    length: Math.max(0, Math.min(5, Math.round(Number(t.rating) || 5))),
                  }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-4 h-4 fill-gold-500 text-gold-500"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  {t.occasion || 'Celebration'}
                </span>
              </div>

              <div className="relative">
                <Quote className="w-6 h-6 text-gold-500/20 mb-1" />
                <p className="text-xs sm:text-sm text-chocolate-800/90 dark:text-cream-100 italic leading-relaxed font-sans">
                  &quot;{t.comment}&quot;
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gold-500/10 flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-chocolate-900 dark:text-cream-50">
                — {t.name}
              </span>
              {t.date && (
                <span className="text-chocolate-600 dark:text-cream-300/60 text-[10px]">
                  {t.date}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/80 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-chocolate-900/95 backdrop-blur-2xl rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-gold-500/30 relative space-y-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-chocolate-600 hover:bg-cream-100 dark:hover:bg-chocolate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
                Share Your Experience
              </h3>
              <p className="text-xs text-chocolate-700 dark:text-cream-200">
                Your feedback helps us continuously elevate our baking craftsmanship.
              </p>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  id="testimonial-name-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= form.rating
                            ? 'fill-gold-500 text-gold-500'
                            : 'text-chocolate-200 dark:text-chocolate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Occasion / Purchase
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Cake, Morning Croissants, Wedding Tier"
                  id="testimonial-occasion-input"
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the flavor, presentation, and service..."
                  id="testimonial-comment-input"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  id="submit-review-btn"
                  className="w-full py-3 px-6 rounded-xl bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
