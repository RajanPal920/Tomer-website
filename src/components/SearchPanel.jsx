import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, MapPin, Building, Activity, X, ChevronDown, Sparkles } from 'lucide-react';
import { LOCALITY_OPTIONS } from '../data/localities';

export const SEARCH_PROPERTY_TYPES = [
  { id: 'all', label: 'All Properties' },
  { id: 'flats', label: 'Flats / Apartments' },
  { id: 'new-flat', label: 'New Flats / New Homes' },
  { id: 'resale-flat', label: 'Resale Properties' },
  { id: 'flat-rent', label: 'Rental Properties' },
  { id: 'commercial-shop', label: 'Commercial Shops' },
  { id: 'commercial-office', label: 'Offices' },
  { id: 'commercial', label: 'Commercial Spaces' },
  { id: 'residential-plot', label: 'Residential Plots' },
  { id: 'industrial-plot', label: 'Industrial Plots' },
  { id: 'na-plot', label: 'Land / NA Plots' },
  { id: 'lease-property', label: 'Lease / Heavy Deposit' },
];

export const STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'available', label: 'Available properties' },
  { id: 'ready-to-move', label: 'Ready to Move' },
  { id: 'under-construction', label: 'Under Construction' },
  { id: 'sold', label: 'Sold' },
  { id: 'rented', label: 'Rented' },
];

