// Client-Side Authentication Service for Tomar Enterprises Owner Portal
// Communicates with the secure backend server. Zero credentials in frontend source.
// Supports both HttpOnly secure cookies and Bearer tokens for session continuity.

const TOKEN_KEY = 'tomar_owner_auth_token';
const USER_KEY = 'tomar_owner_user';

const listeners = new Set();

function notifyListeners(user) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (err) {
      console.error('[AUTH] Listener error:', err);
    }
  });
}

/**
 * Get stored auth token
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

/**
 * Get current stored user profile
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userJson = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Check if client currently holds a session token or cached owner user
 */
export function isAuthenticated() {
  return Boolean(getAuthToken() || getCurrentUser());
}

/**
 * Verify session with the backend server (checks both Bearer token and HttpOnly cookie)
 */
export async function verifySession() {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/auth/session', {
      headers,
      credentials: 'include',
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      if (data && data.authenticated && data.user) {
        // Sync user profile to storage
        const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(data.user));
        notifyListeners(data.user);
        return { authenticated: true, user: data.user };
      }
    }

    // Server rejected session (expired, invalid, or endpoint not deployed)
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      clearClientSession();
      return { authenticated: false };
    }
  } catch (err) {
    console.warn('[AUTH] Network error verifying session with backend:', err.message);
  }

  return { authenticated: false };
}

/**
 * Clear local storage keys without server call
 */
function clearClientSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
}

/**
 * Authenticate owner with username and password against backend API
 */
export async function login(username, password, remember = true) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, remember }),
    });

    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }

    if (!res.ok || !data || !data.success) {
      const errorMsg = data?.error || (res.status === 404
        ? 'Authentication endpoint not found on server (HTTP 404). Please verify server deployment.'
        : `Authentication failed (HTTP ${res.status}). Please check credentials.`);
      return {
        success: false,
        status: res.status,
        error: errorMsg,
      };
    }

    const storage = remember ? localStorage : sessionStorage;
    if (data.token) {
      storage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      storage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    notifyListeners(data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    return {
      success: false,
      error: 'Network error communicating with authentication service.',
    };
  }
}

/**
 * Logout owner session
 */
export async function logout() {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers,
      credentials: 'include',
    }).catch(() => {});
  } catch {
    // Ignore network error on logout
  }

  clearClientSession();
  return { success: true };
}

/**
 * Subscribe to auth state changes (login, logout)
 */
export function subscribeToAuth(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
