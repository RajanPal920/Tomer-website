// HTTP API Router for Tomar Enterprises
// Enforces Server-Side Role-Based Authorization & Persistent Relational Database Operations
// Normal visitors cannot create, update, or delete properties via API.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  authenticateOwner,
  validateSession,
  invalidateSession,
  getAuthStatus,
  updateOwnerCredentials,
  initializeOwnerAuthIfNeeded,
} from './auth.js';

import {
  getOwnerProperties,
  getPublicProperties,
  findProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  recordEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  getSettings,
  updateSettings,
} from './dataStore.js';

import { checkHealth, runMigrations } from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_PROPS_DIR = path.join(__dirname, '..', 'public', 'images', 'properties');
const DIST_PROPS_DIR = path.join(__dirname, '..', 'dist', 'images', 'properties');

// Ensure image upload directories exist
try {
  if (!fs.existsSync(PUBLIC_PROPS_DIR)) {
    fs.mkdirSync(PUBLIC_PROPS_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments
}

// Auto-run schema migrations on first request / import
let isBootstrapped = false;
async function ensureBootstrapped() {
  if (!isBootstrapped) {
    await runMigrations();
    await initializeOwnerAuthIfNeeded();
    isBootstrapped = true;
  }
}

// Helper to parse JSON body from incoming Node.js request with configurable size limit
function parseBody(req, limit = 15 * 1024 * 1024) {
  // Support pre-parsed body from serverless runtimes (Vercel / Express / Micro)
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return Promise.resolve(req.body);
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch {
        return Promise.resolve({});
      }
    }
  }

  return new Promise((resolve) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        req.destroy();
        resolve({});
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Parse cookies from request header
function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach((part) => {
    const [name, ...val] = part.trim().split('=');
    if (name) {
      cookies[name.trim()] = decodeURIComponent(val.join('=') || '');
    }
  });
  return cookies;
}

// Helper to send JSON responses with CORS & optional Set-Cookie
function sendJson(res, statusCode, data, headers = {}) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Handle CORS
  const origin = res.reqOrigin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  for (const [key, val] of Object.entries(headers)) {
    res.setHeader(key, val);
  }

  res.end(JSON.stringify(data));
}

/**
 * Handle incoming API requests
 */
