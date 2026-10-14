import React from 'react';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import { localities } from '../data/localities';

export default function LocalityExplorer({ onSelectLocality, onNavigate }) {
  const handleClick = (loc) => {
    if (onNavigate) {
      onNavigate(`/locations/${loc.slug || loc.id}`);
    } else if (onSelectLocality) {
      onSelectLocality(loc.id);
    }
  };
  return (
    <section id="localities" className="py-20 sm:py-24 bg-white border-t border-stone/70">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-3">
            <Compass className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
            <span>Regional Footprint</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-4">
            Discover Properties Across Vasai to Palghar
          </h2>
          <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
            Explore active hubs across the western rail line and national highway corridor, from established residential coastal pockets to emerging industrial belts.
          </p>
        </div>

        {/* Locality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {localities.map((loc) => (
            <div
              key={loc.id}
              onClick={() => handleClick(loc)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-stone bg-white shadow-subtle hover:shadow-card hover:border-royal/50 transition-all duration-300 flex flex-col"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(loc);
                }
              }}
              aria-label={`Explore properties in ${loc.name}`}
            >
              {/* Locality Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone/40">
                <img
                  src={loc.image}
                  alt={`${loc.name} locality`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-transparent to-transparent" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded-sm bg-white/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-navy shadow-sm">
                    {loc.region}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white pointer-events-none">
                  <div className="flex items-center gap-1.5 font-serif text-2xl font-normal text-white">
                    <MapPin className="w-4 h-4 text-brandRed flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    <span className="text-white text-[#FFFFFF] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-normal">
                      {loc.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-brandRed mb-1.5">
                    {loc.tagline}
                  </p>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed mb-4">
                    {loc.description}
                  </p>

                  {/* Highlights tag pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {loc.keyHighlights.map((hl, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded bg-ivory border border-stone/80 text-charcoal/80 font-medium"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-3.5 border-t border-stone/60 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-navy group-hover:text-brandRed transition-colors">
                  <span>Explore Properties in {loc.name}</span>
                  <div className="w-7 h-7 rounded-full bg-ivory flex items-center justify-center group-hover:bg-brandRed/10 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-3.5 h-3.5 text-navy group-hover:text-brandRed" />
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
