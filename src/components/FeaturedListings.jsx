import React, { useState, useEffect } from 'react';
import { Info, RotateCcw, Filter, ArrowRight, Sparkles } from 'lucide-react';
import {
  CATEGORY_TABS,
  normalizeTabId,
  isCategoryCompatibleWithTab,
} from '../services/propertySearch';
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
        {/* Section Heading & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-2.5">
              <span>Prime Inventory</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-3">
              Featured Property Opportunities
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
              Explore selected property options across Vasai, Virar, Nalasopara, and Palghar.
            </p>
          </div>

          {/* Verified Inventory & Derived Result Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy/5 border border-navy/20 text-xs font-bold text-navy shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brandRed"></span>
              <span>{properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-ivory border border-stone text-xs text-charcoal/80">
              <Info className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              <span>Vasai to Palghar Corridor</span>
            </div>
          </div>
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
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal mb-2 font-normal">
              No properties available in this category yet.
            </h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-6 leading-relaxed">
              We frequently handle offline inventory and upcoming mandates across Vasai, Virar, Nalasopara, Saphale, Kelve Road, and Palghar. Enquire with our property desk for upcoming opportunities or reset your search view.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onFilterChange) {
                    onFilterChange({
                      transactionType: 'all',
                      categoryTab: 'all',
                      category: 'all',
                    });
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-navy text-white text-xs uppercase font-bold tracking-wider hover:bg-navy-900 transition-colors shadow-sm cursor-pointer"
              >
                Reset to All Opportunities
              </button>

              <button
                type="button"
                onClick={() => onEnquire({ title: 'Upcoming Property Requirement across Vasai-Palghar' })}
                className="px-5 py-2.5 rounded-lg bg-brandRed text-white text-xs uppercase font-bold tracking-wider hover:bg-brandRed-700 transition-colors shadow-sm cursor-pointer"
              >
                Contact Property Team
              </button>

              <button
                type="button"
                onClick={onResetFilters}
                className="px-5 py-2.5 rounded-lg bg-white border border-stone text-charcoal text-xs uppercase font-bold tracking-wider hover:bg-stone/30 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
