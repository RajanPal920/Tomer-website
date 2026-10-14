import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, MapPin, Building, IndianRupee, BedDouble } from 'lucide-react';
import { TRANSACTION_TYPES, CATEGORIES_BY_TRANSACTION } from '../data/properties';
import { LOCALITY_OPTIONS } from '../data/localities';

export const BUDGET_TIERS = {
  buy: [
    { label: 'Any Budget', min: null, max: null },
    { label: 'Under ₹40 Lakh', min: null, max: 4000000 },
    { label: '₹40 Lakh – ₹60 Lakh', min: 4000000, max: 6000000 },
    { label: '₹60 Lakh – ₹1 Crore', min: 6000000, max: 10000000 },
    { label: 'Above ₹1 Crore', min: 10000000, max: null },
  ],
  rent: [
    { label: 'Any Rent Budget', min: null, max: null },
    { label: 'Under ₹15,000 / mo', min: null, max: 15000 },
    { label: '₹15,000 – ₹30,000 / mo', min: 15000, max: 30000 },
    { label: 'Above ₹30,000 / mo', min: 30000, max: null },
  ],
  commercial: [
    { label: 'Any Commercial Budget', min: null, max: null },
    { label: 'Under ₹50 Lakh', min: null, max: 5000000 },
    { label: '₹50 Lakh – ₹1 Crore', min: 5000000, max: 10000000 },
    { label: 'Above ₹1 Crore', min: 10000000, max: null },
  ],
  'plots-land': [
    { label: 'Any Land Budget', min: null, max: null },
    { label: 'Under ₹30 Lakh', min: null, max: 3000000 },
    { label: '₹30 Lakh – ₹75 Lakh', min: 3000000, max: 7500000 },
    { label: 'Above ₹75 Lakh', min: 7500000, max: null },
  ],
  lease: [
    { label: 'Any Lease Deposit', min: null, max: null },
    { label: 'Deposit under ₹15 Lakh', min: null, max: 1500000 },
    { label: 'Deposit ₹15L – ₹30 Lakh', min: 1500000, max: 3000000 },
    { label: 'Deposit Above ₹30 Lakh', min: 3000000, max: null },
  ],
};

