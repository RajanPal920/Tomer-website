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
      filterParams: { transactionType: 'buy', locality: 'all', category: 'new-flat' },
    },
    {
      id: 'flats-rent',
      title: 'Flats for Rent',
      desc: 'Verified family rental flats with municipal water & transit access',
      icon: Key,
      tag: 'Monthly Rentals',
      filterParams: { transactionType: 'rent', locality: 'all', category: 'flat-rent' },
    },
    {
      id: 'resale-props',
      title: 'Resale Properties',
      desc: 'Established ready-to-move society flats with clear bank titles',
      icon: RefreshCw,
      tag: 'Ready Possession',
      filterParams: { transactionType: 'buy', locality: 'all', category: 'resale-flat' },
    },
    {
      id: 'shops-offices',
      title: 'Shops & Offices',
      desc: 'Main road retail shops, market showrooms & furnished corporate suites',
      icon: Briefcase,
      tag: 'Commercial Space',
      filterParams: { transactionType: 'commercial', locality: 'all', category: 'all' },
    },
    {
      id: 'res-plots',
      title: 'Residential Plots',
      desc: 'Sanctioned NA plots & demarcated layouts for private villas',
      icon: Landmark,
      tag: 'NA & Plotted',
      filterParams: { transactionType: 'plots-land', locality: 'all', category: 'residential-plot' },
    },
    {
      id: 'ind-plots',
      title: 'Industrial Plots',
      desc: 'Boisar MIDC & warehouse plots with heavy logistics road access',
      icon: Layers,
      tag: 'MIDC & Warehousing',
      filterParams: { transactionType: 'plots-land', locality: 'all', category: 'industrial-plot' },
    },
  ];

  const localityPills = [
    { id: 'vasai-road', name: 'Vasai Road' },
    { id: 'nalasopara', name: 'Nalasopara' },
    { id: 'virar', name: 'Virar' },
    { id: 'vaitarna', name: 'Vaitarna' },
    { id: 'saphale', name: 'Saphale' },
    { id: 'kelve-road', name: 'Kelve Road' },
    { id: 'palghar', name: 'Palghar' },
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
              Your Property Search, From Vasai to Palghar
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
              Customers can enquire about residential, commercial, rental, and land opportunities across the entire Western suburban and industrial corridor.
            </p>
          </div>

          {/* Locality Quick Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brandRed" />
              <span>Jump To:</span>
            </span>
            {localityPills.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocality(loc.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone hover:border-royal hover:text-royal hover:bg-royal/5 transition-all duration-200 shadow-2xs"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Quick-Search Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {quickSearchOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onQuickSearch(opt.filterParams)}
                className="group p-6 rounded-xl bg-white border border-stone hover:border-royal/50 shadow-subtle hover:shadow-card transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-lg bg-ivory text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-stone/50 text-charcoal/80 group-hover:bg-royal/10 group-hover:text-royal transition-colors">
                      {opt.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-charcoal group-hover:text-royal transition-colors mb-2">
                    {opt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                    {opt.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone/50 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-navy group-hover:text-brandRed transition-colors">
                  <span>Explore In Corridor</span>
                  <div className="w-6 h-6 rounded-full bg-ivory flex items-center justify-center group-hover:bg-brandRed/10 group-hover:text-brandRed group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
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
