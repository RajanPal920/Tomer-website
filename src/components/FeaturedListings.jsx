import React, { useState, useEffect, useMemo } from 'react';
import { Info, RotateCcw, Filter, ArrowRight, Sparkles, CheckCircle2, Clock, Check } from 'lucide-react';
import {
  CATEGORY_TABS,
  normalizeTabId,
  isCategoryCompatibleWithTab,
} from '../services/propertySearch';
import { getLocationDisplayName } from '../data/locations';
import PropertyCard from './PropertyCard';

export { CATEGORY_TABS as FILTER_TABS };

export default function FeaturedListings({
  properties = [],
  activeFilters = {},
  totalCount: _totalCount = 0,
  onFilterChange,
  onResetFilters,
  onViewDetails,
  onEnquire,
  onNavigate,
  searchQueryInfo,
}) {
  // Single source of truth for the active tab (normalized to one of the 6 stable identifiers)
  const currentTab = normalizeTabId(activeFilters.categoryTab || activeFilters.transactionType || 'all');
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visible card count whenever tab changes
  useEffect(() => {
    setVisibleCount(12);
  }, [currentTab]);

  // Derived counts calculated strictly from the filtered properties
  const counts = useMemo(() => {
    let total = properties.length;
    let available = 0;
    let readyToMove = 0;
    let underConstruction = 0;
    let sold = 0;

    for (const p of properties) {
      const isSold = p.status === 'sold' || p.status === 'sold_out' || p.status === 'sold-out';
      const isRented = p.status === 'rented';
      const poss = String(p.possessionStatus || p.possessionDisplay || '').toLowerCase();

      if (isSold) {
        sold++;
      } else if (!isRented) {
        available++;
        if (poss.includes('ready')) {
          readyToMove++;
        } else if (poss.includes('under-construction') || poss.includes('construction') || poss.includes('mid 202')) {
          underConstruction++;
        }
      }
    }

    return { total, available, readyToMove, underConstruction, sold };
  }, [properties]);

  // Dynamic heading indicating location, query, or category
  const resultsHeading = useMemo(() => {
    const loc = activeFilters.locality && activeFilters.locality !== 'all'
      ? getLocationDisplayName(activeFilters.locality)
      : null;

    if (loc) {
      return `Properties in ${loc}`;
    }
    if (activeFilters.searchQuery && activeFilters.searchQuery.trim()) {
      return `Search Results for "${activeFilters.searchQuery.trim()}"`;
    }
    if (activeFilters.category && activeFilters.category !== 'all') {
      const cleanCat = activeFilters.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${cleanCat} in Corridor`;
    }
    return 'Featured Property Opportunities';
  }, [activeFilters]);

  // Handle tab click: update tab state immediately and avoid stale subcategories
  const handleTabClick = (tabId) => {
    const normTab = normalizeTabId(tabId);
    setVisibleCount(12);
    const nextCategory = (normTab === 'all' || !isCategoryCompatibleWithTab(activeFilters.category, normTab))
      ? 'all'
      : activeFilters.category;

    if (onFilterChange) {
      onFilterChange({
        transactionType: normTab,
        categoryTab: normTab,
        category: nextCategory,
      });
    }
  };

  const displayedProperties = properties.slice(0, visibleCount);
  const hasMore = properties.length > visibleCount;

  return (
    <section id="listings" className="py-14 sm:py-18 bg-white border-y border-stone/60 scroll-mt-20">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Calculated Result Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-2.5">
              <span>Verified Inventory</span>
            </div>
            {/* Dynamic Results Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-bold tracking-tight text-balance mb-2.5">
              {resultsHeading}
            </h2>
            <p className="text-muted text-sm sm:text-base leading-relaxed text-balance">
              Verified real estate catalog across Vasai, Virar, Nalasopara, Saphale, Kelve Road, Palghar, and Boisar.
            </p>
          </div>

          {/* Regional Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-ivory border border-stone text-xs text-charcoal/80 flex-shrink-0 self-start md:self-auto">
            <Info className="w-3.5 h-3.5 text-royal flex-shrink-0" />
            <span>Vasai to Boisar Corridor</span>
          </div>
        </div>

        {/* Calculated Summary Pills: Total, Available, Ready-to-move, Under-construction, Sold */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-7">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white text-[13px] font-bold shadow-2xs">
            <span>Total Matching:</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded text-white font-black">{counts.total}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[13px] font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Available:</span>
            <span className="bg-emerald-200/60 px-2.5 py-0.5 rounded font-black">{counts.available}</span>
          </div>

          {counts.readyToMove > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-royal text-xs font-bold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-royal" />
              <span>Ready to Move:</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded font-black">{counts.readyToMove}</span>
            </div>
          )}

          {counts.underConstruction > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Under Construction:</span>
              <span className="bg-amber-200/60 px-2 py-0.5 rounded font-black">{counts.underConstruction}</span>
            </div>
          )}

          {counts.sold > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold shadow-2xs">
              <span>Sold:</span>
              <span className="bg-rose-200/60 px-2 py-0.5 rounded font-black">{counts.sold}</span>
            </div>
          )}
        </div>

        {/* Transaction / Category Filter Pills (Immediate Derived Filtering) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-stone/50">
          {CATEGORY_TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-[13.5px] sm:text-[14.5px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-navy text-white shadow-sm ring-1 ring-navy'
                    : 'bg-ivory text-charcoal hover:bg-stone/60 border border-stone/50'
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Filter Summary Indicator */}
        {searchQueryInfo && (
          <div className="mb-8 p-3.5 rounded-xl bg-ivory/80 border border-royal/30 flex flex-wrap items-center justify-between text-xs text-charcoal gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-royal flex-shrink-0" />
              <span className="font-bold text-navy">Active Filters:</span>
              <span className="font-medium bg-white px-2.5 py-1 rounded-md border border-stone/70">
                {searchQueryInfo}
              </span>
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 font-bold text-xs text-navy hover:text-royal px-3 py-1.5 rounded-md bg-white border border-stone hover:bg-stone/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={onViewDetails}
                  onEnquire={onEnquire}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Pagination / Load More Properties Actions */}
            {hasMore ? (
              <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  <span>Show More Properties ({properties.length - visibleCount} more)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(currentTab === 'all' ? '/properties' : `/${currentTab === 'plots-land' ? 'plots' : currentTab}`);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone hover:border-royal text-navy font-bold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
                >
                  <span>View All {properties.length} Listings</span>
                  <ArrowRight className="w-3.5 h-3.5 text-royal" />
                </button>
              </div>
            ) : (
              properties.length > 8 && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/properties')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-royal hover:text-navy uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Browse All 50+ Verified Properties Across Vasai-Palghar Corridor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            )}
          </>
        ) : (
          /* Polished Empty State Required by Prompt Section 6 */
          <div className="text-center py-16 px-6 bg-ivory/70 rounded-3xl border border-stone max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-stone/70 text-navy flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-royal" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal mb-2.5 font-bold">
              No matching properties found.
            </h3>
            <p className="text-muted text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
              We frequently handle offline inventory, newly signed mandates, and private listings across Vasai, Virar, Nalasopara, Saphale, Kelve Road, Palghar, and Boisar. Try clearing your filters or contact our property advisory desk.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="px-6 py-3 rounded-xl bg-navy text-white text-xs sm:text-sm uppercase font-bold tracking-wider hover:bg-navy-900 transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear All Filters</span>
              </button>

              <button
                type="button"
                onClick={() => onEnquire({ title: 'Corridor Property Enquiry across Vasai to Boisar' })}
                className="px-6 py-3 rounded-xl bg-brandRed text-white text-xs sm:text-sm uppercase font-bold tracking-wider hover:bg-brandRed-700 transition-colors shadow-sm cursor-pointer"
              >
                Enquire With Property Desk
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
