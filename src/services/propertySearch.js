// Centralized Property Filter & Search Engine for Tomar Enterprises
// Implements strict AND logic across all active criteria with canonical location resolution and domain category tabs

import { resolveCanonicalLocation } from '../data/locations.js';

export const CATEGORY_TABS = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'buy', label: 'Buy (New & Resale)' },
  { id: 'rentals', label: 'Rentals' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'plots-land', label: 'Plots & Land' },
  { id: 'lease-heavy-deposit', label: 'Lease & Heavy Deposit' },
];

/**
 * Normalizes tab or transaction identifiers to one of the 6 stable category tabs
 */
export function normalizeTabId(tabId) {
  if (!tabId) return 'all';
  const id = String(tabId).toLowerCase().trim();
  if (id === 'rent' || id === 'rentals') return 'rentals';
  if (id === 'lease' || id === 'lease-heavy-deposit' || id === 'heavy-deposit') return 'lease-heavy-deposit';
  if (id === 'plots' || id === 'plots-land' || id === 'plot' || id === 'land') return 'plots-land';
  if (id === 'buy' || id === 'sale') return 'buy';
  if (id === 'commercial') return 'commercial';
  return id;
}

/**
 * Evaluates whether a property belongs to a category tab according to domain business rules
 */
export function matchesCategoryTab(property, tabId) {
  if (!property) return false;
  const normTab = normalizeTabId(tabId);

  switch (normTab) {
    case 'all':
      return true;

    case 'buy':
      return (
        property.transactionType === 'buy' ||
        (property.transactionType === 'commercial' &&
          ['commercial-shop', 'commercial-office', 'commercial-property'].includes(property.category))
      );

    case 'rentals':
      return (
        property.transactionType === 'rent' &&
        ['flat-rent', 'shop-rent', 'office-rent'].includes(property.category)
      );

    case 'commercial':
      return (
        property.transactionType === 'commercial' ||
        ['commercial-shop', 'commercial-office', 'commercial-property', 'shop-rent', 'office-rent'].includes(property.category) ||
        (property.category && property.category.startsWith('commercial'))
      );

    case 'plots-land':
      return (
        property.transactionType === 'plots-land' ||
        ['residential-plot', 'na-plot', 'industrial-plot'].includes(property.category) ||
        (property.category && property.category.includes('plot'))
      );

    case 'lease-heavy-deposit':
      return (
        property.transactionType === 'lease' ||
        property.category === 'lease-property' ||
        property.isHeavyDeposit === true
      );

    default:
      return true;
  }
}

/**
 * Checks if a specific sub-category is compatible with a given category tab.
 */
export function isCategoryCompatibleWithTab(category, tabId) {
  if (!category || category === 'all') return true;
  const normTab = normalizeTabId(tabId);
  if (normTab === 'all') return true;

  if (normTab === 'buy') {
    return ['new-flat', 'resale-flat', 'residential-property', 'commercial-shop', 'commercial-office', 'commercial-property'].includes(category);
  }
  if (normTab === 'rentals') {
    return ['flat-rent', 'shop-rent', 'office-rent'].includes(category);
  }
  if (normTab === 'commercial') {
    return ['commercial-shop', 'commercial-office', 'commercial-property', 'shop-rent', 'office-rent'].includes(category);
  }
  if (normTab === 'plots-land') {
    return ['residential-plot', 'na-plot', 'industrial-plot', 'plots', 'plot', 'land', 'plots-land'].includes(category);
  }
  if (normTab === 'lease-heavy-deposit') {
    return ['lease-property', 'commercial-property', 'commercial-shop', 'commercial-office'].includes(category);
  }
  return true;
}

/**
 * Evaluates whether an item matches a target sub-category, supporting grouped/synonym categories
 */
export function isCategoryMatch(item, targetCat) {
  if (!targetCat || targetCat === 'all') return true;
  const t = String(targetCat).toLowerCase().trim();
  const itemCat = String(item.category || '').toLowerCase().trim();
  const itemType = String(item.transactionType || '').toLowerCase().trim();

  // Exact match
  if (itemCat === t) return true;

  // Plots & Land grouping (handles 'plots', 'plot', 'plots-land', 'land', etc.)
  if (t === 'plots' || t === 'plot' || t === 'plots-land' || t === 'land' || t === 'plots & land') {
    return (
      itemType === 'plots-land' ||
      itemCat.includes('plot') ||
      ['residential-plot', 'na-plot', 'industrial-plot'].includes(itemCat)
    );
  }

  // Commercial grouping
  if (t === 'commercial' || t === 'commercial-property' || t === 'commercial space') {
    return (
      itemType === 'commercial' ||
      itemCat.startsWith('commercial') ||
      ['commercial-shop', 'commercial-office', 'commercial-property', 'shop-rent', 'office-rent'].includes(itemCat)
    );
  }

  // Residential / Flats grouping
  if (t === 'residential' || t === 'residential-property' || t === 'flats' || t === 'flat') {
    return (
      ['new-flat', 'resale-flat', 'residential-property', 'flat-rent'].includes(itemCat) ||
      itemCat.includes('flat')
    );
  }

  // Shops grouping
  if (t === 'shops' || t === 'shop' || t === 'retail') {
    return ['commercial-shop', 'shop-rent'].includes(itemCat) || itemCat.includes('shop');
  }

  // Offices grouping
  if (t === 'offices' || t === 'office') {
    return ['commercial-office', 'office-rent'].includes(itemCat) || itemCat.includes('office');
  }

  // Rentals grouping
  if (t === 'rent' || t === 'rentals') {
    return itemType === 'rent' || ['flat-rent', 'shop-rent', 'office-rent'].includes(itemCat);
  }

  return itemCat.includes(t);
}

