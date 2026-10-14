// LocalStorage Manager for User Preferences: Favourites, Recently Viewed, and Property Comparison
// Persistent across browser sessions, zero login required.

const FAVOURITES_KEY = 'tomar_user_favourites';
const RECENT_KEY = 'tomar_user_recent_viewed';
const COMPARE_KEY = 'tomar_user_compare';

const listeners = new Set();

function notifyListeners(type, data) {
  listeners.forEach((callback) => {
    try {
      callback(type, data);
    } catch (e) {
      console.error('Error in user preferences listener', e);
    }
  });
}

export function subscribeToPreferences(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ============================================================================
// 1. FAVOURITES
// ============================================================================

export function getFavourites() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavourite(propertyId) {
  if (!propertyId) return false;
  const favs = getFavourites();
  return favs.includes(propertyId);
}

export function toggleFavourite(propertyId) {
  if (!propertyId || typeof window === 'undefined') return false;
  const favs = getFavourites();
  const exists = favs.includes(propertyId);
  const updated = exists ? favs.filter((id) => id !== propertyId) : [...favs, propertyId];
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
    notifyListeners('favourites', updated);
  } catch (e) {
    console.error('Failed to save favourite', e);
  }
  return !exists;
}

// ============================================================================
// 2. RECENTLY VIEWED
// ============================================================================

export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(propertyId) {
  if (!propertyId || typeof window === 'undefined') return;
  const recent = getRecentlyViewed().filter((id) => id !== propertyId);
  const updated = [propertyId, ...recent].slice(0, 10); // Keep max 10 recent
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    notifyListeners('recent', updated);
  } catch (e) {
    console.error('Failed to save recently viewed', e);
  }
}

// ============================================================================
// 3. PROPERTY COMPARISON (Up to 3 properties)
// ============================================================================

export function getCompareList() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isInCompare(propertyId) {
  if (!propertyId) return false;
  const list = getCompareList();
  return list.includes(propertyId);
}

export function toggleCompare(propertyId) {
  if (!propertyId || typeof window === 'undefined') return { success: false, list: [] };
  const list = getCompareList();
  const exists = list.includes(propertyId);

  if (exists) {
    const updated = list.filter((id) => id !== propertyId);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    notifyListeners('compare', updated);
    return { success: true, added: false, list: updated };
  }

  if (list.length >= 3) {
    return {
      success: false,
      message: 'You can compare up to 3 properties at a time. Please remove a property to add another.',
      list,
    };
  }

  const updated = [...list, propertyId];
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    notifyListeners('compare', updated);
  } catch (e) {
    console.error('Failed to save compare list', e);
  }
  return { success: true, added: true, list: updated };
}

export function clearCompare() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPARE_KEY);
  notifyListeners('compare', []);
}
