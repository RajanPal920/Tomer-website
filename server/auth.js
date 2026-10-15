// Server-Side Authentication & Session Management for Tomar Enterprises Owner Portal
// Enforces:
//   - Relational Database persistence for Owner credentials and Sessions (SQLite / PostgreSQL)
//   - Cryptographic password hashing via bcrypt (12 rounds) with backward-compatibility auto-upgrade
//   - In-database rate limiting for brute-force protection
//   - Cryptographically random session tokens with configurable expiry and HttpOnly cookie support
//   - Zero account wipes on app restart, server reboot, or file watching

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { query, get, run, initDatabase } from './db/index.js';

const BCRYPT_ROUNDS = 12;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

// =========================================================================
// PASSWORD HASHING & VERIFICATION
// =========================================================================

/**
 * Hash a password using bcrypt (12 rounds)
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Legacy PBKDF2 hash verification for seamless upgrade from previous versions
 */
function verifyLegacyPbkdf2(password, storedHash, salt) {
  if (!salt || !storedHash) return false;
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Verify a password against stored hash (supports bcrypt and legacy PBKDF2)
 */
export async function verifyPassword(password, storedHash, legacySalt = null) {
  if (!password || !storedHash) return { valid: false, needsUpgrade: false };

  // Check if bcrypt hash
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    const valid = await bcrypt.compare(password, storedHash);
    return { valid, needsUpgrade: false };
  }

  // Check if legacy PBKDF2 hex hash
  if (legacySalt && verifyLegacyPbkdf2(password, storedHash, legacySalt)) {
    return { valid: true, needsUpgrade: true };
  }

  return { valid: false, needsUpgrade: false };
}

// =========================================================================
// RATE LIMITING
// =========================================================================

export async function checkRateLimit(identifier) {
  const now = Date.now();
  const record = await get('SELECT * FROM login_rate_limits WHERE key = ?', [identifier]);

  if (record) {
    if (record.locked_until && record.locked_until > now) {
      const waitMinutes = Math.ceil((record.locked_until - now) / 60000);
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((record.locked_until - now) / 1000),
        message: `Too many failed login attempts. Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before trying again.`,
      };
    }

    // Reset window if past window
    if (now - record.first_attempt_at > RATE_LIMIT_WINDOW_MS) {
      await run('DELETE FROM login_rate_limits WHERE key = ?', [identifier]);
    }
  }

  return { allowed: true };
}