/**
 * Evaluates whether an item's locality matches a target search locality,
 * taking aliases and canonical station names into account.
 */
export function isLocalityMatch(itemLocality, searchLocality) {
  if (!searchLocality || searchLocality === 'all') return true;
  if (!itemLocality) return false;

  const s = String(searchLocality).toLowerCase().trim();
  const i = String(itemLocality).toLowerCase().trim();

  // Exact match
  if (s === i) return true;

  // Direct alias equivalence
  if ((s === 'vasai-road' || s === 'vasai') && (i === 'vasai-road' || i === 'vasai')) return true;
  if ((s === 'nalasopara' || s === 'nallasopara' || s === 'nalla sopara') && (i === 'nalasopara' || i === 'nallasopara')) return true;
  if ((s === 'kelve-road' || s === 'kelve' || s === 'kelva' || s === 'kelva road') && (i === 'kelve-road' || i === 'kelve' || i === 'kelva')) return true;
  if ((s === 'virar') && (i === 'virar')) return true;
  if ((s === 'palghar') && (i === 'palghar')) return true;
  if ((s === 'vaitarna') && (i === 'vaitarna')) return true;
  if ((s === 'saphale') && (i === 'saphale')) return true;

  // Canonical resolution check
  const resolvedSearch = resolveCanonicalLocation(s);
  const resolvedItem = resolveCanonicalLocation(i);

  if (resolvedSearch && resolvedItem && resolvedSearch.locationId === resolvedItem.locationId) {
    return true;
  }

  return false;
}

/**
 * Evaluates whether an item matches a free-text search query.
 * Supports tokenization, common real estate synonyms, singular/plural stemming (plots <-> plot, flats <-> flat),
 * locality aliases, and checks against all descriptive and categorical fields.
 */
export function matchSearchQuery(item, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;

  const q = rawQuery.toLowerCase().trim();

  // Full composite document for substring search
  const fullDoc = [
    item.title || '',
    item.description || '',
    item.subLocation || '',
    item.locality || '',
    item.city || '',
    item.category || '',
    item.transactionType || '',
    item.possessionStatus || '',
    item.possessionDisplay || '',
    item.priceDisplay || '',
    Array.isArray(item.features) ? item.features.join(' ') : '',
    Array.isArray(item.tags) ? item.tags.join(' ') : '',
  ].join(' ').toLowerCase();

  // 1. Direct match check
  if (fullDoc.includes(q)) return true;

  // 2. Tokenize with stop words removed for natural search phrasing (e.g., "search of plots", "plots in vasai")
  const stopWords = new Set([
    'in', 'at', 'near', 'for', 'of', 'and', 'the', 'a', 'an', 'to', 'with',
    'search', 'searching', 'find', 'finding', 'show', 'me', 'look', 'looking', 'get', 'any', 'all', 'properties', 'property'
  ]);

  const rawTokens = q.split(/[\s,+/]+/).filter(Boolean);
  const tokens = rawTokens.filter((w) => !stopWords.has(w) || rawTokens.length === 1);

  if (tokens.length === 0) return true;

  // Stem common plural forms to match singular titles/categories
  const stemToken = (word) => {
    if (word === 'plots') return 'plot';
    if (word === 'lands') return 'land';
    if (word === 'flats') return 'flat';
    if (word === 'apartments') return 'apartment';
    if (word === 'shops') return 'shop';
    if (word === 'offices') return 'office';
    if (word === 'villas') return 'villa';
    if (word === 'houses') return 'house';
    return word;
  };

  const stationAliases = {
    'vasai': ['vasai', 'vasai-road', 'vasai road', 'vasai west', 'vasai east'],
    'virar': ['virar', 'virar west', 'virar east', 'bolinj', 'chikhal dongri'],
    'nalasopara': ['nalasopara', 'nallasopara', 'nalla sopara', 'achole', 'patankar park', 'moregaon'],
    'palghar': ['palghar', 'palghar west', 'palghar east', 'manor road', 'tembhode'],
    'saphale': ['saphale', 'safale'],
    'kelve': ['kelve', 'kelve road', 'kelva'],
    'vaitarna': ['vaitarna'],
  };

  return tokens.every((rawTok) => {
    const tok = stemToken(rawTok);

    if (fullDoc.includes(tok)) return true;

    // Check plots/land synonyms
    if (tok === 'plot' || tok === 'land') {
      if (item.transactionType === 'plots-land' || (item.category && item.category.includes('plot'))) {
        return true;
      }
    }

    // Check commercial synonyms
    if (tok === 'commercial') {
      if (item.transactionType === 'commercial' || (item.category && item.category.startsWith('commercial'))) {
        return true;
      }
    }

    // Check rentals synonyms
    if (tok === 'rent' || tok === 'rental' || tok === 'rentals') {
      if (item.transactionType === 'rent' || (item.category && item.category.includes('rent'))) {
        return true;
      }
    }

    // Check residential/flat synonyms
    if (tok === 'flat' || tok === 'apartment' || tok === 'residence') {
      if (['new-flat', 'resale-flat', 'residential-property', 'flat-rent'].includes(item.category)) {
        return true;
      }
    }

    // Check station aliases
    for (const [station, aliases] of Object.entries(stationAliases)) {
      if (aliases.some((a) => a.includes(tok) || tok.includes(a))) {
        if (isLocalityMatch(item.locality, station) || (item.subLocation && item.subLocation.toLowerCase().includes(tok))) {
          return true;
        }
      }
    }

    // Check BHK tokens (e.g. 1bhk, 2bhk, 3bhk)
    const bhkMatch = tok.match(/^([1-5])\s*bhk$/i);
    if (bhkMatch) {
      return item.bedrooms === Number(bhkMatch[1]);
    }

    return false;
  });
}

