import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Navigation,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const About: React.FC = () => {
  const { siteData } = useData();
  const { about } = siteData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Heritage &amp; Philosophy</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-chocolate-900 dark:text-cream-50 leading-tight">
          The Art of Liya&apos;s Bake
        </h1>
        <p className="text-sm sm:text-base text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
          Bespoke patisserie, slow-fermented hearth breads, and celebration
          centerpieces crafted with reverence for authentic techniques.
        </p>
      </div>

      <section className="bg-white/40 dark:bg-chocolate-900/50 backdrop-blur-xl p-8 sm:p-12 rounded-[36px] border border-white/60 dark:border-gold-500/20 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
            Crafted Since 2018
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-cream-50">
            {about.storyTitle || 'Our Journey & Philosophy'}
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
            {about.storyParagraphs && about.storyParagraphs.length > 0 ? (
              about.storyParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
            ) : (
              <>
                <p>
                  At Liya’s Bake, we believe that baking is a harmony of chemistry
                  and soul. We never compromise on ingredients — using single-origin
                  Valrhona chocolate, farm-fresh pasture eggs, and slow-fermented
                  starters.
                </p>
                <p>
                  Every morning before dawn, our bakers hand-laminate flaky
                  viennoiserie doughs and simmer silky curds. By opening time, our
                  counter is overflowing with crisp viennoiserie, golden brioche, and
                  bespoke celebration cakes.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6 sm:p-8 rounded-3xl bg-cream-100/60 dark:bg-chocolate-800/60 border border-gold-500/20">
          <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-serif font-bold text-lg">
            <Award className="w-5 h-5" />
            <span>Our Quality Commitments</span>
          </div>
          <div className="space-y-3 pt-2">
            {about.qualityPromises && about.qualityPromises.length > 0 ? (
              about.qualityPromises.map((promise, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-xs sm:text-sm text-chocolate-900 dark:text-cream-100 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{promise}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-chocolate-900 dark:text-cream-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Organic Normandy Butter</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-chocolate-900 dark:text-cream-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Madagascar Bourbon Vanilla</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-chocolate-900 dark:text-cream-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>72-Hour Slow Fermentation</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-chocolate-900 dark:text-cream-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero Preservatives or Additives</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 sm:p-10 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
            Our Purpose
          </span>
          <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
            Our Mission
          </h3>
          <p className="text-xs sm:text-sm text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
            {about.mission ||
              'To elevate life’s everyday and monumental moments through extraordinary, handcrafted baked delights.'}
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-[32px] bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE4EC] dark:bg-gold-500/20 text-[#3E2723] dark:text-gold-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
            Future Horizon
          </span>
          <h3 className="font-serif text-2xl font-bold text-chocolate-900 dark:text-cream-50">
            Our Vision
          </h3>
          <p className="text-xs sm:text-sm text-chocolate-800/90 dark:text-cream-200 leading-relaxed font-sans">
            {about.vision ||
              'To be recognized globally as a benchmark of artisanal bakery excellence and sustainable luxury patisserie.'}
          </p>
        </div>
      </section>

      {about.bakers && about.bakers.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
              The Artisans Behind The Ovens
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-cream-50">
              Meet Our Bakers &amp; Pastry Artists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.bakers.map((baker) => (
              <div
                key={baker.id}
                className="rounded-3xl overflow-hidden bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-lg flex flex-col group"
              >
                <div className="aspect-square overflow-hidden bg-cream-100">
                  <img
                    src={baker.image}
                    alt={baker.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
                      {baker.role}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-cream-50 mt-1">
                      {baker.name}
                    </h3>
                    <p className="text-xs text-chocolate-800/80 dark:text-cream-200 mt-2 leading-relaxed font-sans">
                      {baker.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {about.timeline && about.timeline.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
              Years of Dedication
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-cream-50">
              Our Milestones &amp; History
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.timeline.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/50 dark:bg-chocolate-900/60 border border-white/60 dark:border-gold-500/20 shadow-md space-y-3 relative"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.year}</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-chocolate-900 dark:text-cream-50">
                  {item.title}
                </h4>
                <p className="text-xs text-chocolate-800/80 dark:text-cream-200 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-r from-chocolate-900 to-chocolate-950 text-cream-50 text-center space-y-6 border border-gold-500/30 shadow-2xl">
        <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-cream-50">
          Experience the Aromas in Person
        </h3>
        <p className="text-sm text-cream-200/90 max-w-2xl mx-auto leading-relaxed">
          Remember, every artisanal loaf and custom creation is handcrafted fresh for
          direct counter collection at our Bengaluru store.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="/#store-directions-guide"
            className="px-8 py-3 rounded-full bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
          >
            <span>View Bakery Location &amp; Guide</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/products"
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-cream-100 text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