export default function SearchPanel({ onSearch, activeFilters, onReset }) {
  const [activeTab, setActiveTab] = useState(
    activeFilters?.transactionType && activeFilters.transactionType !== 'all'
      ? activeFilters.transactionType
      : 'buy'
  );
  const [selectedLocality, setSelectedLocality] = useState(activeFilters?.locality || 'all');
  const [selectedCategory, setSelectedCategory] = useState(activeFilters?.category || 'all');
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState('0');
  const [selectedBhk, setSelectedBhk] = useState(activeFilters?.bedrooms ? String(activeFilters.bedrooms) : 'all');

  // Synchronize internal form state with external search state changes
  useEffect(() => {
    if (activeFilters) {
      if (activeFilters.transactionType && activeFilters.transactionType !== 'all') {
        setActiveTab(activeFilters.transactionType);
      }
      if (activeFilters.locality !== undefined) {
        setSelectedLocality(activeFilters.locality);
      }
      if (activeFilters.category !== undefined) {
        setSelectedCategory(activeFilters.category);
      }
      if (activeFilters.bedrooms !== undefined) {
        setSelectedBhk(String(activeFilters.bedrooms));
      }
    }
  }, [activeFilters]);

  // When tab changes, reset category to 'all' and update active tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedCategory('all');
    setSelectedBudgetIndex('0');
    if (tabId === 'plots-land' || tabId === 'commercial' || tabId === 'lease') {
      setSelectedBhk('all');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const currentTiers = BUDGET_TIERS[activeTab] || BUDGET_TIERS.buy;
    const tier = currentTiers[Number(selectedBudgetIndex)] || currentTiers[0];
    const isResidentialTab = activeTab === 'buy' || activeTab === 'rent';

    if (onSearch) {
      onSearch({
        transactionType: activeTab,
        locality: selectedLocality,
        category: selectedCategory,
        minBudget: tier.min,
        maxBudget: tier.max,
        bedrooms: isResidentialTab && selectedBhk !== 'all' ? Number(selectedBhk) : 'all',
      });
    }
  };

  const handleResetFilters = () => {
    setActiveTab('buy');
    setSelectedLocality('all');
    setSelectedCategory('all');
    setSelectedBudgetIndex('0');
    setSelectedBhk('all');

    if (onReset) {
      onReset();
    }
  };

  const currentCategories = CATEGORIES_BY_TRANSACTION[activeTab] || CATEGORIES_BY_TRANSACTION.buy;
  const currentBudgetTiers = BUDGET_TIERS[activeTab] || BUDGET_TIERS.buy;
  const isResidential = activeTab === 'buy' || activeTab === 'rent';

  return (
    <div className="relative -mt-10 sm:-mt-14 z-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-card border border-stone/80 overflow-hidden">
        {/* Transaction Type Tabs */}
        <div className="flex border-b border-stone/60 overflow-x-auto scrollbar-none bg-ivory/60">
          {TRANSACTION_TYPES.filter((t) => t.id !== 'all').map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[110px] py-4 px-4 text-center text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-brandRed text-navy bg-white shadow-sm'
                    : 'border-transparent text-muted hover:text-navy hover:bg-white/60'
                }`}
                aria-selected={isActive}
                role="tab"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Input Grid Form */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 lg:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Field 1: Locality (Vasai to Palghar) */}
            <div>
              <label
                htmlFor="search-locality-select"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2"
              >
                <MapPin className="w-3.5 h-3.5 text-royal flex-shrink-0" />
                <span>Locality</span>
              </label>
              <select
                id="search-locality-select"
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal focus:border-royal transition-all"
              >
                {LOCALITY_OPTIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Property Category (Contextual to active tab) */}
            <div>
              <label
                htmlFor="search-category-select"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2"
              >
                <Building className="w-3.5 h-3.5 text-royal flex-shrink-0" />
                <span>Property Category</span>
              </label>
              <select
                id="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal focus:border-royal transition-all"
              >
                {currentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Budget Range */}
            <div>
              <label
                htmlFor="search-budget-select"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2"
              >
                <IndianRupee className="w-3.5 h-3.5 text-royal flex-shrink-0" />
                <span>Budget Bracket</span>
              </label>
              <select
                id="search-budget-select"
                value={selectedBudgetIndex}
                onChange={(e) => setSelectedBudgetIndex(e.target.value)}
                className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal focus:border-royal transition-all"
              >
                {currentBudgetTiers.map((tier, idx) => (
                  <option key={idx} value={String(idx)}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4 / Actions: BHK selector (if residential) + Action buttons */}
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              {isResidential ? (
                <div className="w-1/3 min-w-[85px]">
                  <label
                    htmlFor="search-bhk-select"
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-charcoal/80 mb-2 truncate"
                  >
                    <BedDouble className="w-3 h-3 text-royal flex-shrink-0" />
                    <span>BHK</span>
                  </label>
                  <select
                    id="search-bhk-select"
                    value={selectedBhk}
                    onChange={(e) => setSelectedBhk(e.target.value)}
                    className="w-full bg-ivory/50 border border-stone rounded-xl px-2 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                  >
                    <option value="all">Any BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                  </select>
                </div>
              ) : null}

              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
              >
                <Search className="w-4 h-4 text-white" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset All Filters"
                className="h-11 w-11 flex items-center justify-center text-muted hover:text-navy hover:bg-ivory border border-stone rounded-xl transition-colors flex-shrink-0"
                aria-label="Reset all search filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick-Filter Corridor Chips (Direct click-to-test links) */}
          <div className="mt-4 pt-3.5 border-t border-stone/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-charcoal">Quick Tests:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('buy');
                  setSelectedLocality('virar');
                  setSelectedCategory('resale-flat');
                  if (onSearch) onSearch({ transactionType: 'buy', locality: 'virar', category: 'resale-flat' });
                }}
                className="px-2.5 py-1 rounded-md bg-ivory text-navy hover:bg-stone/50 font-medium transition-colors"
              >
                Test A: Virar Resale Flats
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('rent');
                  setSelectedLocality('vasai');
                  setSelectedCategory('shop-rent');
                  if (onSearch) onSearch({ transactionType: 'rent', locality: 'vasai', category: 'shop-rent' });
                }}
                className="px-2.5 py-1 rounded-md bg-ivory text-navy hover:bg-stone/50 font-medium transition-colors"
              >
                Test B: Vasai Rental Shops
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('plots-land');
                  setSelectedLocality('palghar');
                  setSelectedCategory('residential-plot');
                  if (onSearch) onSearch({ transactionType: 'plots-land', locality: 'palghar', category: 'residential-plot' });
                }}
                className="px-2.5 py-1 rounded-md bg-ivory text-navy hover:bg-stone/50 font-medium transition-colors"
              >
                Test C: Palghar Plots
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('buy');
                  setSelectedLocality('virar');
                  setSelectedCategory('all');
                  if (onSearch) onSearch({ transactionType: 'buy', locality: 'virar', category: 'all', maxBudget: 6000000 });
                }}
                className="px-2.5 py-1 rounded-md bg-ivory text-navy hover:bg-stone/50 font-medium transition-colors"
              >
                Test D: Virar Buy &le; ₹60L
              </button>
            </div>

            <span className="text-[11px] text-stone-dark italic">
              * Sourced for Vasai to Palghar Corridor
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