export const DEFAULT_FILTERS = {
  transactionType: 'all',
  categoryTab: 'all',
  locality: 'all',
  category: 'all',
  minBudget: null,
  maxBudget: null,
  minArea: null,
  maxArea: null,
  bedrooms: 'all',
  availabilityStatus: 'all',
  sortBy: 'recommended',
  searchQuery: '',
};

/**
 * Filters the property dataset using deterministic AND logic
 * @param {Array} properties - List of property objects
 * @param {Object} filters - Active filter criteria
 * @returns {Array} Matching properties
 */
export function filterProperties(properties, filters = {}) {
  if (!Array.isArray(properties)) return [];

  const active = { ...DEFAULT_FILTERS, ...filters };
  let rawTab = 'all';
  if (active.categoryTab && active.categoryTab !== 'all') {
    rawTab = active.categoryTab;
  } else if (active.transactionType && active.transactionType !== 'all') {
    rawTab = active.transactionType;
  }
  const targetTab = normalizeTabId(rawTab);

  const filtered = properties.filter((item) => {
    // 0. Exclude Sold Out, Archived, and Draft listings from public available results by default
    if (!active.includeSold && !active.includeArchived && !active.includeDrafts) {
      const s = String(item.status || '').toLowerCase();
      if (s === 'sold' || s === 'sold_out' || s === 'sold-out' || s === 'archived' || s === 'draft') {
        return false;
      }
    }

    // 1. Category Tab / Transaction Filter
    if (targetTab !== 'all') {
      if (!matchesCategoryTab(item, targetTab)) {
        return false;
      }
    }

    // 2. Locality Filter with Canonical Location Resolution
    if (active.locality && active.locality !== 'all') {
      if (!isLocalityMatch(item.locality, active.locality)) {
        return false;
      }
    }

    // 3. Property Sub-Category Filter (Supports grouped/synonym matching)
    if (active.category && active.category !== 'all') {
      if (!isCategoryMatch(item, active.category)) {
        return false;
      }
    }

    // 4. Budget Filters (Numeric exact bounds)
    const itemPrice = typeof item.price === 'number' ? item.price : null;

    if (active.minBudget !== null && active.minBudget !== undefined && active.minBudget !== 'all') {
      const min = Number(active.minBudget);
      if (!isNaN(min) && min > 0) {
        if (itemPrice === null || itemPrice < min) {
          return false;
        }
      }
    }

    if (active.maxBudget !== null && active.maxBudget !== undefined && active.maxBudget !== 'all') {
      const max = Number(active.maxBudget);
      if (!isNaN(max) && max > 0) {
        if (itemPrice === null || itemPrice > max) {
          return false;
        }
      }
    }

    // 5. Area Bounds
    if (active.minArea !== null && active.minArea !== undefined && active.minArea !== 'all') {
      const minA = Number(active.minArea);
      if (!isNaN(minA) && minA > 0) {
        if (!item.areaSqFt || item.areaSqFt < minA) return false;
      }
    }

    if (active.maxArea !== null && active.maxArea !== undefined && active.maxArea !== 'all') {
      const maxA = Number(active.maxArea);
      if (!isNaN(maxA) && maxA > 0) {
        if (!item.areaSqFt || item.areaSqFt > maxA) return false;
      }
    }

    // 6. Bedrooms Filter (BHK: 1, 2, 3)
    // Plots and commercial units inherently have no bedrooms; do not disqualify them if tab or query is plots/commercial
    if (active.bedrooms && active.bedrooms !== 'all') {
      const targetBhk = Number(active.bedrooms);
      if (!isNaN(targetBhk) && targetBhk > 0) {
        const isPlotItem = item.transactionType === 'plots-land' || (item.category && item.category.includes('plot'));
        const isCommercialItem = item.transactionType === 'commercial' || (item.category && item.category.startsWith('commercial'));

        if (targetTab === 'plots-land' || targetTab === 'commercial' || isPlotItem || isCommercialItem) {
          // Plots and commercial properties are exempt from residential bedroom requirements
        } else if (item.bedrooms !== targetBhk) {
          return false;
        }
      }
    }

    // 7. Availability Status Filter
    if (active.availabilityStatus && active.availabilityStatus !== 'all') {
      const itemStatus = item.possessionStatus || '';
      if (itemStatus !== active.availabilityStatus) {
        return false;
      }
    }

    // 8. Robust Search Query Engine (Stemming, tokenization, synonyms & document coverage)
    if (active.searchQuery && active.searchQuery.trim()) {
      if (!matchSearchQuery(item, active.searchQuery)) {
        return false;
      }
    }

    // All conditions satisfied (AND logic)
    return true;
  });

  // Apply sorting
  return sortProperties(filtered, active.sortBy);
}

