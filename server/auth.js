// Server-Side Authentication & Session Manager for Tomar Enterprises Owner Portal
// Enforces PBKDF2 cryptographic password hashing (never plaintext)
// Manages cryptographically random session tokens with automatic expiry

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const AUTH_FILE = path.join(DATA_DIR, 'owner_auth.json');
const SESSION_FILE = path.join(DATA_DIR, 'owner_sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load persisted active sessions from disk so rebooting laptop or restarting
 * dev server does not log out the authenticated owner.
 */
function loadSavedSessions() {
  const map = new Map();
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      const now = Date.now();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.token && item.expiresAt > now) {
            map.set(item.token, item);
          }
        }
      }
    } catch (err) {
      console.warn('[AUTH] Failed to load saved sessions:', err.message);
    }
  }
  return map;
}

/**
 * Atomically persist active sessions to disk
 */
function persistSessions(map) {
  try {
    const valid = Array.from(map.values()).filter((s) => s && s.expiresAt > Date.now());
    const tempFile = `${SESSION_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(valid, null, 2), 'utf-8');
    fs.renameSync(tempFile, SESSION_FILE);
  } catch (err) {
    console.warn('[AUTH] Failed to save sessions:', err.message);
  }
}

// Active sessions map: token -> { username, role, expiresAt }
const activeSessions = loadSavedSessions();

/**
 * Hash a password using PBKDF2 with SHA-512
 */
export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Initialize owner credentials if not already provisioned
 */
function initializeAuthStore() {
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (parsed && parsed.username && parsed.passwordHash && parsed.salt) {
        return parsed;
      }
    } catch {
      // Re-initialize if corrupted
    }
  }

  // Use environment variables if set, otherwise secure initial bootstrap
  const initialUsername = process.env.TOMAR_OWNER_USER || 'admin';
  const initialPassword = process.env.TOMAR_OWNER_PASS || 'Tomar@Admin2026!';
  const salt = crypto.randomBytes(32).toString('hex');
  const passwordHash = hashPassword(initialPassword, salt);

  const authData = {
    username: initialUsername,
    salt,
    passwordHash,
    role: 'owner',
    updatedAt: new Date().toISOString(),
    isInitialPassword: !process.env.TOMAR_OWNER_PASS,
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), 'utf-8');
  console.log('[AUTH] Owner credentials initialized successfully.');
  return authData;
}

// Load auth record
let ownerAuthRecord = initializeAuthStore();

/**
 * Authenticate owner with username and password
 */
export function authenticateOwner(username, password) {
  if (!username || !password) return null;

  // Refresh auth record from disk in case updated
  if (fs.existsSync(AUTH_FILE)) {
    try {
      ownerAuthRecord = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    } catch (err) {
      console.error('[AUTH] Failed to read auth file:', err);
    }
  }

  if (!ownerAuthRecord) {
    return null;
  }

  const cleanUsername = String(username).trim();
  // Case-insensitive comparison prevents auto-capitalization issues on phones/tablets
  if (cleanUsername.toLowerCase() !== String(ownerAuthRecord.username).trim().toLowerCase()) {
    return null;
  }

  const computedHash = hashPassword(password, ownerAuthRecord.salt);
  if (!crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(ownerAuthRecord.passwordHash, 'hex'))) {
    return null;
  }

  // Generate cryptographically random session token
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    token,
    username: ownerAuthRecord.username,
    role: ownerAuthRecord.role || 'owner',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  activeSessions.set(token, session);
  persistSessions(activeSessions);
  return session;
}

/**
 * Validate a session token
 */
export function validateSession(token) {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const session = activeSessions.get(cleanToken);

  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(cleanToken);
    persistSessions(activeSessions);
    return null;
  }

  return session;
}

/**
 * Invalidate a session (logout)
 */
export function invalidateSession(token) {
  if (!token) return false;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const deleted = activeSessions.delete(cleanToken);
  if (deleted) {
    persistSessions(activeSessions);
  }
  return deleted;
}

/**
 * Update owner password
 */
export function updateOwnerPassword(newPassword) {
  return updateOwnerCredentials(null, newPassword);
}

/**
 * Update owner username and password securely
 */
export function updateOwnerCredentials(newUsername, newPassword) {
  if (newUsername && newUsername.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const salt = crypto.randomBytes(32).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  ownerAuthRecord = {
    ...ownerAuthRecord,
    username: newUsername ? newUsername.trim() : ownerAuthRecord.username,
    salt,
    passwordHash,
    updatedAt: new Date().toISOString(),
    isInitialPassword: false,
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(ownerAuthRecord, null, 2), 'utf-8');
  // Clear all existing sessions for security
  activeSessions.clear();
  persistSessions(activeSessions);
  return true;
}

/**
 * Get public auth info (does not expose hash or salt)
 */
export function getAuthStatus() {
  if (fs.existsSync(AUTH_FILE)) {
    try {
      ownerAuthRecord = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    } catch {}
  }

  if (!ownerAuthRecord) {
    return {
      hasConfiguredAuth: false,
      isInitialPassword: true,
      username: null,
      role: null,
    };
  }

  return {
    username: ownerAuthRecord.username,
    role: ownerAuthRecord.role,
    isInitialPassword: Boolean(ownerAuthRecord.isInitialPassword),
    hasConfiguredAuth: !ownerAuthRecord.isInitialPassword,
  };
}
