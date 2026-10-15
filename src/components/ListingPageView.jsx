import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';
import { getAllProperties } from '../data/properties';
import { fetchLiveProperties, subscribeToProperties } from '../services/propertyStore';
import {
  filterProperties,
  CATEGORY_TABS,
  normalizeTabId,
} from '../services/propertySearch';
import { APPROVED_STATIONS, LOCATION_DROPDOWN_OPTIONS } from '../data/locations';
import PropertyCard from './PropertyCard';

export default function ListingPageView({
  initialTab = 'all',
  pageTitle = 'Property Opportunities',
  pageDescription = 'Explore verified properties across the Vasai-to-Palghar corridor with Tomar Enterprises.',
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

  // Active filters state
  const [prevTabProp, setPrevTabProp] = useState(initialTab);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaxBudget, setSelectedMaxBudget] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9); // Initial 9 items, then Load More

  // Synchronize state on prop change during render
  if (prevTabProp !== initialTab) {
    setPrevTabProp(initialTab);
    setActiveTab(initialTab);
    setVisibleCount(9);
  }

  // Derived filtered dataset
  const filteredListings = useMemo(() => {
    return filterProperties(allProperties, {
      categoryTab: activeTab,
      locality: selectedLocality,
      category: selectedCategory,
      maxBudget: selectedMaxBudget !== 'all' ? Number(selectedMaxBudget) : null,
      bedrooms: selectedBhk !== 'all' ? Number(selectedBhk) : 'all',
      searchQuery: searchQuery,
      sortBy: selectedSort,
    });
  }, [allProperties, activeTab, selectedLocality, selectedCategory, selectedMaxBudget, selectedBhk, searchQuery, selectedSort]);

  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

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
    if (selectedCategory !== 'all') {
      pills.push({ label: `Type: ${selectedCategory.replace('-', ' ')}`, onClear: () => setSelectedCategory('all') });
    }
    if (selectedMaxBudget !== 'all') {
      const val = Number(selectedMaxBudget);
      const text = val >= 10000000 ? `Budget ≤ ₹${(val / 10000000).toFixed(1)} Cr` : `Budget ≤ ₹${(val / 100000).toFixed(0)} Lakh`;
      pills.push({ label: text, onClear: () => setSelectedMaxBudget('all') });
    }
    if (selectedBhk !== 'all') {
      pills.push({ label: `${selectedBhk} BHK`, onClear: () => setSelectedBhk('all') });
    }
    if (searchQuery.trim()) {
      pills.push({ label: `"${searchQuery.trim()}"`, onClear: () => setSearchQuery('') });
    }
    return pills;
  }, [activeTab, selectedLocality, selectedCategory, selectedMaxBudget, selectedBhk, searchQuery]);

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

        {/* Interactive Search & Filter Controls Panel */}
        <div className="bg-white rounded-2xl border border-stone p-5 sm:p-6 mb-8 shadow-card">
          {/* Top Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-5 border-b border-stone/60 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'plots-land' || tab.id === 'commercial' || tab.id === 'lease-heavy-deposit') {
                      setSelectedBhk('all');
                    }
                    setVisibleCount(9);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all ${isActive
                      ? 'bg-navy text-white shadow-2xs'
                      : 'bg-ivory text-charcoal hover:bg-stone/50 border border-stone/60'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Field 1: Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                Location Area
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => {
                  setSelectedLocality(e.target.value);
                  setVisibleCount(9);
                }}
                className="w-full bg-ivory/60 border border-stone rounded-xl px-3.5 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
              >
                {LOCATION_DROPDOWN_OPTIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Max Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                Maximum Budget
              </label>
              <select
                value={selectedMaxBudget}
                onChange={(e) => {
                  setSelectedMaxBudget(e.target.value);
                  setVisibleCount(9);
                }}
                className="w-full bg-ivory/60 border border-stone rounded-xl px-3.5 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
              >
                <option value="all">Any Budget</option>
                <option value="3000000">Up to ₹30 Lakh</option>
                <option value="5000000">Up to ₹50 Lakh</option>
                <option value="7500000">Up to ₹75 Lakh</option>
                <option value="10000000">Up to ₹1 Crore</option>
                <option value="15000000">Up to ₹1.5 Crore</option>
              </select>
            </div>

            {/* Field 3: BHK / Configuration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                BHK (Residential)
              </label>
              <select
                value={selectedBhk}
                onChange={(e) => {
                  setSelectedBhk(e.target.value);
                  setVisibleCount(9);
                }}
                disabled={activeTab === 'plots-land' || activeTab === 'commercial'}
                className="w-full bg-ivory/60 border border-stone rounded-xl px-3.5 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">
                  {activeTab === 'plots-land' || activeTab === 'commercial' ? 'N/A for Land & Commercial' : 'Any Configuration'}
                </option>
                <option value="1">1 BHK Only</option>
                <option value="2">2 BHK Only</option>
                <option value="3">3 BHK Only</option>
              </select>
            </div>

            {/* Field 4: Keyword Search + Reset */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(9);
                  }}
                  placeholder="Keyword or project..."
                  className="w-full bg-ivory/60 border border-stone rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                />
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-3" />
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset All Filters"
                className="h-10 w-10 flex items-center justify-center text-muted hover:text-navy hover:bg-ivory border border-stone rounded-xl transition-colors flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterPills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-navy mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-royal" />
                <span>Filters:</span>
              </span>
              {activeFilterPills.map((pill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-ivory border border-stone text-xs font-semibold text-charcoal"
                >
                  <span>{pill.label}</span>
                  <button
                    type="button"
                    onClick={pill.onClear}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-navy hover:text-brandRed underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Header: Sort controls & Count */}
        <div className="flex items-center justify-between mb-6">
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
