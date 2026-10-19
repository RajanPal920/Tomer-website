import React from 'react';
import { Home, Key, RefreshCw, Briefcase, Landmark, Layers, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export default function RegionalPropertySearch({ onQuickSearch, onSelectLocality }) {
  const quickSearchOptions = [
    {
      id: 'flats-sale',
      title: 'Flats for Sale',
      desc: 'New residential launches & premium 1, 2 & 3 BHK apartments',
      icon: Home,
      tag: 'New Homes',
      image: '/images/categories/cat-flats-for-sale.png',
      filterParams: { transactionType: 'buy', locality: 'all', category: 'new-flat' },
    },
    {
      id: 'flats-rent',
      title: 'Flats for Rent',
      desc: 'Verified family rental flats with municipal water & transit access',
      icon: Key,
      tag: 'Monthly Rentals',
      image: '/images/categories/cat-flats-for-rent.jpg',
      filterParams: { transactionType: 'rent', locality: 'all', category: 'flat-rent' },
    },
    {
      id: 'resale-props',
      title: 'Resale Properties',
      desc: 'Established ready-to-move society flats with clear bank titles',
      icon: RefreshCw,
      tag: 'Ready Possession',
      image: '/images/categories/cat-resale-properties.png',
      filterParams: { transactionType: 'buy', locality: 'all', category: 'resale-flat' },
    },
    {
      id: 'shops-offices',
      title: 'Shops & Offices',
      desc: 'Main road retail shops, market showrooms & furnished corporate suites',
      icon: Briefcase,
      tag: 'Commercial Space',
      image: '/images/categories/cat-shops-and-offices.png',
      filterParams: { transactionType: 'commercial', locality: 'all', category: 'all' },
    },
    {
      id: 'res-plots',
      title: 'Residential Plots',
      desc: 'Sanctioned NA plots & demarcated layouts for private villas',
      icon: Landmark,
      tag: 'NA & Plotted',
      image: '/images/categories/cat-residential-plots.png',
      filterParams: { transactionType: 'plots-land', locality: 'all', category: 'residential-plot' },
    },
    {
      id: 'ind-plots',
      title: 'Industrial Plots',
      desc: 'Palghar & Boisar industrial & warehouse plots with heavy logistics road access',
      icon: Layers,
      tag: 'Industrial & Warehousing',
      image: '/images/categories/cat-industrial-plots.jpg',
      filterParams: { transactionType: 'plots-land', locality: 'all', category: 'industrial-plot' },
    },
  ];

  const localityPills = [
    { id: 'vasai-road', name: 'Vasai Road' },
    { id: 'nalasopara', name: 'Nalasopara' },
    { id: 'virar', name: 'Virar' },
    { id: 'saphale', name: 'Saphale' },
    { id: 'kelve-road', name: 'Kelve Road' },
    { id: 'palghar', name: 'Palghar' },
    { id: 'boisar', name: 'Boisar' },
  ];

  return (
    <section className="py-16 sm:py-20 bg-ivory/60 border-b border-stone/70">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
              <span>Corridor Discovery</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-4">
              Your Property Search, From Vasai to Boisar
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
              Customers can enquire about residential, commercial, rental, and land opportunities across the entire Western suburban and industrial corridor.
            </p>
          </div>

          {/* Locality Quick Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold uppercase tracking-wider text-charcoal mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brandRed" />
              <span>Jump To:</span>
            </span>
            {localityPills.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocality(loc.id)}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-white border border-stone hover:border-royal hover:text-royal hover:bg-royal/5 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Quick-Search Cards: Property Image → Category Badge/Icon → Title → Description → EXPLORE IN CORRIDOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {quickSearchOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onQuickSearch(opt.filterParams)}
                className="group rounded-2xl bg-white border border-stone hover:border-royal/50 shadow-subtle hover:shadow-card transition-all duration-300 text-left flex flex-col justify-between overflow-hidden h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-royal"
              >
                {/* 1. Property Image (Top of card with consistent dimensions & aspect ratio) */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone/30">
                  <img
                    src={opt.image}
                    alt={opt.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                </div>

                {/* 2. Card Content (Category Badge/Icon → Title → Description) */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Badge & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-ivory text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors duration-200 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[13px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-stone/50 text-navy group-hover:bg-royal/10 group-hover:text-royal transition-colors">
                        {opt.tag}
                      </span>
                    </div>

                    {/* Title: 21–24px on desktop, clear bold weight */}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal group-hover:text-navy transition-colors mb-2.5 tracking-tight leading-snug">
                      {opt.title}
                    </h3>

                    {/* Description: 15–16px with comfortable line height */}
                    <p className="text-[15px] sm:text-[16px] text-charcoal/80 leading-relaxed mb-6 font-normal">
                      {opt.desc}
                    </p>
                  </div>

                  {/* 3. EXPLORE IN CORRIDOR Action Bar */}
                  <div className="pt-4 border-t border-stone/50 flex items-center justify-between text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-navy group-hover:text-brandRed transition-colors">
                    <span>Explore In Corridor</span>
                    <div className="w-7 h-7 rounded-full bg-ivory flex items-center justify-center group-hover:bg-brandRed/10 group-hover:text-brandRed group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
