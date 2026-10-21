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
        property.transactionType === 'plots-land' ||
        (property.transactionType === 'commercial' &&
          ['commercial-shop', 'commercial-office', 'commercial-property', 'commercial'].includes(property.category))
      );

    case 'rentals':
      return (
        property.transactionType === 'rent' ||
        property.transactionType === 'lease' ||
        ['flat-rent', 'shop-rent', 'office-rent', 'lease-property'].includes(property.category)
      );

    case 'commercial':
      return (
        property.transactionType === 'commercial' ||
        property.transactionType === 'lease' ||
        ['commercial-shop', 'commercial-office', 'commercial-property', 'commercial', 'shop-rent', 'office-rent', 'lease-property'].includes(property.category) ||
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
        property.isHeavyDeposit === true ||
        (property.category && property.category.includes('lease'))
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
    return [
      'new-flat', 'resale-flat', 'residential-property', 'flats', 'flat', 'apartments',
      'commercial-shop', 'commercial-office', 'commercial-property', 'commercial', 'shops', 'offices',
      'residential-plot', 'na-plot', 'industrial-plot', 'plots', 'plot', 'land', 'plots-land',
      'resale', 'resale-properties'
    ].includes(category);
  }
  if (normTab === 'rentals') {
    return [
      'flat-rent', 'shop-rent', 'office-rent', 'flats', 'flat', 'apartments',
      'commercial-shop', 'commercial-office', 'commercial-property', 'commercial', 'shops', 'offices',
      'rent', 'rentals', 'lease-property'
    ].includes(category);
  }
  if (normTab === 'commercial') {
    return [
      'commercial-shop', 'commercial-office', 'commercial-property', 'commercial', 'shop-rent', 'office-rent',
      'shops', 'offices', 'lease-property'
    ].includes(category);
  }
  if (normTab === 'plots-land') {
    return [
      'residential-plot', 'na-plot', 'industrial-plot', 'plots', 'plot', 'land', 'plots-land'
    ].includes(category);
  }
  if (normTab === 'lease-heavy-deposit') {
    return [
      'lease-property', 'commercial-property', 'commercial-shop', 'commercial-office', 'commercial', 'flat-rent', 'flats'
    ].includes(category);
  }
  return true;
}

/**
 * Evaluates whether an item matches a target sub-category, supporting grouped/synonym categories
 * Covers all 12 property types:
 *   1. All Properties ('all')
 *   2. Flats / Apartments ('flats')
 *   3. New Flats / New Homes ('new-flat')
 *   4. Resale Properties ('resale-flat')
 *   5. Rental Properties ('flat-rent')
 *   6. Commercial Shops ('commercial-shop')
 *   7. Offices ('commercial-office')
 *   8. Commercial Spaces ('commercial')
 *   9. Residential Plots ('residential-plot')
 *   10. Industrial Plots ('industrial-plot')
 *   11. Land / NA Plots ('na-plot')
 *   12. Lease / Heavy Deposit ('lease-property')
 */
