// Centralized Reactive Property Store for Tomar Enterprises
// Bridges client-side React views with the secure persistent relational database backend.
// Dispatches updates so public search, filters, cards, and detail pages update automatically!

import { sampleProperties, setLivePropertiesCache } from '../data/properties';
import { getAuthToken } from './authService';

let cachedPublicProperties = [...sampleProperties];
let isInitialized = false;
const listeners = new Set();

function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function notifyListeners() {
  // Sync data/properties.js live cache
  setLivePropertiesCache(cachedPublicProperties);

  listeners.forEach((cb) => {
    try {
      cb(cachedPublicProperties);
    } catch (err) {
      console.error('[PROPERTY STORE] Listener error:', err);
    }
  });

  // Also dispatch a DOM window event for universal synchronization
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tomar:properties-updated', {
      detail: { properties: cachedPublicProperties },
    }));
  }
}

/**
 * Fetch latest published properties from backend API
 */
export async function fetchLiveProperties(force = false) {
  if (isInitialized && !force) {
    return cachedPublicProperties;
  }

  try {
    const res = await fetch('/api/properties', {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.properties) && data.properties.length > 0) {
        cachedPublicProperties = data.properties;
        isInitialized = true;
        notifyListeners();
        return cachedPublicProperties;
      }
    }
  } catch (err) {
    console.warn('[PROPERTY STORE] Could not fetch live properties from API; using bundled dataset:', err);
  }

  isInitialized = true;
  return cachedPublicProperties;
}

/**
 * Synchronous getter for currently cached live properties
 */
export function getLiveProperties() {
  return cachedPublicProperties;
}

/**
 * Find property by slug or ID across live properties
 */
export function findLivePropertyBySlug(slug) {
  if (!slug) return null;
  const match = cachedPublicProperties.find((p) => p.slug === slug || p.id === slug);
  return match || null;
}

/**
 * Fetch all properties for owner dashboard (including drafts, sold, and internal notes)
 */
export async function fetchOwnerInventory() {
  const headers = getAuthHeaders();

  const res = await fetch('/api/properties?all=true', {
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch owner inventory from database');
  }

  const data = await res.json();
  return data.properties || [];
}

/**
 * Create a new property listing (Owner Only)
 */
export async function createOwnerListing(propertyData) {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch('/api/properties', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(propertyData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create property in database');
  }

  // Refresh public list so website updates immediately if published
  await fetchLiveProperties(true);
  return data.property;
}

/**
 * Update an existing property listing (Owner Only)
 */
export async function updateOwnerListing(id, propertyData) {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(propertyData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update property in database');
  }

  // Refresh public list
  await fetchLiveProperties(true);
  return data.property;
}

/**
 * Delete a property listing (Owner Only)
 */
export async function deleteOwnerListing(id) {
  const headers = getAuthHeaders();

  const res = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete property from database');
  }

  // Refresh public list
  await fetchLiveProperties(true);
  return true;
}

/**
 * Upload an image file for a property listing (Owner Only)
 * Converts File to base64 and uploads to /api/upload
 */
export async function uploadPropertyImage(file) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Allowed formats: JPEG, PNG, WebP.');
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the 5MB limit.`);
  }

  // Read as base64 data URL
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      data: base64Data,
      filename: file.name,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload property image');
  }

  return data;
}

/**
 * Change owner credentials (Owner Only)
 */
export async function changeOwnerCredentials(newUsername, newPassword) {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ newUsername, newPassword }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update owner credentials');
  }

  return data;
}

/**
 * Submit a public customer enquiry (Does NOT create a listing)
 */
export async function submitEnquiry(enquiryData) {
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(enquiryData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to record enquiry');
  }
  return data;
}

/**
 * Fetch all visitor enquiries for owner dashboard (Owner Only)
 */
export async function fetchOwnerEnquiries() {
  const headers = getAuthHeaders();

  const res = await fetch('/api/enquiries', {
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch enquiries');
  }

  const data = await res.json();
  return data.enquiries || [];
}

/**
 * Update enquiry review status (Owner Only)
 */
export async function updateEnquiryStatus(id, status) {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch(`/api/enquiries/${id}`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  return Boolean(data.success);
}

/**
 * Fetch website settings
 */
export async function fetchWebsiteSettings() {
  try {
    const res = await fetch('/api/settings', { credentials: 'include' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[SETTINGS] Could not fetch settings from API:', err);
  }
  return { showDemoInventory: true };
}

/**
 * Update website settings (Owner Only)
 */
export async function updateWebsiteSettings(settings) {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(settings),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update settings');
  }

  // Refresh live properties to reflect demo inventory visibility changes
  await fetchLiveProperties(true);
  return data.settings;
}

/**
 * Subscribe to property store changes
 */
export function subscribeToProperties(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Auto-initialize on import in browser environment
if (typeof window !== 'undefined') {
  fetchLiveProperties();
}
