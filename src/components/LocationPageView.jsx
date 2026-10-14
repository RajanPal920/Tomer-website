import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ChevronRight,
  Train,
  CheckCircle2,
  Phone,
  Info,
  Compass,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { resolveCanonicalLocation, APPROVED_STATIONS } from '../data/locations';
import { getAllProperties } from '../data/properties';
import { filterProperties } from '../services/propertySearch';
import { contactInfo } from '../data/contactInfo';
import PropertyCard from './PropertyCard';

export default function LocationPageView({ slug, onNavigate, onEnquire }) {
  const station = resolveCanonicalLocation(slug) || APPROVED_STATIONS.find((s) => s.slug === slug);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('recommended');

  const allProps = getAllProperties();

  // Filter listings strictly matching this canonical location
  const locationListings = useMemo(() => {
    if (!station) return [];
    return filterProperties(allProps, {
      locality: station.locationId,
      categoryTab: activeCategoryFilter,
      sortBy: activeSort,
    });
  }, [allProps, station, activeCategoryFilter, activeSort]);

  const categoryCounts = useMemo(() => {
    if (!station) return { total: 0, buy: 0, rent: 0, commercial: 0, plots: 0 };
    const total = filterProperties(allProps, { locality: station.locationId, categoryTab: 'all' }).length;
    const buy = filterProperties(allProps, { locality: station.locationId, categoryTab: 'buy' }).length;
    const rent = filterProperties(allProps, { locality: station.locationId, categoryTab: 'rentals' }).length;
    const commercial = filterProperties(allProps, { locality: station.locationId, categoryTab: 'commercial' }).length;
    const plots = filterProperties(allProps, { locality: station.locationId, categoryTab: 'plots-land' }).length;
    return { total, buy, rent, commercial, plots };
  }, [allProps, station]);

  if (!station) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-ivory">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-stone/50 text-navy flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-royal" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-charcoal mb-2">
            Location Not Found
          </h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            The service area you requested is not currently recognized in the Vasai-to-Palghar corridor.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    );
  }

  const whatsappLocationUrl = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(
    `Hello Tomar Enterprises, I am inquiring about available properties, plots, or upcoming mandates in ${station.canonicalName}.`
  )}`;

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-navy hover:underline transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <button
            type="button"
            onClick={() => onNavigate('/properties')}
            className="hover:text-navy hover:underline transition-colors"
          >
            Locations
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <span className="text-charcoal font-semibold">{station.canonicalName}</span>
        </nav>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden border border-stone bg-navy-900 text-white mb-10 shadow-elevated">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={station.image}
              alt={station.canonicalName}
              className="w-full h-full object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-brandRed text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-white/10">
              <Train className="w-3.5 h-3.5" />
              <span>{station.stationName}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight mb-4">
              Real Estate in {station.canonicalName}
            </h1>

            <p className="text-stone text-base sm:text-lg leading-relaxed mb-6 font-normal">
              {station.description}
            </p>

            {/* Key Highlights */}
            {station.keyHighlights && station.keyHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {station.keyHighlights.map((hl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-stone border border-white/15"
                  >
                    <CheckCircle2 className="w-3 h-3 text-brandRed flex-shrink-0" />
                    <span>{hl}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Direct Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Enquire About {station.canonicalName}</span>
              </a>

              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/25 transition-colors"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call Advisory Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Micro-Localities Grid if available */}
        {station.localities && station.localities.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl border border-stone p-6 sm:p-7 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brandRed" />
              <span>Approved Micro-Localities in {station.canonicalName}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {station.localities.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-xl bg-ivory/60 border border-stone/70 flex flex-col justify-between"
                >
                  <strong className="text-sm font-serif text-navy">{loc.name}</strong>
                  <span className="text-xs text-muted mt-1">{loc.highlights}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-stone p-4 sm:p-5 mb-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All (${categoryCounts.total})` },
              { id: 'buy', label: `Buy (${categoryCounts.buy})` },
              { id: 'rentals', label: `Rent (${categoryCounts.rent})` },
              { id: 'commercial', label: `Commercial (${categoryCounts.commercial})` },
              { id: 'plots-land', label: `Plots & Land (${categoryCounts.plots})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategoryFilter === tab.id
                    ? 'bg-navy text-white shadow-2xs'
                    : 'bg-ivory text-charcoal hover:bg-stone/40 border border-stone/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted uppercase font-bold">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-ivory border border-stone rounded-lg px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="recommended">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Area: Largest First</option>
            </select>
          </div>
        </div>

        {/* Listings Section */}
        {locationListings.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-normal text-charcoal">
                Available Listings in {station.canonicalName} ({locationListings.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {locationListings.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onNavigate={onNavigate}
                  onEnquire={onEnquire}
                />
              ))}
            </div>
          </div>
        ) : (
          /* TRUTHFUL, HONEST EMPTY STATE REQUIRED BY SECTION 14 */
          <div className="bg-white rounded-3xl border border-stone p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-ivory text-navy flex items-center justify-center mx-auto mb-4 border border-stone">
              <Info className="w-8 h-8 text-royal" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal mb-2">
              No Current Public Listings in {station.canonicalName}
            </h3>

            <p className="text-muted text-sm leading-relaxed mb-6 max-w-lg mx-auto">
              Tomar Enterprises handles selective land acquisitions, upcoming farm plot layouts, and private owner mandates in the {station.canonicalName} station corridor. Submit your requirement to be notified as verified inventory becomes available.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Enquire for {station.canonicalName} Inventory</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('/properties')}
                className="px-6 py-2.5 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Other Locations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
