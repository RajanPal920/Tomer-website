import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categories } from '../data/categories';

export default function CategoryExplorer({ onSelectCategory }) {
  return (
    <section id="categories" className="py-20 sm:py-24 bg-ivory">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-3">
            <Sparkles className="w-3.5 h-3.5 text-royal flex-shrink-0" />
            <span>Curated Portfolios</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-4">
            Explore Properties That Fit Your Needs
          </h2>
          <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
            From your next home to your next business opportunity, explore property options across our service region.
          </p>
        </div>

        {/* 11 Categories Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-stone shadow-subtle hover:shadow-card hover:border-royal/50 transition-all duration-300 flex flex-col"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(cat);
                }
              }}
              aria-label={`Explore category ${cat.title}`}
            >
              {/* Card Image Container with Restrained Zoom */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone/40">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80";
                  }}
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-2.5 py-1 rounded-sm bg-navy/85 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white border border-white/10 shadow-sm">
                    {cat.badge}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-normal text-charcoal group-hover:text-navy transition-colors mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone/50 flex items-center justify-between text-xs font-bold text-navy group-hover:text-royal transition-colors">
                  <span>Explore Listings</span>
                  <div className="w-6 h-6 rounded-full bg-ivory flex items-center justify-center group-hover:bg-royal/15 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
