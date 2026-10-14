// Client-Side Authentication Service for Tomar Enterprises Owner Portal
// Communicates with the secure backend server. Zero credentials in frontend source.

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
 * Check if client currently holds a valid session token
 */
export function isAuthenticated() {
  return Boolean(getAuthToken());
}

/**
 * Verify session with the backend server
 */
export async function verifySession() {
  const token = getAuthToken();
  if (!token) return { authenticated: false };

  try {
    const res = await fetch('/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return { authenticated: true, user: data.user };
    } else {
      // Token expired or invalid on server
      logout();
      return { authenticated: false };
    }
  } catch (err) {
    console.warn('[AUTH] Offline or failed to verify session with backend:', err);
    // If client has token, retain session for offline resilience
    const user = getCurrentUser();
    return { authenticated: Boolean(user), user };
  }
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
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid credentials. Please verify username and password.',
      };
    }

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));

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
  if (token) {
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    } catch {
      // Ignore network errors on logout
    }
  }

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  notifyListeners(null);
  return { success: true };
}

/**
 * Subscribe to auth state changes (login, logout)
 */
export function subscribeToAuth(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