export default function SearchPanel({ onSearch, activeFilters = {}, onReset }) {
  const [lookingFor, setLookingFor] = useState(
    activeFilters?.transactionType === 'rent' || activeFilters?.categoryTab === 'rentals'
      ? 'rent'
      : activeFilters?.transactionType === 'buy' || activeFilters?.categoryTab === 'buy'
      ? 'buy'
      : 'buy'
  );
  const [selectedPropertyType, setSelectedPropertyType] = useState(activeFilters?.category || 'all');
  const [selectedLocality, setSelectedLocality] = useState(activeFilters?.locality || 'all');
  const [selectedStatus, setSelectedStatus] = useState(activeFilters?.availabilityStatus || 'all');
  const [keyword, setKeyword] = useState(activeFilters?.searchQuery || '');

  // Synchronize internal state when external filter changes occur
  useEffect(() => {
    if (activeFilters) {
      if (activeFilters.transactionType === 'rent' || activeFilters.categoryTab === 'rentals') {
        setLookingFor('rent');
      } else if (activeFilters.transactionType === 'buy' || activeFilters.categoryTab === 'buy') {
        setLookingFor('buy');
      } else if (activeFilters.transactionType === 'all' || activeFilters.categoryTab === 'all') {
        setLookingFor('all');
      }

      if (activeFilters.category !== undefined) {
        setSelectedPropertyType(activeFilters.category);
      }
      if (activeFilters.locality !== undefined) {
        setSelectedLocality(activeFilters.locality);
      }
      if (activeFilters.availabilityStatus !== undefined) {
        setSelectedStatus(activeFilters.availabilityStatus);
      }
      if (activeFilters.searchQuery !== undefined) {
        setKeyword(activeFilters.searchQuery);
      }
    }
  }, [activeFilters]);

  const handlePropertyTypeChange = (newType) => {
    setSelectedPropertyType(newType);
    if (newType === 'flat-rent') {
      setLookingFor('rent');
    } else if (['new-flat', 'resale-flat', 'residential-plot', 'industrial-plot', 'na-plot'].includes(newType)) {
      setLookingFor('buy');
    } else if (newType === 'lease-property') {
      setLookingFor('all');
    }
  };

  const handleLookingForChange = (type) => {
    setLookingFor(type);
    if (onSearch) {
      onSearch({
        transactionType: type,
        categoryTab: type,
        category: selectedPropertyType,
        locality: selectedLocality,
        availabilityStatus: selectedStatus,
        searchQuery: keyword.trim(),
      });
    }
  };

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onSearch) {
      onSearch({
        transactionType: lookingFor,
        categoryTab: lookingFor,
        category: selectedPropertyType,
        locality: selectedLocality,
        availabilityStatus: selectedStatus,
        searchQuery: keyword.trim(),
      });
    }
  };

  const handleClearFilters = () => {
    setLookingFor('buy');
    setSelectedPropertyType('all');
    setSelectedLocality('all');
    setSelectedStatus('all');
    setKeyword('');
    if (onReset) {
      onReset();
    }
  };

  return (
    <section
      aria-label="Property Search Section"
      className="relative -mt-10 sm:-mt-14 z-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden">
        {/* Navy Header Banner Area */}
        <div className="bg-navy px-6 py-6 sm:px-10 sm:py-8 text-white border-b border-navy-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brandRed-200 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest border border-white/10 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-brandRed" />
              <span className="text-stone-100">Railway & Highway Corridor Discovery</span>
            </div>
            <span className="text-stone-300 text-[13px] hidden md:inline font-medium">
              Vasai Road • Nalasopara • Virar • Saphale • Kelve Road • Palghar • Boisar
            </span>
          </div>

          <h2 className="font-serif text-[23px] sm:text-[30px] lg:text-[36px] font-bold text-white tracking-tight leading-tight">
            Search Any Property from Vasai to Palghar
          </h2>
          <p className="mt-2 text-stone-200 text-[15px] sm:text-[17px] max-w-3xl leading-relaxed">
            Find your ideal home, rental apartment, commercial space, or land with one simple search.
          </p>
        </div>

        {/* LOOKING FOR: Buy / Rent / All Opportunities Tab Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center border-b border-stone-200 bg-stone-50/80 px-4 sm:px-8">
          <div className="flex items-center gap-2 py-3 sm:py-4 pr-6 sm:border-r border-stone-200 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy">
            <span>LOOKING FOR:</span>
          </div>

          <div className="flex flex-1 items-stretch gap-2 sm:gap-3 py-2 sm:py-0 sm:pl-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleLookingForChange('buy')}
              className={`py-3 px-5 sm:px-6 rounded-xl sm:rounded-none sm:py-4 text-center text-[14px] sm:text-[16px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap sm:border-b-4 ${
                lookingFor === 'buy'
                  ? 'bg-white sm:bg-transparent text-brandRed sm:border-brandRed shadow-xs sm:shadow-none'
                  : 'text-charcoal/70 sm:border-transparent hover:text-navy hover:bg-white/70'
              }`}
              aria-selected={lookingFor === 'buy'}
              role="tab"
            >
              Buy Properties
            </button>
            <button
              type="button"
              onClick={() => handleLookingForChange('rent')}
              className={`py-3 px-5 sm:px-6 rounded-xl sm:rounded-none sm:py-4 text-center text-[14px] sm:text-[16px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap sm:border-b-4 ${
                lookingFor === 'rent'
                  ? 'bg-white sm:bg-transparent text-brandRed sm:border-brandRed shadow-xs sm:shadow-none'
                  : 'text-charcoal/70 sm:border-transparent hover:text-navy hover:bg-white/70'
              }`}
              aria-selected={lookingFor === 'rent'}
              role="tab"
            >
              Rent Properties
            </button>
            <button
              type="button"
              onClick={() => handleLookingForChange('all')}
              className={`py-3 px-5 sm:px-6 rounded-xl sm:rounded-none sm:py-4 text-center text-[14px] sm:text-[16px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap sm:border-b-4 ${
                lookingFor === 'all'
                  ? 'bg-white sm:bg-transparent text-brandRed sm:border-brandRed shadow-xs sm:shadow-none'
                  : 'text-charcoal/70 sm:border-transparent hover:text-navy hover:bg-white/70'
              }`}
              aria-selected={lookingFor === 'all'}
              role="tab"
            >
              All Opportunities
            </button>
          </div>
        </div>

        {/* Search Controls Form */}
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 lg:p-9 bg-white">
          {/* Top Row: Property Type, Location, Availability / Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">
            {/* Control B: Property Type */}
            <div>
              <label
                htmlFor="search-property-type"
                className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5"
              >
                <Building className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>PROPERTY TYPE</span>
              </label>
              <div className="relative">
                <select
                  id="search-property-type"
                  value={selectedPropertyType}
                  onChange={(e) => handlePropertyTypeChange(e.target.value)}
                  className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[16px] sm:text-[17px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs"
                >
                  {SEARCH_PROPERTY_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
              </div>
            </div>

            {/* Control C: Location (Railway Corridor) */}
            <div>
              <label
                htmlFor="search-location"
                className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5"
              >
                <MapPin className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>LOCATION</span>
              </label>
              <div className="relative">
                <select
                  id="search-location"
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[16px] sm:text-[17px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs"
                >
                  {LOCALITY_OPTIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
              </div>
            </div>

            {/* Control D: Availability / Status */}
            <div>
              <label
                htmlFor="search-status"
                className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5"
              >
                <Activity className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>AVAILABILITY / STATUS</span>
              </label>
              <div className="relative">
                <select
                  id="search-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[16px] sm:text-[17px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Keyword Search + Search & Clear Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
            {/* Control E: Keyword Search */}
            <div className="flex-1">
              <label
                htmlFor="search-keyword"
                className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5"
              >
                <Search className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>KEYWORD SEARCH</span>
              </label>
              <div className="relative">
                <input
                  id="search-keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by title, location, landmark, project name..."
                  className="w-full h-[52px] bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-11 text-[16px] sm:text-[17px] font-medium text-charcoal placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all shadow-xs"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-navy cursor-pointer p-1 rounded-md"
                    title="Clear keyword"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1 md:pt-0">
              <button
                type="submit"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 h-[52px] px-8 sm:px-9 bg-brandRed hover:bg-[#c91916] active:bg-[#a81412] text-white font-bold text-[15px] sm:text-[16px] uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brandRed/40 cursor-pointer"
              >
                <Search className="w-4 h-4 text-white" />
                <span>Search Properties</span>
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                title="Clear All Filters"
                className="inline-flex items-center justify-center gap-2 h-[52px] px-5 sm:px-6 bg-white hover:bg-stone-50 border-2 border-navy/20 hover:border-navy text-navy font-bold text-[14px] sm:text-[15px] uppercase tracking-wider rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/30 shadow-2xs cursor-pointer flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4 text-navy" />
                <span className="hidden sm:inline">Clear Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Corridor Suggestions */}
          <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-muted">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[14px] font-bold text-navy whitespace-nowrap">
                Quick Searches:
              </span>
              <button
                type="button"
                onClick={() => {
                  setLookingFor('buy');
                  setSelectedLocality('virar');
                  setSelectedPropertyType('flats');
                  setSelectedStatus('available');
                  setKeyword('');
                  if (onSearch) onSearch({ transactionType: 'buy', locality: 'virar', category: 'flats', availabilityStatus: 'available', searchQuery: '' });
                }}
                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy-900 border border-navy/20 hover:border-navy/40 transition-all cursor-pointer shadow-2xs"
              >
                Virar Available Flats
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookingFor('buy');
                  setSelectedLocality('boisar');
                  setSelectedPropertyType('industrial-plot');
                  setSelectedStatus('all');
                  setKeyword('');
                  if (onSearch) onSearch({ transactionType: 'buy', locality: 'boisar', category: 'industrial-plot', availabilityStatus: 'all', searchQuery: '' });
                }}
                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy-900 border border-navy/20 hover:border-navy/40 transition-all cursor-pointer shadow-2xs"
              >
                Boisar Industrial Plots
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookingFor('rent');
                  setSelectedLocality('vasai-road');
                  setSelectedPropertyType('flats');
                  setSelectedStatus('all');
                  setKeyword('');
                  if (onSearch) onSearch({ transactionType: 'rent', locality: 'vasai-road', category: 'flats', availabilityStatus: 'all', searchQuery: '' });
                }}
                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy-900 border border-navy/20 hover:border-navy/40 transition-all cursor-pointer shadow-2xs"
              >
                Vasai Rental Flats
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookingFor('buy');
                  setSelectedLocality('palghar');
                  setSelectedPropertyType('na-plot');
                  setSelectedStatus('ready-to-move');
                  setKeyword('');
                  if (onSearch) onSearch({ transactionType: 'buy', locality: 'palghar', category: 'na-plot', availabilityStatus: 'ready-to-move', searchQuery: '' });
                }}
                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold bg-navy/5 text-navy hover:bg-navy/10 hover:text-navy-900 border border-navy/20 hover:border-navy/40 transition-all cursor-pointer shadow-2xs"
              >
                Palghar Ready NA Plots
              </button>
            </div>

            <span className="text-[12.5px] sm:text-[13px] text-stone-500 font-medium">
              * Official Vasai to Boisar Railway Corridor Real Estate Service
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
