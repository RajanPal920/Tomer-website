// HTTP API Router for Tomar Enterprises
// Enforces Server-Side Role-Based Authorization
// Normal visitors cannot create, update, or delete properties via API.

import {
  authenticateOwner,
  validateSession,
  invalidateSession,
  getAuthStatus,
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
import { sampleProperties } from '../src/data/properties.js';

// Helper to parse JSON body from incoming Node.js request
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
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

// Helper to send JSON responses
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.end(JSON.stringify(data));
}

/**
 * Handle incoming API requests
 */
export async function handleApiRequest(req, res, sampleDemoProperties = sampleProperties) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.end();
    return;
  }

  // Extract auth token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const session = validateSession(token);
  const isOwner = session && session.role === 'owner';

  try {
    // -----------------------------------------------------------------------
    // AUTHENTICATION ROUTES
    // -----------------------------------------------------------------------

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { username, password } = body;

      const userSession = authenticateOwner(username, password);
      if (!userSession) {
        return sendJson(res, 401, {
          success: false,
          error: 'Invalid username or password. Please verify owner credentials.',
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Owner login successful',
        token: userSession.token,
        user: {
          username: userSession.username,
          role: userSession.role,
        },
      });
    }

    // POST /api/auth/logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      if (token) invalidateSession(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
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
      return sendJson(res, 200, getAuthStatus());
    }

    // -----------------------------------------------------------------------
    // PROPERTY MANAGEMENT ROUTES
    // -----------------------------------------------------------------------

    // GET /api/properties
    if (pathname === '/api/properties' && method === 'GET') {
      const showAll = url.searchParams.get('all') === 'true';

      // If client requests all properties (including drafts/sold), enforce owner authorization
      if (showAll) {
        if (!isOwner) {
          return sendJson(res, 401, {
            error: 'Unauthorized: Owner credentials required to view unpublished drafts and owner data.',
          });
        }
        const ownerProps = getOwnerProperties();
        return sendJson(res, 200, {
          properties: ownerProps,
          total: ownerProps.length,
          isOwnerView: true,
        });
      }

      // Public view: strictly published properties with internal notes stripped
      const publicProps = getPublicProperties(sampleDemoProperties);
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
      const created = createProperty(body);
      return sendJson(res, 201, {
        success: true,
        message: 'Property created successfully',
        property: created,
      });
    }

    // Single Property Routes: /api/properties/:id
    const propIdMatch = pathname.match(/^\/api\/properties\/([^/]+)$/);
    if (propIdMatch) {
      const propId = propIdMatch[1];

      // GET /api/properties/:id
      if (method === 'GET') {
        const prop = findProperty(propId, isOwner, sampleDemoProperties);
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
        const updated = updateProperty(propId, body);
        return sendJson(res, 200, {
          success: true,
          message: 'Property updated successfully',
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

        const deleted = deleteProperty(propId);
        if (!deleted) {
          return sendJson(res, 404, { error: 'Property not found or already removed' });
        }
        return sendJson(res, 200, {
          success: true,
          message: 'Property deleted successfully',
        });
      }
    }

    // -----------------------------------------------------------------------
    // ENQUIRY ROUTES
    // -----------------------------------------------------------------------

    // POST /api/enquiries (Public: Submits an enquiry, NEVER creates a listing)
    if (pathname === '/api/enquiries' && method === 'POST') {
      const body = await parseBody(req);
      const enquiry = recordEnquiry(body);
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

      const enquiries = getEnquiries();
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
      const updated = updateEnquiryStatus(enqIdMatch[1], body.status);
      return sendJson(res, 200, { success: updated });
    }

    // -----------------------------------------------------------------------
    // WEBSITE SETTINGS ROUTES
    // -----------------------------------------------------------------------

    // GET /api/settings
    if (pathname === '/api/settings' && method === 'GET') {
      return sendJson(res, 200, getSettings());
    }

    // PATCH /api/settings (Owner Only)
    if (pathname === '/api/settings' && method === 'PATCH') {
      if (!isOwner) {
        return sendJson(res, 403, {
          error: 'Forbidden: Owner authorization required to modify website settings.',
        });
      }

      const body = await parseBody(req);
      const updated = updateSettings(body);
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