/**
 * Sorts properties by active criteria
 */
export function sortProperties(properties, sortBy = 'recommended') {
  const list = [...properties];
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'area-desc':
      return list.sort((a, b) => (b.areaSqFt || 0) - (a.areaSqFt || 0));
    case 'newest':
      return list.reverse();
    case 'recommended':
    default:
      return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

/**
 * Parse URL search parameters into a filter object
 */
export function getFiltersFromUrl() {
  if (typeof window === 'undefined') return { ...DEFAULT_FILTERS };

  const params = new URLSearchParams(window.location.search);
  const filters = { ...DEFAULT_FILTERS };

  if (params.has('transaction')) {
    filters.transactionType = params.get('transaction') || 'all';
  }
  if (params.has('tab')) {
    filters.categoryTab = params.get('tab') || 'all';
  }
  if (params.has('locality')) {
    filters.locality = params.get('locality') || 'all';
  }
  if (params.has('category')) {
    filters.category = params.get('category') || 'all';
  }
  if (params.has('maxPrice')) {
    const val = Number(params.get('maxPrice'));
    if (!isNaN(val) && val > 0) filters.maxBudget = val;
  }
  if (params.has('minPrice')) {
    const val = Number(params.get('minPrice'));
    if (!isNaN(val) && val > 0) filters.minBudget = val;
  }
  if (params.has('bedrooms')) {
    const val = Number(params.get('bedrooms'));
    if (!isNaN(val) && val > 0) filters.bedrooms = val;
  }
  if (params.has('sort')) {
    filters.sortBy = params.get('sort') || 'recommended';
  }
  if (params.has('q')) {
    filters.searchQuery = params.get('q') || '';
  }

  return filters;
}

/**
 * Synchronize active filters into URL search parameters cleanly
 */
export function syncFiltersToUrl(filters) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();

  if (filters.transactionType && filters.transactionType !== 'all') {
    params.set('transaction', filters.transactionType);
  }
  if (filters.categoryTab && filters.categoryTab !== 'all') {
    params.set('tab', filters.categoryTab);
  }
  if (filters.locality && filters.locality !== 'all') {
    params.set('locality', filters.locality);
  }
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters.maxBudget && Number(filters.maxBudget) > 0) {
    params.set('maxPrice', String(filters.maxBudget));
  }
  if (filters.minBudget && Number(filters.minBudget) > 0) {
    params.set('minPrice', String(filters.minBudget));
  }
  if (filters.bedrooms && filters.bedrooms !== 'all') {
    params.set('bedrooms', String(filters.bedrooms));
  }
  if (filters.sortBy && filters.sortBy !== 'recommended') {
    params.set('sort', filters.sortBy);
  }
  if (filters.searchQuery && filters.searchQuery.trim()) {
    params.set('q', filters.searchQuery.trim());
  }

  const query = params.toString();
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}