export function isCategoryMatch(item, targetCat) {
  if (!targetCat || targetCat === 'all') return true;
  const t = String(targetCat).toLowerCase().trim();
  const itemCat = String(item.category || '').toLowerCase().trim();
  const itemType = String(item.transactionType || '').toLowerCase().trim();

  // Exact match
  if (itemCat === t) return true;

  // 1. Flats / Apartments grouping (encompasses new flats, resale flats, and rental flats)
  if (t === 'flats' || t === 'flat' || t === 'flats / apartments' || t === 'apartments' || t === 'residential' || t === 'residential-property') {
    return (
      ['new-flat', 'resale-flat', 'residential-property', 'flat-rent', 'flats', 'flat', 'apartments'].includes(itemCat) ||
      itemCat.includes('flat') ||
      itemCat.includes('apartment')
    );
  }

  // 2. New Flats / New Homes
  if (t === 'new-flat' || t === 'new flats / new homes' || t === 'new-flats' || t === 'new flats' || t === 'new homes' || t === 'new home') {
    return itemCat === 'new-flat' || (itemCat.includes('flat') && itemType === 'buy' && !itemCat.includes('resale') && !itemCat.includes('rent'));
  }

  // 3. Resale Properties
  if (t === 'resale-flat' || t === 'resale' || t === 'resale properties' || t === 'resale-properties' || t === 'resale property') {
    return itemCat === 'resale-flat' || itemCat === 'resale' || (item.title && item.title.toLowerCase().includes('resale'));
  }

  // 4. Rental Properties
  if (t === 'flat-rent' || t === 'rental properties' || t === 'rental property' || t === 'rent' || t === 'rentals' || t === 'rental') {
    return itemCat === 'flat-rent' || (itemType === 'rent' && (itemCat.includes('flat') || itemCat === 'residential-property'));
  }

  // 5. Commercial Shops
  if (t === 'commercial-shop' || t === 'commercial shops' || t === 'commercial shop' || t === 'shops' || t === 'shop' || t === 'retail') {
    return itemCat === 'commercial-shop' || itemCat === 'shop-rent' || itemCat.includes('shop');
  }

  // 6. Offices
  if (t === 'commercial-office' || t === 'commercial offices' || t === 'offices' || t === 'office' || t === 'corporate suite') {
    return itemCat === 'commercial-office' || itemCat === 'office-rent' || itemCat.includes('office');
  }

  // 7. Commercial Spaces (encompasses shops, offices, commercial complexes, and retail)
  if (t === 'commercial' || t === 'commercial-property' || t === 'commercial spaces' || t === 'commercial space') {
    return (
      itemType === 'commercial' ||
      itemCat.startsWith('commercial') ||
      ['commercial-shop', 'commercial-office', 'commercial-property', 'commercial', 'shop-rent', 'office-rent'].includes(itemCat) ||
      itemCat.includes('commercial')
    );
  }

  // 8. Residential Plots
  if (t === 'residential-plot' || t === 'residential plots' || t === 'residential plot') {
    return itemCat === 'residential-plot';
  }

  // 9. Industrial Plots
  if (t === 'industrial-plot' || t === 'industrial plots' || t === 'industrial plot') {
    return itemCat === 'industrial-plot';
  }

  // 10. Land / NA Plots
  if (t === 'na-plot' || t === 'land / na plots' || t === 'na plots' || t === 'na plot' || t === 'land' || t === 'plots' || t === 'plot' || t === 'plots-land' || t === 'plots & land') {
    if (t === 'plots' || t === 'plot' || t === 'plots-land' || t === 'plots & land') {
      return (
        itemType === 'plots-land' ||
        itemCat.includes('plot') ||
        ['residential-plot', 'na-plot', 'industrial-plot'].includes(itemCat)
      );
    }
    return itemCat === 'na-plot' || itemCat === 'land' || (itemType === 'plots-land' && !['residential-plot', 'industrial-plot'].includes(itemCat));
  }

  // 11. Lease / Heavy Deposit
  if (t === 'lease-property' || t === 'lease / heavy deposit' || t === 'lease' || t === 'heavy deposit' || t === 'heavy-deposit') {
    return (
      itemCat === 'lease-property' ||
      itemType === 'lease' ||
      item.isHeavyDeposit === true ||
      itemCat.includes('lease')
    );
  }

  return itemCat.includes(t);
}

/**
 * Reliably extracts numeric price from property item in rupees.
 * Handles numbers, priceNumber, priceNumeric, and formatted string expressions like '₹31.50 Lakh' or '₹1.45 Crore'.
 */
export function getNumericPrice(item) {
  if (!item) return null;
  if (typeof item.price === 'number' && !isNaN(item.price)) return item.price;
  if (typeof item.priceNumber === 'number' && !isNaN(item.priceNumber)) return item.priceNumber;
  if (typeof item.priceNumeric === 'number' && !isNaN(item.priceNumeric)) return item.priceNumeric;
  if (typeof item.price === 'string') {
    const clean = item.price.toLowerCase().trim();
    if (clean.includes('cr') || clean.includes('crore')) {
      const match = clean.match(/([0-9.]+)/);
      if (match) return Math.round(parseFloat(match[1]) * 10000000);
    }
    if (clean.includes('lakh') || clean.includes('lac')) {
      const match = clean.match(/([0-9.]+)/);
      if (match) return Math.round(parseFloat(match[1]) * 100000);
    }
    const digits = clean.replace(/[^0-9]/g, '');
    if (digits) return Number(digits);
  }
  return null;
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
  if ((s === 'boisar' || s === 'tarapur') && (i === 'boisar' || i === 'tarapur')) return true;

  // Canonical resolution check
  const resolvedSearch = resolveCanonicalLocation(s);
  const resolvedItem = resolveCanonicalLocation(i);

  if (resolvedSearch && resolvedItem && resolvedSearch.locationId === resolvedItem.locationId) {
    return true;
  }

  return false;
}

export const STATION_SEARCH_ALIASES = {
  'vasai': ['vasai', 'vasai-road', 'vasai road', 'vasai west', 'vasai east'],
  'virar': ['virar', 'virar west', 'virar east', 'bolinj', 'chikhal dongri'],
  'nalasopara': ['nalasopara', 'nallasopara', 'nalla sopara', 'achole', 'patankar park', 'moregaon'],
  'palghar': ['palghar', 'palghar west', 'palghar east', 'manor road', 'tembhode'],
  'saphale': ['saphale', 'safale'],
  'kelve': ['kelve', 'kelve road', 'kelva'],
  'vaitarna': ['vaitarna'],
  'boisar': ['boisar', 'boisar midc', 'tarapur', 'tarapur midc', 'boisar west', 'boisar east'],
};

