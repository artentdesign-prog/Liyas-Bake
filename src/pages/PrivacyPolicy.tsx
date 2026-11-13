import React from 'react';
import { Shield, FileText, AlertTriangle, Mail } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PrivacyPolicy: React.FC = () => {
  const { siteData } = useData();
  const { settings } = siteData;
  const pickupNotice =
    settings.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
          <Shield className="w-3.5 h-3.5" />
          <span>Data Protection &amp; Privacy</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-chocolate-600 dark:text-cream-300">
          Last Updated: August 2026
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-[36px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-xl space-y-8 text-chocolate-800 dark:text-cream-200 text-xs sm:text-sm leading-relaxed font-sans">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            <span>1. Overview &amp; Scope</span>
          </h2>
          <p>
            At Liya&apos;s Bake, we respect your privacy and are committed to
            safeguarding personal information shared with us. This website is an
            informational showcase and inquiry portal for our artisanal bakery. We
            do not store payment card information or conduct direct e-commerce
            transactions online.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            <span>2. Information We Collect</span>
          </h2>
          <p>
            We only collect personal information that you voluntarily provide when
            submitting a Special Order Inquiry or Guest Review, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-chocolate-700 dark:text-cream-300">
            <li>Your name and contact phone number or email address</li>
            <li>Event dates, guest count, and custom cake design preferences</li>
            <li>Allergen or dietary considerations relevant to your order</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            <span>3. How We Use Your Information</span>
          </h2>
          <p>
            Information collected via inquiry forms is strictly used to contact you
            directly to discuss custom bakery orders, arrange tasting
            consultations, or confirm store availability. We do not sell, rent, or
            lease customer data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>4. Store Pickup &amp; Fulfilment Terms</span>
          </h2>
          <p>
            Our bakery operates exclusively on a direct storefront collection model.
            By using this service, you acknowledge that:
          </p>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold">
            &quot;{pickupNotice}&quot;
          </div>
          <p>
            All celebration tiers and bakes must be collected in person from our
            official address: {settings.address}.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-gold-500/20">
          <h2 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold-500" />
            <span>5. Security &amp; Contact</span>
          </h2>
          <p>
            We implement appropriate administrative and technical safeguards to
            protect your data. If you have any questions regarding this Privacy
            Policy, please contact us at{' '}
            <a
              href={`mailto:${settings.email || 'hello@liyasbake.com'}`}
              className="text-gold-600 dark:text-gold-400 font-semibold underline"
            >
              {settings.email || 'hello@liyasbake.com'}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};
