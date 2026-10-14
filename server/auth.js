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

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory active sessions map: token -> { username, role, expiresAt }
const activeSessions = new Map();

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
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
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

  const cleanUsername = String(username).trim();
  if (cleanUsername !== ownerAuthRecord.username) {
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
  return activeSessions.delete(cleanToken);
}

/**
 * Update owner password
 */
export function updateOwnerPassword(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const salt = crypto.randomBytes(32).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  ownerAuthRecord = {
    ...ownerAuthRecord,
    salt,
    passwordHash,
    updatedAt: new Date().toISOString(),
    isInitialPassword: false,
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(ownerAuthRecord, null, 2), 'utf-8');
  // Clear all existing sessions for security
  activeSessions.clear();
  return true;
}

/**
 * Get public auth info (does not expose hash or salt)
 */
export function getAuthStatus() {
  return {
    username: ownerAuthRecord.username,
    role: ownerAuthRecord.role,
    isInitialPassword: ownerAuthRecord.isInitialPassword,
    hasConfiguredAuth: true,
  };
}
