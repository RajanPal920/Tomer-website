// Client-Side Authentication Service for Tomar Enterprises Owner Portal
// Communicates with the secure backend server. Zero credentials in frontend source.
// Enforces:
//   - Primary reliance on secure HttpOnly cookies (tomar_session)
//   - Zero passwords, session secrets, or sensitive authentication tokens in localStorage
//   - Automatic session verification via /api/auth/session
//   - Change password workflow with instant authenticated session establishment

const USER_KEY = 'tomar_owner_user';
const SESSION_MEM_TOKEN = 'tomar_mem_token';

let inMemoryToken = null;

// Cleanup any legacy tokens from localStorage to respect strict security policy
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('tomar_owner_auth_token');
    localStorage.removeItem('tomar_session_secret');
    inMemoryToken = sessionStorage.getItem(SESSION_MEM_TOKEN) || null;
  } catch {
    // Ignore storage access errors
  }
}

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
 * Get in-memory / session-scoped auth token (never from localStorage)
 */
export function getAuthToken() {
  return inMemoryToken;
}

/**
 * Get current stored user profile (non-sensitive metadata)
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userJson = sessionStorage.getItem(USER_KEY);
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Check if client currently holds an authenticated session or cached owner user
 */
export function isAuthenticated() {
  return Boolean(inMemoryToken || getCurrentUser());
}

/**
 * Verify session with backend server (verifies HttpOnly cookie and/or Bearer token)
 */
export async function verifySession() {
  const headers = {};
  if (inMemoryToken) {
    headers.Authorization = `Bearer ${inMemoryToken}`;
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
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
        notifyListeners(data.user);
        return { authenticated: true, user: data.user };
      }
    }

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
 * Clear client-side session state without server call
 */
function clearClientSession() {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_MEM_TOKEN);
    localStorage.removeItem('tomar_owner_auth_token');
    localStorage.removeItem(USER_KEY);
  }
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
      const errorMsg =
        data?.error ||
        (res.status === 404
          ? 'Authentication endpoint not found on server (HTTP 404). Please verify server deployment.'
          : `Authentication failed (HTTP ${res.status}). Please check credentials.`);
      return {
        success: false,
        status: res.status,
        error: errorMsg,
      };
    }

    // Keep token in memory and sessionStorage only (never in localStorage)
    if (data.token) {
      inMemoryToken = data.token;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_MEM_TOKEN, data.token);
      }
    }
    if (data.user && typeof window !== 'undefined') {
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
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
 * Change owner password with server-side current password & identity verification.
 * On success, establishes a new authenticated session automatically.
 */
export async function changeOwnerPassword({ username, currentPassword, newPassword, confirmPassword }) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (inMemoryToken) {
      headers.Authorization = `Bearer ${inMemoryToken}`;
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        username: username?.trim(),
        currentPassword,
        newPassword,
        confirmPassword,
      }),
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
      const errorMsg =
        data?.error ||
        `Password change failed (HTTP ${res.status}). Please verify current password and strong password requirements.`;
      return {
        success: false,
        status: res.status,
        error: errorMsg,
      };
    }

    // Server established fresh session token and HttpOnly cookie
    if (data.token) {
      inMemoryToken = data.token;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_MEM_TOKEN, data.token);
      }
    }
    if (data.user && typeof window !== 'undefined') {
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    // Verify session with the backend session API
    await verifySession();

    notifyListeners(data.user);
    return {
      success: true,
      message: data.message || 'Password changed successfully',
      user: data.user,
      token: data.token,
    };
  } catch (err) {
    console.error('[AUTH CHANGE PASSWORD ERROR]', err);
    return {
      success: false,
      error: 'Network error communicating with password change service.',
    };
  }
}

/**
 * Logout owner session
 */
export async function logout() {
  const headers = {};
  if (inMemoryToken) {
    headers.Authorization = `Bearer ${inMemoryToken}`;
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
 * Subscribe to auth state changes (login, logout, password change)
 */
export function subscribeToAuth(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
