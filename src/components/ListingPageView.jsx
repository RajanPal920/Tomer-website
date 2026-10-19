import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  ArrowRight,
  Info,
  X,
  Sparkles,
  MapPin,
  Building,
  IndianRupee,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { getAllProperties } from '../data/properties';
import { fetchLiveProperties, subscribeToProperties } from '../services/propertyStore';
import {
  filterProperties,
  CATEGORY_TABS,
  normalizeTabId,
  isCategoryCompatibleWithTab,
  getFiltersFromUrl,
  syncFiltersToUrl,
} from '../services/propertySearch';
import { APPROVED_STATIONS, LOCATION_DROPDOWN_OPTIONS } from '../data/locations';
import PropertyCard from './PropertyCard';

export default function ListingPageView({
  initialTab = 'all',
  pageTitle = 'Property Opportunities',
  pageDescription = 'Explore verified properties across the Vasai-to-Boisar corridor with Tomar Enterprises.',
  onNavigate,
  onEnquire,
}) {
  const [allProperties, setAllProperties] = useState(() => getAllProperties());

  // Subscribe to live property store
  useEffect(() => {
    fetchLiveProperties().catch(() => { });
    return subscribeToProperties((liveProps) => {
      if (Array.isArray(liveProps) && liveProps.length > 0) {
        setAllProperties(liveProps);
      }
    });
  }, []);

  const urlFilters = useMemo(() => getFiltersFromUrl(), []);

  // Active filters state
  const [prevTabProp, setPrevTabProp] = useState(initialTab);
  const [activeTab, setActiveTab] = useState(() => {
    if (urlFilters.categoryTab && urlFilters.categoryTab !== 'all') return urlFilters.categoryTab;
    if (urlFilters.transactionType && urlFilters.transactionType !== 'all') return urlFilters.transactionType;
    return initialTab || 'all';
  });
  const [selectedLocality, setSelectedLocality] = useState(() => urlFilters.locality || 'all');
  const [selectedCategory, setSelectedCategory] = useState(() => urlFilters.category || 'all');
  const [selectedMaxBudget, setSelectedMaxBudget] = useState(() => (urlFilters.maxBudget ? String(urlFilters.maxBudget) : 'all'));
  const [selectedBhk, setSelectedBhk] = useState(() => (urlFilters.bedrooms ? String(urlFilters.bedrooms) : 'all'));
  const [selectedSort, setSelectedSort] = useState(() => urlFilters.sortBy || 'recommended');
  const [searchQuery, setSearchQuery] = useState(() => urlFilters.searchQuery || '');
  const [visibleCount, setVisibleCount] = useState(9); // Initial 9 items, then Load More

  // Synchronize state on prop change during render
  if (prevTabProp !== initialTab) {
    setPrevTabProp(initialTab);
    setActiveTab(initialTab);
    setVisibleCount(9);
  }

  // Synchronize active filters to browser URL search params for bookmarking and page refresh
  useEffect(() => {
    syncFiltersToUrl({
      categoryTab: activeTab,
      transactionType: activeTab,
      locality: selectedLocality,
      category: selectedCategory,
      maxBudget: selectedMaxBudget !== 'all' ? Number(selectedMaxBudget) : null,
      bedrooms: selectedBhk !== 'all' ? Number(selectedBhk) : 'all',
      sortBy: selectedSort,
      searchQuery: searchQuery,
    });
  }, [activeTab, selectedLocality, selectedCategory, selectedMaxBudget, selectedBhk, selectedSort, searchQuery]);

  // Ensure selectedCategory is compatible with activeTab
  const effectiveCategory = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      if (isCategoryCompatibleWithTab(selectedCategory, activeTab)) {
        return selectedCategory;
      }
    }
    return 'all';
  }, [selectedCategory, activeTab]);

  // Derived filtered dataset
  const filteredListings = useMemo(() => {
    return filterProperties(allProperties, {
      categoryTab: activeTab,
      locality: selectedLocality,
      category: effectiveCategory,
      maxBudget: selectedMaxBudget !== 'all' ? Number(selectedMaxBudget) : null,
      bedrooms: selectedBhk !== 'all' ? Number(selectedBhk) : 'all',
      searchQuery: searchQuery,
      sortBy: selectedSort,
    });
  }, [allProperties, activeTab, selectedLocality, effectiveCategory, selectedMaxBudget, selectedBhk, searchQuery, selectedSort]);

  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setVisibleCount(9);
    const el = document.getElementById('listings-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setActiveTab(initialTab);
    setSelectedLocality('all');
    setSelectedCategory('all');
    setSelectedMaxBudget('all');
    setSelectedBhk('all');
    setSearchQuery('');
    setSelectedSort('recommended');
    setVisibleCount(9);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const activeFilterPills = useMemo(() => {
    const pills = [];
    if (activeTab !== 'all') {
      const tabObj = CATEGORY_TABS.find((t) => t.id === normalizeTabId(activeTab));
      pills.push({ label: `Category: ${tabObj ? tabObj.label : activeTab}`, onClear: () => setActiveTab('all') });
    }
    if (selectedLocality !== 'all') {
      const locObj = APPROVED_STATIONS.find((s) => s.locationId === selectedLocality);
      pills.push({ label: `Location: ${locObj ? locObj.canonicalName : selectedLocality}`, onClear: () => setSelectedLocality('all') });
    }
    if (effectiveCategory !== 'all') {
      pills.push({ label: `Type: ${effectiveCategory.replace('-', ' ')}`, onClear: () => setSelectedCategory('all') });
    }
    if (selectedMaxBudget !== 'all') {
      const val = Number(selectedMaxBudget);
      const text = val >= 10000000 ? `Budget ≤ ₹${(val / 10000000).toFixed(1)} Cr` : `Budget ≤ ₹${(val / 100000).toFixed(0)} Lakh`;
      pills.push({ label: text, onClear: () => setSelectedMaxBudget('all') });
    }
    if (selectedBhk !== 'all' && activeTab !== 'plots-land' && activeTab !== 'commercial') {
      pills.push({ label: `${selectedBhk} BHK`, onClear: () => setSelectedBhk('all') });
    }
    if (searchQuery.trim()) {
      pills.push({ label: `"${searchQuery.trim()}"`, onClear: () => setSearchQuery('') });
    }
    return pills;
  }, [activeTab, selectedLocality, effectiveCategory, selectedMaxBudget, selectedBhk, searchQuery]);

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-navy hover:underline transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <span className="text-charcoal font-semibold">{pageTitle}</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 mb-8 shadow-card flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-2">
              <span>Catalog & Discovery</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight text-balance mb-3">
              {pageTitle}
            </h1>
            <p className="text-muted text-sm sm:text-base leading-relaxed text-balance">
              {pageDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-2 rounded-xl bg-navy/5 border border-navy/15 text-xs font-bold text-navy shadow-2xs">
              <span className="text-brandRed font-bold mr-1.5">●</span>
              <span>{filteredListings.length} {filteredListings.length === 1 ? 'Property' : 'Properties'} Found</span>
            </div>
          </div>
        </div>

        {/* Interactive Search & Filter Controls Panel (Styled identically to Home Page Search Panel) */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden mb-10">
          {/* Navy Header Banner Area */}
          <div className="bg-navy px-6 py-5 sm:px-8 sm:py-6 text-white border-b border-navy-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brandRed-200 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest border border-white/10 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-brandRed" />
                <span className="text-stone-100">Railway & Highway Corridor Discovery</span>
              </div>
              <span className="text-stone-300 text-[13px] hidden md:inline font-medium">
                Vasai Road • Nalasopara • Virar • Saphale • Kelve Road • Palghar • Boisar
              </span>
            </div>

            <h2 className="font-serif text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-white tracking-tight leading-tight">
              Search & Filter Any Property Across the Corridor
            </h2>
            <p className="mt-1.5 text-stone-200 text-[14px] sm:text-[16px] max-w-3xl leading-relaxed">
              Find your ideal home, rental apartment, commercial space, or land with precision filters.
            </p>
          </div>

          {/* LOOKING FOR: Category Tab Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center border-b border-stone-200 bg-stone-50/80 px-4 sm:px-8">
            <div className="flex items-center gap-2 py-3 sm:py-4 pr-6 sm:border-r border-stone-200 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy">
              <span>LOOKING FOR:</span>
            </div>

            <div className="flex flex-1 items-stretch gap-2 sm:gap-3 py-2 sm:py-0 sm:pl-6 overflow-x-auto scrollbar-none">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      const newTab = tab.id;
                      setActiveTab(newTab);
                      if (!isCategoryCompatibleWithTab(selectedCategory, newTab)) {
                        setSelectedCategory('all');
                      }
                      if (newTab === 'plots-land' || newTab === 'commercial' || newTab === 'lease-heavy-deposit') {
                        setSelectedBhk('all');
                      }
                      setVisibleCount(9);
                    }}
                    className={`py-3 px-4 sm:px-5 rounded-xl sm:rounded-none sm:py-4 text-center text-[13.5px] sm:text-[15px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap sm:border-b-4 ${
                      isActive
                        ? 'bg-white sm:bg-transparent text-brandRed sm:border-brandRed shadow-xs sm:shadow-none'
                        : 'text-charcoal/70 sm:border-transparent hover:text-navy hover:bg-white/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Controls Form */}
          <form onSubmit={handleSearchSubmit} className="p-6 sm:p-8 bg-white">
            {/* Top Row: Location, Maximum Budget, BHK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">
              {/* Field 1: Location Area */}
              <div>
                <label className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5">
                  <MapPin className="w-4 h-4 text-brandRed flex-shrink-0" />
                  <span>LOCATION AREA</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedLocality}
                    onChange={(e) => {
                      setSelectedLocality(e.target.value);
                      setVisibleCount(9);
                    }}
                    className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[15.5px] sm:text-[16px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs"
                  >
                    {LOCATION_DROPDOWN_OPTIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Maximum Budget */}
              <div>
                <label className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5">
                  <IndianRupee className="w-4 h-4 text-brandRed flex-shrink-0" />
                  <span>MAXIMUM BUDGET</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedMaxBudget}
                    onChange={(e) => {
                      setSelectedMaxBudget(e.target.value);
                      setVisibleCount(9);
                    }}
                    className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[15.5px] sm:text-[16px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs"
                  >
                    <option value="all">Any Budget</option>
                    <option value="3000000">Up to ₹30 Lakh</option>
                    <option value="5000000">Up to ₹50 Lakh</option>
                    <option value="7500000">Up to ₹75 Lakh</option>
                    <option value="10000000">Up to ₹1 Crore</option>
                    <option value="15000000">Up to ₹1.5 Crore</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: BHK / Configuration */}
              <div>
                <label className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5">
                  <Layers className="w-4 h-4 text-brandRed flex-shrink-0" />
                  <span>CONFIGURATION (BHK)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBhk}
                    onChange={(e) => {
                      setSelectedBhk(e.target.value);
                      setVisibleCount(9);
                    }}
                    disabled={activeTab === 'plots-land' || activeTab === 'commercial'}
                    className="w-full h-[52px] appearance-none bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-10 text-[15.5px] sm:text-[16px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">
                      {activeTab === 'plots-land' || activeTab === 'commercial' ? 'N/A for Land & Commercial' : 'Any Configuration'}
                    </option>
                    <option value="1">1 BHK Only</option>
                    <option value="2">2 BHK Only</option>
                    <option value="3">3 BHK Only</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bottom Row: Keyword Search + Action Buttons */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
              {/* Field 4: Keyword Search */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-navy mb-2.5">
                  <Search className="w-4 h-4 text-brandRed flex-shrink-0" />
                  <span>KEYWORD SEARCH</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(9);
                    }}
                    placeholder="Search by title, location, landmark, project name..."
                    className="w-full h-[52px] bg-white border border-stone-300 hover:border-stone-400 rounded-xl pl-4 pr-11 text-[15.5px] sm:text-[16px] font-medium text-charcoal placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setVisibleCount(9);
                      }}
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
                  onClick={handleSearchSubmit}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2.5 h-[52px] px-8 sm:px-9 bg-brandRed hover:bg-[#c91916] active:bg-[#a81412] text-white font-bold text-[15px] sm:text-[16px] uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brandRed/40 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span>Search Properties</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Clear All Filters"
                  className="inline-flex items-center justify-center gap-2 h-[52px] px-5 sm:px-6 bg-white hover:bg-stone-50 border-2 border-navy/20 hover:border-navy text-navy font-bold text-[14px] sm:text-[15px] uppercase tracking-wider rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/30 shadow-2xs cursor-pointer flex-shrink-0"
                >
                  <RotateCcw className="w-4 h-4 text-navy" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </button>

                <span className="text-[13px] font-bold text-navy hidden xl:inline-flex items-center gap-1.5 ml-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} matching</span>
                </span>
              </div>
            </div>

            {/* Active Filter Badges */}
            {activeFilterPills.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-navy mr-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-royal" />
                  <span>Active Filters:</span>
                </span>
                {activeFilterPills.map((pill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy/5 border border-navy/20 text-[12.5px] font-semibold text-navy"
                  >
                    <span>{pill.label}</span>
                    <button
                      type="button"
                      onClick={pill.onClear}
                      className="hover:text-brandRed transition-colors cursor-pointer"
                      title="Remove filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[13px] font-bold text-brandRed hover:underline ml-2 cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Results Header: Sort controls & Count */}
        <div id="listings-results" className="flex items-center justify-between mb-6 scroll-mt-28">
          <div className="text-sm font-bold text-charcoal">
            Showing {visibleListings.length} of {filteredListings.length} listings
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-white border border-stone rounded-lg px-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-royal"
            >
              <option value="recommended">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Area: Largest First</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {visibleListings.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleListings.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onNavigate={onNavigate}
                  onEnquire={onEnquire}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <span>Load More Listings ({filteredListings.length - visibleCount} remaining)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-stone p-8 sm:p-12 text-center max-w-xl mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-ivory text-navy flex items-center justify-center mx-auto mb-4 border border-stone">
              <Info className="w-8 h-8 text-royal" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal mb-2">
              No matching properties found
            </h3>

            <p className="text-muted text-sm leading-relaxed mb-6">
              We couldn't find any properties satisfying all the chosen filter parameters. Try broadening your criteria or reset your filters.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Reset All Filters
              </button>

              <button
                type="button"
                onClick={() => onEnquire({ title: 'Custom Property Requirement in Vasai-Palghar' })}
                className="px-6 py-2.5 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Submit Custom Requirement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
