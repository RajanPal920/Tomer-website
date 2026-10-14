import React from 'react';
import { Home, Briefcase, ArrowRight, Check } from 'lucide-react';

export default function ResidentialVsCommercial({ onSelectPanel }) {
  return (
    <section className="py-20 bg-ivory border-b border-stone/60">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Panel 1: Residential */}
          <div className="relative rounded-2xl overflow-hidden border border-stone bg-white shadow-card flex flex-col justify-between group">
            {/* Top Image Half */}
            <div className="relative h-64 sm:h-72 overflow-hidden bg-stone/30">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                alt="Residential living spaces"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/95 backdrop-blur-md text-navy text-xs font-bold uppercase tracking-wider shadow-sm">
                <Home className="w-3.5 h-3.5 text-royal" />
                <span>Residential Living</span>
              </div>
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal drop-shadow">
                  Find Your Next Home
                </h3>
              </div>
            </div>

            {/* Content Bottom Half */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
                  Whether stepping into your first 1 BHK apartment, upgrading to a spacious gated community, or seeking verified family rentals with municipal water and transport access.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {['New flats', 'Resale flats', 'Rental homes', 'Residential plots'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-charcoal">
                      <div className="w-5 h-5 rounded-full bg-royal/10 text-royal flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onSelectPanel('Residential')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Explore Residential</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel 2: Commercial */}
          <div className="relative rounded-2xl overflow-hidden border border-stone bg-white shadow-card flex flex-col justify-between group">
            {/* Top Image Half */}
            <div className="relative h-64 sm:h-72 overflow-hidden bg-stone/30">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Commercial offices and enterprise spaces"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-navy text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-brandRed" />
                <span>Commercial & Enterprise</span>
              </div>
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal drop-shadow">
                  Find Space for Your Business
                </h3>
              </div>
            </div>

            {/* Content Bottom Half */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
                  Position your retail venture on high-footfall main roads, secure Grade-A corporate office suites, or acquire industrial land within Boisar MIDC and logistics corridors.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {['Shops', 'Commercial offices', 'Commercial land', 'Industrial plots', 'Lease properties'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-charcoal">
                      <div className="w-5 h-5 rounded-full bg-brandRed/10 text-brandRed flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onSelectPanel('Commercial')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Explore Commercial</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