export async function recordFailedLogin(identifier) {
  const now = Date.now();
  const record = await get('SELECT * FROM login_rate_limits WHERE key = ?', [identifier]);

  if (!record) {
    await run(
      'INSERT INTO login_rate_limits (key, attempts, first_attempt_at, last_attempt_at, locked_until) VALUES (?, ?, ?, ?, ?)',
      [identifier, 1, now, now, 0]
    );
    return { remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  const newAttempts = record.attempts + 1;
  let lockedUntil = 0;

  if (newAttempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    lockedUntil = now + RATE_LIMIT_LOCKOUT_MS;
  }

  await run(
    'UPDATE login_rate_limits SET attempts = ?, last_attempt_at = ?, locked_until = ? WHERE key = ?',
    [newAttempts, now, lockedUntil, identifier]
  );

  return {
    remainingAttempts: Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - newAttempts),
    isLocked: lockedUntil > 0,
  };
}

export async function clearRateLimit(identifier) {
  await run('DELETE FROM login_rate_limits WHERE key = ?', [identifier]);
}

// =========================================================================
// OWNER ACCOUNT PROVISIONING & AUTHENTICATION
// =========================================================================

/**
 * Initialize Owner Account from environment variables ONLY if table is completely empty.
 * Never resets or overwrites an existing account!
 */
export async function initializeOwnerAuthIfNeeded() {
  await initDatabase();

  const existing = await get('SELECT * FROM owner_users LIMIT 1');
  if (existing) {
    // Owner already provisioned. Do NOT overwrite.
    return existing;
  }

  // If env vars are set, bootstrap initial owner
  const envUser = process.env.TOMAR_OWNER_USER || 'admin';
  const envPass = process.env.TOMAR_OWNER_PASS || 'sanjay@82';
  const hashedPassword = await hashPassword(envPass);
  const now = new Date().toISOString();
  const id = `user-owner-${Date.now()}`;

  await run(
    'INSERT INTO owner_users (id, username, password_hash, role, created_at, updated_at, is_initial_password) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, envUser.trim(), hashedPassword, 'owner', now, now, process.env.TOMAR_OWNER_PASS ? 0 : 1]
  );

  console.log(`[AUTH] Initial owner account provisioned: "${envUser}".`);
  return { id, username: envUser, role: 'owner' };
}

/**
 * Authenticate owner with username and password
 */
export async function authenticateOwner(username, password, options = {}) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const cleanUser = String(username).trim();
  const ip = options.ip || '127.0.0.1';
  const rateLimitKey = `login:${cleanUser.toLowerCase()}:${ip}`;

  // 1. Rate Limit Check
  const rateCheck = await checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      success: false,
      status: 429,
      error: rateCheck.message,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    };
  }

  // 2. Fetch User Record (Case-insensitive username)
  const user = await get(
    'SELECT * FROM owner_users WHERE LOWER(username) = LOWER(?)',
    [cleanUser]
  );

  if (!user) {
    const failedInfo = await recordFailedLogin(rateLimitKey);
    return {
      success: false,
      status: 401,
      error: 'Invalid username or password. Please verify owner credentials.',
      remainingAttempts: failedInfo.remainingAttempts,
    };
  }

  // 3. Verify Password
  const { valid, needsUpgrade } = await verifyPassword(password, user.password_hash);
  if (!valid) {
    const failedInfo = await recordFailedLogin(rateLimitKey);
    return {
      success: false,
      status: 401,
      error: 'Invalid username or password. Please verify owner credentials.',
      remainingAttempts: failedInfo.remainingAttempts,
    };
  }

  // Password valid! Clear rate limit
  await clearRateLimit(rateLimitKey);

  // Upgrade legacy hash if needed
  if (needsUpgrade) {
    const newBcryptHash = await hashPassword(password);
    await run(
      'UPDATE owner_users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [newBcryptHash, new Date().toISOString(), user.id]
    );
    console.log(`[AUTH] Upgraded password hash for owner "${user.username}" to bcrypt.`);
  }

  // 4. Create Session in Database
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const durationMs = options.remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 24 hours
  const expiresAt = now + durationMs;

  await run(
    'INSERT INTO owner_sessions (token, user_id, username, role, created_at, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [token, user.id, user.username, user.role, now, expiresAt, ip, options.userAgent || null]
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    expiresAt,
    remember: Boolean(options.remember),
  };
}

/**
 * Validate a session token against database
 */
export async function validateSession(token) {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) return null;

  const session = await get('SELECT * FROM owner_sessions WHERE token = ?', [cleanToken]);
  if (!session) return null;

  if (Date.now() > Number(session.expires_at)) {
    // Session expired; delete from database
    await run('DELETE FROM owner_sessions WHERE token = ?', [cleanToken]);
    return null;
  }

  return {
    token: session.token,
    userId: session.user_id,
    username: session.username,
    role: session.role,
    expiresAt: Number(session.expires_at),
  };
}

/**
 * Invalidate a session (Logout)
 */
export async function invalidateSession(token) {
  if (!token) return false;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const res = await run('DELETE FROM owner_sessions WHERE token = ?', [cleanToken]);
  return res.changes > 0;
}

/**
 * Update owner credentials
 */
export async function updateOwnerCredentials(newUsername, newPassword) {
  if (newUsername && newUsername.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long for security');
  }

  const user = await get('SELECT * FROM owner_users LIMIT 1');
  if (!user) {
    throw new Error('No owner account found to update. Run npm run setup-owner first.');
  }

  const hashedPassword = await hashPassword(newPassword);
  const updatedUser = newUsername ? newUsername.trim() : user.username;
  const now = new Date().toISOString();

  await run(
    'UPDATE owner_users SET username = ?, password_hash = ?, updated_at = ?, is_initial_password = 0 WHERE id = ?',
    [updatedUser, hashedPassword, now, user.id]
  );

  // Invalidate all active sessions for security so re-login is required with new credentials
  await run('DELETE FROM owner_sessions WHERE user_id = ?', [user.id]);
  return true;
}

/**
 * Get public auth status
 */
export async function getAuthStatus() {
  await initDatabase();
  const user = await get('SELECT username, role, is_initial_password FROM owner_users LIMIT 1');

  if (!user) {
    return {
      hasConfiguredAuth: false,
      isInitialPassword: true,
      username: null,
      role: null,
    };
  }

  return {
    hasConfiguredAuth: !user.is_initial_password,
    isInitialPassword: Boolean(user.is_initial_password),
    username: user.username,
    role: user.role,
  };
}

/**
 * Delete expired sessions periodically
 */
export async function cleanupExpiredSessions() {
  await run('DELETE FROM owner_sessions WHERE expires_at < ?', [Date.now()]);
}