/**
 * Evaluates whether an item matches a free-text search query.
 * Supports tokenization, common real estate synonyms, singular/plural stemming (plots <-> plot, flats <-> flat),
 * locality aliases, and checks against all descriptive and categorical fields.
 */
export function matchSearchQuery(item, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;

  const q = rawQuery.toLowerCase().trim();

  // Remove administrative district mentions so descriptions mentioning "Palghar District" don't misclassify Boisar, Virar or Vasai properties
  const cleanDesc = (item.description || '')
    .replace(/\bpalghar\s+district\b/gi, 'district')
    .replace(/\bdistrict\s+(of\s+)?palghar\b/gi, 'district')
    .replace(/\bpalghar\s+jilha\b/gi, 'jilha');

  // Full composite document for substring search
  const fullDoc = [
    item.title || '',
    cleanDesc,
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

  // 1. Direct match check (only if query is not an explicit station name)
  const isDirectStation = Object.keys(STATION_SEARCH_ALIASES).some((s) => s === q || STATION_SEARCH_ALIASES[s].includes(q));
  if (!isDirectStation && fullDoc.includes(q)) return true;

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

  return tokens.every((rawTok) => {
    const tok = stemToken(rawTok);

    // If token represents a station name, strictly verify locality / station relevance
    for (const [station, aliases] of Object.entries(STATION_SEARCH_ALIASES)) {
      if (aliases.some((a) => a === tok || tok === station)) {
        if (
          isLocalityMatch(item.locality, station) ||
          (item.subLocation && item.subLocation.toLowerCase().includes(tok)) ||
          (item.title && item.title.toLowerCase().includes(tok))
        ) {
          return true;
        }
        return false;
      }
    }

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

  // If a specific category is chosen that conflicts with targetTab, let category intent take precedence
  let effectiveTab = targetTab;
  if (active.category && active.category !== 'all') {
    if (!isCategoryCompatibleWithTab(active.category, effectiveTab)) {
      effectiveTab = 'all';
    }
  }

  const filtered = properties.filter((item) => {
    // 0. Exclude Sold Out, Archived, and Draft listings from public available results by default
    if (!active.includeSold && !active.includeArchived && !active.includeDrafts && active.availabilityStatus !== 'sold') {
      const s = String(item.status || '').toLowerCase();
      if (s === 'sold' || s === 'sold_out' || s === 'sold-out' || s === 'archived' || s === 'draft') {
        return false;
      }
    }

    // 1. Category Tab / Transaction Filter
    if (effectiveTab !== 'all') {
      if (!matchesCategoryTab(item, effectiveTab)) {
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
    const itemPrice = getNumericPrice(item);

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
    if (active.bedrooms && active.bedrooms !== 'all') {
      const targetBhk = Number(active.bedrooms);
      if (!isNaN(targetBhk) && targetBhk > 0) {
        if (item.bedrooms !== targetBhk) {
          return false;
        }
      }
    }

    // 7. Availability Status Filter
    if (active.availabilityStatus && active.availabilityStatus !== 'all') {
      const statusFilter = String(active.availabilityStatus).toLowerCase().trim();
      const isSold = item.status === 'sold' || item.status === 'sold_out' || item.status === 'sold-out';
      const isRented = item.status === 'rented';
      const possession = String(item.possessionStatus || item.possessionDisplay || '').toLowerCase();

      if (statusFilter === 'available') {
        if (isSold || isRented) return false;
      } else if (statusFilter === 'ready-to-move' || statusFilter === 'ready') {
        if (isSold || isRented) return false;
        if (!possession.includes('ready')) return false;
      } else if (statusFilter === 'under-construction') {
        if (isSold || isRented) return false;
        if (!possession.includes('under-construction') && !possession.includes('under construction') && !possession.includes('mid 202')) return false;
      } else if (statusFilter === 'sold') {
        if (!isSold) return false;
      } else if (statusFilter === 'rented') {
        if (!isRented) return false;
      } else {
        if (item.possessionStatus !== active.availabilityStatus && item.status !== active.availabilityStatus) {
          return false;
        }
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
      return list.sort((a, b) => (getNumericPrice(a) || 0) - (getNumericPrice(b) || 0));
    case 'price-desc':
      return list.sort((a, b) => (getNumericPrice(b) || 0) - (getNumericPrice(a) || 0));
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
