import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ImagePicker } from '../components/ImagePicker';

export const SpecialOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get('product') || '';
  const { siteData, submitSpecialOrder } = useData();
  const { settings } = siteData;

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    occasion: 'Birthday',
    preferredDate: '',
    servingSize: '20 - 30 Guests',
    message: productParam
      ? `I would like to inquire about ordering: ${productParam}`
      : '',
    specialRequirements: '',
    referenceImage: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (productParam) {
      setForm((prev) => ({
        ...prev,
        message: `I would like to inquire about ordering: ${productParam}`,
      }));
    }
  }, [productParam]);

  const pickupNotice =
    settings.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim()) {
      setErrorMsg('Please fill in your name and contact phone number.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitSpecialOrder(form);
      if (res.success) {
        setSuccessMsg(res.message);
        setForm({
          customerName: '',
          phone: '',
          email: '',
          occasion: 'Birthday',
          preferredDate: '',
          servingSize: '20 - 30 Guests',
          message: '',
          specialRequirements: '',
          referenceImage: '',
        });
      } else {
        setErrorMsg(res.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppChat = () => {
    const text = `Hello Chef Liya! I would like to inquire about a custom cake order:Name: ${
      form.customerName || 'Guest'
    }Occasion: ${form.occasion}Serving Size: ${form.servingSize}Details: ${
      form.message || 'Custom cake inquiry'
    }`;
    const phoneNum = settings.phone
      ? settings.phone.replace(/[^0-9]/g, '')
      : '918431126242';
    window.open(
      `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Bakes &amp; Event Catering</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
          Special Order Inquiry
        </h1>
        <p className="text-sm sm:text-base text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
          Planning a wedding, milestone birthday, or corporate gala? Fill out the
          inquiry form below to share your vision with our master pastry team.
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-gold-500/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold uppercase tracking-wide text-chocolate-900 dark:text-gold-300">
            Note on Custom Orders &amp; Pickup:
          </strong>
          <p className="leading-relaxed">
            This is an inquiry form only. No online payments or doorstep delivery —{' '}
            <strong className="text-chocolate-950 dark:text-cream-50 underline">
              {pickupNotice}
            </strong>
            . Once submitted, our bakery manager will reach out to confirm your custom
            requirements and pickup timing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6 lg:border-r border-gold-500/20 lg:pr-8">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
              Inquiry Process
            </h3>
            <p className="text-xs text-chocolate-800/80 dark:text-cream-200 leading-relaxed">
              We recommend submitting inquiries at least 2 weeks in advance for
              bespoke celebration cakes and 1 month for wedding tiers.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-chocolate-800/50 border border-white/60 dark:border-gold-500/10">
              <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <strong className="text-chocolate-900 dark:text-cream-50 block font-bold">
                  Submit Inquiry
                </strong>
                <span className="text-chocolate-700 dark:text-cream-300">
                  Share your event date, theme, guest count, and flavor preferences.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-chocolate-800/50 border border-white/60 dark:border-gold-500/10">
              <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <strong className="text-chocolate-900 dark:text-cream-50 block font-bold">
                  Personal Consultation
                </strong>
                <span className="text-chocolate-700 dark:text-cream-300">
                  Chef Liya reviews your request and calls you to refine details.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-chocolate-800/50 border border-white/60 dark:border-gold-500/10">
              <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <strong className="text-chocolate-900 dark:text-cream-50 block font-bold">
                  Artisanal Creation
                </strong>
                <span className="text-chocolate-700 dark:text-cream-300">
                  Your custom creation is handcrafted fresh for your special day.
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 dark:bg-chocolate-800/60 border border-gold-500/20 space-y-3">
            <div className="aspect-4/3 rounded-xl overflow-hidden">
              <img
                src="/images/gold-wedding.jpg"
                alt="Custom Cake Display"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-chocolate-800/90 dark:text-cream-200 italic leading-relaxed text-center">
              &quot;Every custom cake is a centerpiece designed to capture the magic of
              your milestone.&quot;
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              Prefer Instant Chat?
            </span>
            <p className="text-xs text-chocolate-800 dark:text-cream-200">
              Chat directly with our patisserie desk on WhatsApp for instant
              availability queries.
            </p>
            <button
              type="button"
              onClick={handleWhatsAppChat}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-xl space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Martinez"
                  id="special-order-name-input"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  id="special-order-phone-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. sophia@example.com"
                  id="special-order-email-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Celebration Occasion
                </label>
                <select
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding Tier">Wedding Tier</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Other">Other Bespoke Event</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Preferred Event Date
                </label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) =>
                    setForm({ ...form, preferredDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                  Serving Size / Guest Count
                </label>
                <select
                  value={form.servingSize}
                  onChange={(e) =>
                    setForm({ ...form, servingSize: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="10 - 20 Guests">
                    10 - 20 Guests (Single Tier)
                  </option>
                  <option value="20 - 30 Guests">
                    20 - 30 Guests (Two Tiers)
                  </option>
                  <option value="30 - 50 Guests">
                    30 - 50 Guests (Two to Three Tiers)
                  </option>
                  <option value="50+ Guests">
                    50+ Guests (Grand Multi-Tier / Banquet)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                Design &amp; Flavor Vision
              </label>
              <textarea
                rows={3}
                placeholder="Describe your dream cake, color palette, tier count, and preferred flavors (e.g. Earl Grey Blackberry, Pistachio Raspberry, Rosé Velvet)..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-chocolate-900 dark:text-cream-200 mb-1">
                Dietary or Allergen Considerations
              </label>
              <input
                type="text"
                placeholder="e.g. Eggless, nut-free, low sugar, gluten-conscious..."
                value={form.specialRequirements}
                onChange={(e) =>
                  setForm({ ...form, specialRequirements: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-chocolate-800 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-600/50 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="pt-2">
              <ImagePicker
                label="Attach Reference / Moodboard Image (Optional)"
                value={form.referenceImage}
                onChange={(val) => setForm({ ...form, referenceImage: val })}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                id="special-order-submit-btn"
                className="w-full py-3.5 px-6 rounded-xl bg-[#3E2723] dark:bg-gold-500 text-white dark:text-chocolate-950 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Submitting Inquiry...'
                    : 'Submit Inquiry For Consultation'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