export async function handleApiRequest(req, res) {
  await ensureBootstrapped();

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname;

  // Support Vercel serverless catch-all rewrites where req.url might be rewritten to /api/index.js or /api
  if ((pathname === '/api' || pathname === '/api/' || pathname === '/api/index.js' || pathname.startsWith('/api/[...all]')) && req.query && req.query.all) {
    const subpath = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    pathname = `/api/${subpath}`;
  }
  // Strip trailing slash for consistent route matching
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.replace(/\/+$/, '');
  }

  const method = req.method.toUpperCase();
  res.reqOrigin = req.headers.origin || '*';

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.end();
    return;
  }

  // Extract auth token from Authorization Header OR HttpOnly Cookie
  const authHeader = req.headers.authorization || '';
  const cookies = parseCookies(req);
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (cookies.tomar_session) {
    token = cookies.tomar_session.trim();
  }

  const session = token ? await validateSession(token) : null;
  const isOwner = Boolean(session && session.role === 'owner');

  try {
    // -----------------------------------------------------------------------
    // HEALTH CHECK ROUTE
    // -----------------------------------------------------------------------
    if (pathname === '/api/health' && method === 'GET') {
      const health = await checkHealth();
      return sendJson(res, health.status === 'ok' ? 200 : 503, {
        status: health.status,
        database: health,
        timestamp: new Date().toISOString(),
      });
    }

    // -----------------------------------------------------------------------
    // AUTHENTICATION ROUTES
    // -----------------------------------------------------------------------

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { username, password, remember = true } = body;

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      const authResult = await authenticateOwner(username, password, {
        remember: Boolean(remember),
        ip,
        userAgent,
      });

      if (!authResult.success) {
        const status = authResult.status || 401;
        const extraHeaders = {};
        if (authResult.retryAfterSeconds) {
          extraHeaders['Retry-After'] = String(authResult.retryAfterSeconds);
        }
        return sendJson(res, status, {
          success: false,
          error: authResult.error,
          remainingAttempts: authResult.remainingAttempts,
        }, extraHeaders);
      }

      // Build secure HttpOnly Cookie
      const maxAge = remember ? 30 * 24 * 3600 : 24 * 3600; // 30 days vs 24 hours
      const isSecure = Boolean(
        process.env.VERCEL ||
        req.headers['x-forwarded-proto'] === 'https' ||
        process.env.NODE_ENV === 'production'
      );
      const cookieVal = `tomar_session=${authResult.token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`;

      return sendJson(
        res,
        200,
        {
          success: true,
          message: 'Owner login successful',
          token: authResult.token,
          user: authResult.user,
          expiresAt: authResult.expiresAt,
        },
        { 'Set-Cookie': cookieVal }
      );
    }

    // POST /api/auth/logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      if (token) {
        await invalidateSession(token);
      }
      const isSecure = Boolean(
        process.env.VERCEL ||
        req.headers['x-forwarded-proto'] === 'https' ||
        process.env.NODE_ENV === 'production'
      );
      const clearCookie = `tomar_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      return sendJson(
        res,
        200,
        { success: true, message: 'Logged out successfully' },
        { 'Set-Cookie': clearCookie }
      );
    }

    // GET /api/auth/session
    if (pathname === '/api/auth/session' && method === 'GET') {
      if (!isOwner) {
        return sendJson(res, 401, {
          authenticated: false,
          error: 'No active session or session expired',
        });
      }

      return sendJson(res, 200, {
        authenticated: true,
        user: {
          username: session.username,
          role: session.role,
        },
      });
    }

    // GET /api/auth/status
    if (pathname === '/api/auth/status' && method === 'GET') {
      const status = await getAuthStatus();
      return sendJson(res, 200, status);
    }

    // POST /api/auth/change-password (Owner Only)
    if (pathname === '/api/auth/change-password' && method === 'POST') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authorization required to change credentials.',
        });
      }

      const body = await parseBody(req);
      const { newUsername, newPassword } = body;

      if (!newPassword || newPassword.length < 8) {
        return sendJson(res, 400, {
          error: 'New password must be at least 8 characters long.',
        });
      }

      try {
        await updateOwnerCredentials(newUsername, newPassword);
        const clearCookie = 'tomar_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
        return sendJson(
          res,
          200,
          {
            success: true,
            message: 'Owner credentials updated successfully. Please sign in with your updated credentials.',
          },
          { 'Set-Cookie': clearCookie }
        );
      } catch (err) {
        return sendJson(res, 400, {
          error: err.message || 'Failed to update owner credentials.',
        });
      }
    }

    // -----------------------------------------------------------------------
    // IMAGE UPLOAD ROUTE (Owner Only)
    // -----------------------------------------------------------------------

    // POST /api/upload (Owner Only)
    if (pathname === '/api/upload' && method === 'POST') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authentication required to upload property images.',
        });
      }

      const body = await parseBody(req);
      const rawData = body.image || body.data;
      if (!rawData) {
        return sendJson(res, 400, {
          error: 'Missing image data. Please provide base64 data string.',
        });
      }

      const match = String(rawData).match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
      if (!match) {
        return sendJson(res, 400, {
          error: 'Invalid image format. Supported formats: JPEG, PNG, WebP.',
        });
      }

      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Max size: 5MB
      if (buffer.length > 5 * 1024 * 1024) {
        return sendJson(res, 400, {
          error: 'Image file size exceeds maximum allowed limit of 5MB.',
        });
      }

      try {
        if (!fs.existsSync(PUBLIC_PROPS_DIR)) {
          fs.mkdirSync(PUBLIC_PROPS_DIR, { recursive: true });
        }

        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const filename = `prop-${uniqueSuffix}.${ext}`;
        const targetPath = path.join(PUBLIC_PROPS_DIR, filename);
        fs.writeFileSync(targetPath, buffer);

        if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
          if (!fs.existsSync(DIST_PROPS_DIR)) {
            fs.mkdirSync(DIST_PROPS_DIR, { recursive: true });
          }
          fs.writeFileSync(path.join(DIST_PROPS_DIR, filename), buffer);
        }

        const publicUrl = `/images/properties/${filename}`;
        return sendJson(res, 201, {
          success: true,
          message: 'Property image uploaded and stored successfully',
          url: publicUrl,
          filename,
          sizeBytes: buffer.length,
        });
      } catch (uploadErr) {
        console.warn('[UPLOAD WARNING] Local filesystem write failed (serverless environment):', uploadErr.message);
        // Fallback for serverless storage: return base64 data URI if disk is read-only
        const dataUri = `data:image/${ext};base64,${base64Data}`;
        return sendJson(res, 201, {
          success: true,
          message: 'Property image processed successfully (serverless mode)',
          url: dataUri,
          filename: `prop-${Date.now()}.${ext}`,
          sizeBytes: buffer.length,
        });
      }
    }

    // -----------------------------------------------------------------------
    // PROPERTY MANAGEMENT ROUTES
    // -----------------------------------------------------------------------

    // GET /api/properties
    if (pathname === '/api/properties' && method === 'GET') {
      const showAll = url.searchParams.get('all') === 'true';

      if (showAll) {
        if (!isOwner) {
          return sendJson(res, 401, {
            error: 'Unauthorized: Owner credentials required to view unpublished drafts and owner data.',
          });
        }

        const filterOptions = {
          status: url.searchParams.get('status') || 'all',
          locality: url.searchParams.get('locality') || 'all',
          category: url.searchParams.get('category') || 'all',
          transactionType: url.searchParams.get('transactionType') || 'all',
          search: url.searchParams.get('search') || '',
          sort: url.searchParams.get('sort') || 'newest',
          limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : null,
          offset: url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : null,
        };

        const ownerProps = await getOwnerProperties(filterOptions);
        return sendJson(res, 200, {
          properties: ownerProps,
          total: ownerProps.length,
          isOwnerView: true,
        });
      }

      const publicProps = await getPublicProperties();
      return sendJson(res, 200, {
        properties: publicProps,
        total: publicProps.length,
        isOwnerView: false,
      });
    }

    // POST /api/properties (Owner Only)
    if (pathname === '/api/properties' && method === 'POST') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: You do not have permission to publish or create properties. Owner authentication is required.',
        });
      }

      const body = await parseBody(req);
      const created = await createProperty(body);
      return sendJson(res, 201, {
        success: true,
        message: 'Property created successfully and persisted to database',
        property: created,
      });
    }

    // Single Property Routes: /api/properties/:id
    const propIdMatch = pathname.match(/^\/api\/properties\/([^/]+)$/);
    if (propIdMatch) {
      const propId = propIdMatch[1];

      // GET /api/properties/:id
      if (method === 'GET') {
        const prop = await findProperty(propId, isOwner);
        if (!prop) {
          return sendJson(res, 404, { error: 'Property not found or unavailable' });
        }
        return sendJson(res, 200, { property: prop });
      }

      // PATCH /api/properties/:id (Owner Only)
      if (method === 'PATCH' || method === 'PUT') {
        if (!isOwner) {
          return sendJson(res, 403, {
            error: 'Forbidden: Owner authentication required to update property details.',
          });
        }

        const body = await parseBody(req);
        const updated = await updateProperty(propId, body);
        return sendJson(res, 200, {
          success: true,
          message: 'Property updated successfully in database',
          property: updated,
        });
      }

      // DELETE /api/properties/:id (Owner Only)
      if (method === 'DELETE') {
        if (!isOwner) {
          return sendJson(res, 403, {
            error: 'Forbidden: Owner authentication required to delete property records.',
          });
        }

        const deleted = await deleteProperty(propId);
        if (!deleted) {
          return sendJson(res, 404, { error: 'Property not found or already removed' });
        }
        return sendJson(res, 200, {
          success: true,
          message: 'Property deleted successfully from database',
        });
      }
    }

    // -----------------------------------------------------------------------
    // ENQUIRY ROUTES
    // -----------------------------------------------------------------------

    // POST /api/enquiries (Public: Submits an enquiry, NEVER creates a listing)
    if (pathname === '/api/enquiries' && method === 'POST') {
      const body = await parseBody(req);
      const enquiry = await recordEnquiry(body);
      return sendJson(res, 201, {
        success: true,
        message: 'Your property enquiry has been recorded with Tomar Enterprises advisory desk.',
        enquiryId: enquiry.id,
      });
    }

    // GET /api/enquiries (Owner Only)
    if (pathname === '/api/enquiries' && method === 'GET') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authorization required to access customer enquiries.',
        });
      }

      const enquiries = await getEnquiries();
      return sendJson(res, 200, {
        enquiries,
        total: enquiries.length,
      });
    }

    // PATCH /api/enquiries/:id (Owner Only)
    const enqIdMatch = pathname.match(/^\/api\/enquiries\/([^/]+)$/);
    if (enqIdMatch && method === 'PATCH') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authorization required to update enquiry status.',
        });
      }

      const body = await parseBody(req);
      const updated = await updateEnquiryStatus(enqIdMatch[1], body.status);
      return sendJson(res, 200, { success: updated });
    }

    // -----------------------------------------------------------------------
    // WEBSITE SETTINGS ROUTES
    // -----------------------------------------------------------------------

    // GET /api/settings
    if (pathname === '/api/settings' && method === 'GET') {
      const settings = await getSettings();
      return sendJson(res, 200, settings);
    }

    // PATCH /api/settings (Owner Only)
    if (pathname === '/api/settings' && method === 'PATCH') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authorization required to modify website settings.',
        });
      }

      const body = await parseBody(req);
      const updated = await updateSettings(body);
      return sendJson(res, 200, { success: true, settings: updated });
    }

    // Unmatched API endpoint
    return sendJson(res, 404, { error: `Endpoint not found: ${method} ${pathname}` });
  } catch (err) {
    console.error('[API ERROR]', err);
    return sendJson(res, 500, {
      error: err.message || 'Internal server error processing property API request',
    });
  }
}
