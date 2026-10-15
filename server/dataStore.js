// Server-Side Data Store for Tomar Enterprises
// Enforces:
//   - Persistent Relational Database (SQLite / PostgreSQL)
//   - Strict Role-Based Privacy: drafts and internal notes NEVER leak to public
//   - Support for 150+ properties with server-side filtering, sorting, pagination, and search
//   - Zero reliance on temporary flat files or in-memory arrays

import { query, get, run } from './db/index.js';

export const APPROVED_CORRIDOR_LOCALITIES = [
  'vasai', 'vasai-road', 'vasai road', 'nalasopara', 'virar', 'vaitarna', 'saphale', 'kelve-road', 'kelve', 'palghar'
];

export function isLocalityInApprovedCorridor(locality) {
  if (!locality) return false;
  const l = String(locality).toLowerCase().trim();
  return APPROVED_CORRIDOR_LOCALITIES.some((a) => l === a || l.startsWith(a));
}

// Helper to convert database row to clean camelCase property object
function mapRowToProperty(row) {
  if (!row) return null;

  let gallery = [];
  try {
    gallery = typeof row.gallery === 'string' ? JSON.parse(row.gallery) : (row.gallery || []);
  } catch {
    gallery = [row.image];
  }

  let features = [];
  try {
    features = typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []);
  } catch {
    features = [];
  }

  const isOutsideCorridor = !isLocalityInApprovedCorridor(row.locality);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    transactionType: row.transaction_type,
    locality: row.locality,
    subLocation: row.sub_location || row.locality,
    address: row.address || '',
    price: row.price || '',
    priceDisplay: row.price_display || row.price || 'Price on Request',
    pricePerSqft: row.price_per_sqft || null,
    priceNumber: row.price_number !== null ? Number(row.price_number) : null,
    monthlyRent: row.monthly_rent || null,
    depositAmount: row.deposit_amount || null,
    leaseTerm: row.lease_term || null,
    areaSqFt: row.area_sqft !== null ? Number(row.area_sqft) : null,
    areaDisplay: row.area_display || (row.area_sqft ? `${row.area_sqft} sq.ft` : null),
    areaUnit: row.area_unit || 'sq.ft',
    bedrooms: row.bedrooms !== null ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null,
    furnishing: row.furnishing || null,
    possessionStatus: row.possession_status || 'Ready to Move',
    image: row.image,
    gallery,
    features,
    description: row.description || '',
    status: row.status || 'draft',
    featured: Boolean(row.featured),
    isDemo: Boolean(row.is_demo),
    isVerified: Boolean(row.is_verified),
    isOutsideCorridor,
    internalNotes: row.internal_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Generate a clean, SEO-friendly slug
 */
export async function generateSlug(title, locality, currentId = null) {
  const base = `${title || 'property'} ${locality || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await get('SELECT id FROM properties WHERE slug = ?', [slug]);
    if (!existing || (currentId && existing.id === currentId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

// =========================================================================
// PROPERTIES CRUD
// =========================================================================

/**
 * Get all owner properties from database (supports search, filters, sorting, and pagination)
 */
export async function getOwnerProperties(options = {}) {
  let sql = 'SELECT * FROM properties WHERE 1=1';
  const params = [];

  if (options.status && options.status !== 'all') {
    sql += ' AND status = ?';
    params.push(options.status);
  }

  if (options.locality && options.locality !== 'all') {
    sql += ' AND LOWER(locality) = LOWER(?)';
    params.push(options.locality);
  }

  if (options.category && options.category !== 'all') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(options.category);
  }

  if (options.transactionType && options.transactionType !== 'all') {
    sql += ' AND LOWER(transaction_type) = LOWER(?)';
    params.push(options.transactionType);
  }

  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(address) LIKE ? OR LOWER(locality) LIKE ? OR LOWER(description) LIKE ?)';
    params.push(term, term, term, term);
  }

  // Sorting
  switch (options.sort) {
    case 'oldest':
      sql += ' ORDER BY created_at ASC';
      break;
    case 'price-asc':
      sql += ' ORDER BY price_number ASC NULLS LAST';
      break;
    case 'price-desc':
      sql += ' ORDER BY price_number DESC NULLS LAST';
      break;
    case 'title':
      sql += ' ORDER BY title ASC';
      break;
    case 'newest':
    default:
      sql += ' ORDER BY created_at DESC';
      break;
  }

  if (options.limit && Number(options.limit) > 0) {
    sql += ' LIMIT ?';
    params.push(Number(options.limit));
    if (options.offset && Number(options.offset) >= 0) {
      sql += ' OFFSET ?';
      params.push(Number(options.offset));
    }
  }

  const rows = await query(sql, params);
  return rows.map(mapRowToProperty);
}

/**
 * Get public properties (strictly published, non-archived, internal notes stripped)
 */
export async function getPublicProperties(sampleDemoProperties = []) {
  const settings = await getSettings();
  let sql = 'SELECT * FROM properties WHERE status = ?';
  const params = ['published'];

  if (!settings.showDemoInventory) {
    sql += ' AND is_demo = 0';
  }

  sql += ' ORDER BY featured DESC, created_at DESC';

  const rows = await query(sql, params);
  const properties = rows
    .map(mapRowToProperty)
    .filter((prop) => !prop.isOutsideCorridor) // Strictly enforce 7-station corridor for public view
    .map((prop) => {
      // Strip private internal notes
      delete prop.internalNotes;
      return prop;
    });

  return properties;
}

/**
 * Find property by slug or ID
 */
export async function findProperty(slugOrId, isOwner = false) {
  if (!slugOrId) return null;

  const row = await get(
    'SELECT * FROM properties WHERE slug = ? OR id = ?',
    [slugOrId, slugOrId]
  );

  if (!row) return null;

  // If not owner, strictly enforce published status and strip notes
  if (!isOwner) {
    if (row.status !== 'published') return null;
    const prop = mapRowToProperty(row);
    if (prop.isOutsideCorridor) return null; // Out of corridor: exclude from public view
    delete prop.internalNotes;
    return prop;
  }

  return mapRowToProperty(row);
}

export const DEFAULT_MAX_PROPERTY_LISTINGS = 100;
let overrideMaxListingsForTest = null;

export function setMaxPropertyListingsForTesting(limit) {
  overrideMaxListingsForTest = limit;
}

/**
 * Get configured maximum allowed active property listings
 */
export function getMaxPropertyListings() {
  if (overrideMaxListingsForTest !== null && overrideMaxListingsForTest !== undefined) {
    return overrideMaxListingsForTest;
  }
  const envVal = process.env.MAX_PROPERTY_LISTINGS;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_MAX_PROPERTY_LISTINGS;
}

/**
 * Calculate active, draft, published, archived listing counts and capacity status
 */
export async function getListingCapacity() {
  const row = await get(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
      SUM(CASE WHEN status != 'archived' AND status != 'deleted' THEN 1 ELSE 0 END) as active
    FROM properties
  `);

  const total = Number(row?.total || 0);
  const published = Number(row?.published || 0);
  const draft = Number(row?.draft || 0);
  const archived = Number(row?.archived || 0);
  const active = Number(row?.active || 0);
  const maxLimit = getMaxPropertyListings();

  return {
    total,
    published,
    draft,
    archived,
    active,
    maxLimit,
    remaining: Math.max(0, maxLimit - active),
    isAtLimit: active >= maxLimit,
  };
}

/**
 * Validate property creation and update payloads
 */
export function validatePropertyPayload(data, isUpdate = false) {
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      const err = new Error('Property title is required');
      err.statusCode = 400;
      err.field = 'title';
      throw err;
    }
    if (data.title.trim().length < 3 || data.title.trim().length > 255) {
      const err = new Error('Property title must be between 3 and 255 characters');
      err.statusCode = 400;
      err.field = 'title';
      throw err;
    }
  }

  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string') {
      const err = new Error('Property category is required');
      err.statusCode = 400;
      err.field = 'category';
      throw err;
    }
  }

  if (!isUpdate || data.transactionType !== undefined || data.transaction_type !== undefined) {
    const tx = data.transactionType || data.transaction_type;
    if (!tx || typeof tx !== 'string') {
      const err = new Error('Transaction type is required');
      err.statusCode = 400;
      err.field = 'transactionType';
      throw err;
    }
  }

  if (!isUpdate || data.locality !== undefined) {
    if (!data.locality || typeof data.locality !== 'string') {
      const err = new Error('Main location/station is required');
      err.statusCode = 400;
      err.field = 'locality';
      throw err;
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['published', 'draft', 'archived', 'sold', 'rented', 'unavailable'];
    if (!validStatuses.includes(data.status)) {
      const err = new Error(`Invalid status "${data.status}". Supported: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      err.field = 'status';
      throw err;
    }
  }

  if (data.bedrooms !== undefined && data.bedrooms !== null && data.bedrooms !== 'none' && data.bedrooms !== '') {
    const b = Number(data.bedrooms);
    if (isNaN(b) || b < 0 || b > 20) {
      const err = new Error('Bedrooms must be a valid number between 0 and 20');
      err.statusCode = 400;
      err.field = 'bedrooms';
      throw err;
    }
  }

  if (data.bathrooms !== undefined && data.bathrooms !== null && data.bathrooms !== 'none' && data.bathrooms !== '') {
    const b = Number(data.bathrooms);
    if (isNaN(b) || b < 0 || b > 20) {
      const err = new Error('Bathrooms must be a valid number between 0 and 20');
      err.statusCode = 400;
      err.field = 'bathrooms';
      throw err;
    }
  }

  if (data.areaSqFt !== undefined && data.areaSqFt !== null && data.areaSqFt !== '') {
    const a = Number(data.areaSqFt);
    if (isNaN(a) || a < 0) {
      const err = new Error('Area must be a non-negative number');
      err.statusCode = 400;
      err.field = 'areaSqFt';
      throw err;
    }
  }

  if (data.priceNumber !== undefined && data.priceNumber !== null && data.priceNumber !== '') {
    const p = Number(data.priceNumber);
    if (isNaN(p) || p < 0) {
      const err = new Error('Numeric price must be non-negative');
      err.statusCode = 400;
      err.field = 'priceNumber';
      throw err;
    }
  }
}

/**
 * Create a new property listing (Owner Only)
 */
export async function createProperty(propertyData) {
  validatePropertyPayload(propertyData, false);

  // Enforce configurable property listing limit atomically
  const capacity = await getListingCapacity();
  if (capacity.isAtLimit) {
    const limitErr = new Error(
      `Property listing limit reached (${capacity.active}/${capacity.maxLimit} active listings). Please archive or remove older listings before adding new properties, or adjust MAX_PROPERTY_LISTINGS in your environment configuration.`
    );
    limitErr.code = 'PROPERTY_LIMIT_REACHED';
    limitErr.statusCode = 409;
    limitErr.capacity = capacity;
    throw limitErr;
  }

  const id = propertyData.id || `te-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = propertyData.slug
    ? await generateSlug(propertyData.slug, propertyData.locality)
    : await generateSlug(propertyData.title, propertyData.locality);

  const status = propertyData.status || 'draft';
  const now = new Date().toISOString();

  const gallery = Array.isArray(propertyData.gallery) && propertyData.gallery.length > 0
    ? propertyData.gallery
    : [propertyData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const features = Array.isArray(propertyData.features) ? propertyData.features : [];

  const priceNum = propertyData.priceNumber !== undefined && propertyData.priceNumber !== null && propertyData.priceNumber !== ''
    ? Number(propertyData.priceNumber)
    : null;

  const areaSqFt = propertyData.areaSqFt !== undefined && propertyData.areaSqFt !== null && propertyData.areaSqFt !== ''
    ? Number(propertyData.areaSqFt)
    : null;

  const bedrooms = propertyData.bedrooms !== undefined && propertyData.bedrooms !== null && propertyData.bedrooms !== 'none' && propertyData.bedrooms !== ''
    ? Number(propertyData.bedrooms)
    : null;

  const bathrooms = propertyData.bathrooms !== undefined && propertyData.bathrooms !== null && propertyData.bathrooms !== ''
    ? Number(propertyData.bathrooms)
    : null;

  const sql = `
    INSERT INTO properties (
      id, slug, title, category, transaction_type, locality, sub_location, address,
      price, price_display, price_per_sqft, price_number, monthly_rent, deposit_amount,
      lease_term, area_sqft, area_display, area_unit, bedrooms, bathrooms, furnishing,
      possession_status, image, gallery, features, description, status, featured,
      is_demo, is_verified, internal_notes, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `;

  const params = [
    id,
    slug,
    propertyData.title.trim(),
    propertyData.category,
    propertyData.transactionType || propertyData.transaction_type,
    propertyData.locality,
    propertyData.subLocation || propertyData.locality,
    propertyData.address || '',
    propertyData.price || '',
    propertyData.priceDisplay || propertyData.price || 'Price on Request',
    propertyData.pricePerSqft || null,
    priceNum,
    propertyData.monthlyRent || null,
    propertyData.depositAmount || null,
    propertyData.leaseTerm || null,
    areaSqFt,
    propertyData.areaDisplay || (areaSqFt ? `${areaSqFt} ${propertyData.areaUnit || 'sq.ft'}` : null),
    propertyData.areaUnit || 'sq.ft',
    bedrooms,
    bathrooms,
    propertyData.furnishing || null,
    propertyData.possessionStatus || 'Ready to Move',
    propertyData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify(gallery),
    JSON.stringify(features),
    propertyData.description || '',
    status,
    propertyData.featured ? 1 : 0,
    0, // Genuine owner listing (not demo)
    propertyData.isVerified ? 1 : 0,
    propertyData.internalNotes || '',
    now,
    now,
  ];

  await run(sql, params);
  return findProperty(id, true);
}

/**
 * Update an existing property (Owner Only)
 */
export async function updateProperty(id, updateData) {
  const current = await findProperty(id, true);
  if (!current) {
    const err = new Error(`Property with ID "${id}" not found`);
    err.statusCode = 404;
    throw err;
  }

  validatePropertyPayload(updateData, true);

  // If un-archiving an archived property, check active listing capacity limit
  if (current.status === 'archived' && updateData.status && updateData.status !== 'archived') {
    const capacity = await getListingCapacity();
    if (capacity.isAtLimit) {
      const limitErr = new Error(
        `Cannot un-archive property: Listing limit reached (${capacity.active}/${capacity.maxLimit} active listings). Please archive another property first or raise MAX_PROPERTY_LISTINGS.`
      );
      limitErr.code = 'PROPERTY_LIMIT_REACHED';
      limitErr.statusCode = 409;
      limitErr.capacity = capacity;
      throw limitErr;
    }
  }

  let slug = current.slug;
  if (updateData.title && updateData.title !== current.title) {
    slug = await generateSlug(updateData.title, updateData.locality || current.locality, id);
  } else if (updateData.slug && updateData.slug !== current.slug) {
    slug = await generateSlug(updateData.slug, updateData.locality || current.locality, id);
  }

  const title = updateData.title !== undefined ? updateData.title.trim() : current.title;
  const category = updateData.category !== undefined ? updateData.category : current.category;
  const transactionType = updateData.transactionType || updateData.transaction_type || current.transactionType;
  const locality = updateData.locality !== undefined ? updateData.locality : current.locality;
  const subLocation = updateData.subLocation !== undefined ? updateData.subLocation : current.subLocation;
  const address = updateData.address !== undefined ? updateData.address : current.address;
  const price = updateData.price !== undefined ? updateData.price : current.price;
  const priceDisplay = updateData.priceDisplay !== undefined ? updateData.priceDisplay : current.priceDisplay;
  const pricePerSqft = updateData.pricePerSqft !== undefined ? updateData.pricePerSqft : current.pricePerSqft;
  const priceNumber = updateData.priceNumber !== undefined ? (updateData.priceNumber ? Number(updateData.priceNumber) : null) : current.priceNumber;
  const monthlyRent = updateData.monthlyRent !== undefined ? updateData.monthlyRent : current.monthlyRent;
  const depositAmount = updateData.depositAmount !== undefined ? updateData.depositAmount : current.depositAmount;
  const leaseTerm = updateData.leaseTerm !== undefined ? updateData.leaseTerm : current.leaseTerm;
  const areaSqFt = updateData.areaSqFt !== undefined ? (updateData.areaSqFt ? Number(updateData.areaSqFt) : null) : current.areaSqFt;
  const areaDisplay = updateData.areaDisplay !== undefined ? updateData.areaDisplay : current.areaDisplay;
  const areaUnit = updateData.areaUnit !== undefined ? updateData.areaUnit : current.areaUnit;
  const bedrooms = updateData.bedrooms !== undefined ? (updateData.bedrooms === 'none' || updateData.bedrooms === null ? null : Number(updateData.bedrooms)) : current.bedrooms;
  const bathrooms = updateData.bathrooms !== undefined ? (updateData.bathrooms ? Number(updateData.bathrooms) : null) : current.bathrooms;
  const furnishing = updateData.furnishing !== undefined ? updateData.furnishing : current.furnishing;
  const possessionStatus = updateData.possessionStatus !== undefined ? updateData.possessionStatus : current.possessionStatus;
  const image = updateData.image !== undefined ? updateData.image : current.image;
  const gallery = updateData.gallery !== undefined ? JSON.stringify(updateData.gallery) : JSON.stringify(current.gallery);
  const features = updateData.features !== undefined ? JSON.stringify(updateData.features) : JSON.stringify(current.features);
  const description = updateData.description !== undefined ? updateData.description : current.description;
  const status = updateData.status !== undefined ? updateData.status : current.status;
  const featured = updateData.featured !== undefined ? (updateData.featured ? 1 : 0) : (current.featured ? 1 : 0);
  const isVerified = updateData.isVerified !== undefined ? (updateData.isVerified ? 1 : 0) : (current.isVerified ? 1 : 0);
  const internalNotes = updateData.internalNotes !== undefined ? updateData.internalNotes : current.internalNotes;
  const now = new Date().toISOString();

  const sql = `
    UPDATE properties SET
      slug = ?, title = ?, category = ?, transaction_type = ?, locality = ?,
      sub_location = ?, address = ?, price = ?, price_display = ?, price_per_sqft = ?,
      price_number = ?, monthly_rent = ?, deposit_amount = ?, lease_term = ?,
      area_sqft = ?, area_display = ?, area_unit = ?, bedrooms = ?, bathrooms = ?,
      furnishing = ?, possession_status = ?, image = ?, gallery = ?, features = ?,
      description = ?, status = ?, featured = ?, is_verified = ?, internal_notes = ?,
      updated_at = ?
    WHERE id = ?
  `;

  const params = [
    slug, title, category, transactionType, locality,
    subLocation, address, price, priceDisplay, pricePerSqft,
    priceNumber, monthlyRent, depositAmount, leaseTerm,
    areaSqFt, areaDisplay, areaUnit, bedrooms, bathrooms,
    furnishing, possessionStatus, image, gallery, features,
    description, status, featured, isVerified, internalNotes,
    now, id,
  ];

  await run(sql, params);
  return findProperty(id, true);
}

/**
 * Delete a property (Owner Only)
 */
export async function deleteProperty(id) {
  const existing = await findProperty(id, true);
  if (!existing) return false;

  const res = await run('DELETE FROM properties WHERE id = ?', [id]);
  return res.changes > 0;
}

// =========================================================================
// ENQUIRIES CRUD
// =========================================================================

/**
 * Save a visitor property enquiry
 */
export async function recordEnquiry(enquiryData) {
  if (!enquiryData.name || !enquiryData.name.trim()) {
    throw new Error('Full name is required');
  }
  if (!enquiryData.phone || !enquiryData.phone.trim()) {
    throw new Error('Mobile number is required');
  }

  const id = `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const sql = `
    INSERT INTO enquiries (
      id, name, phone, email, property_id, property_title, property_location,
      requirement, property_type, area, expected_price, message, status,
      submitted_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `;

  const params = [
    id,
    enquiryData.name.trim(),
    enquiryData.phone.trim(),
    enquiryData.email ? enquiryData.email.trim() : null,
    enquiryData.propertyId || null,
    enquiryData.propertyTitle || 'General Enquiry',
    enquiryData.propertyLocation || null,
    enquiryData.requirement || null,
    enquiryData.propertyType || null,
    enquiryData.area || null,
    enquiryData.expectedPrice || null,
    enquiryData.message ? enquiryData.message.trim() : null,
    'new',
    now,
    now,
  ];

  await run(sql, params);
  return { id, status: 'new', submittedAt: now };
}

/**
 * Get all enquiries (Owner Only)
 */
export async function getEnquiries() {
  const rows = await query('SELECT * FROM enquiries ORDER BY submitted_at DESC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || '',
    propertyId: r.property_id,
    propertyTitle: r.property_title,
    propertyLocation: r.property_location || '',
    requirement: r.requirement || '',
    propertyType: r.property_type || '',
    area: r.area || '',
    expectedPrice: r.expected_price || '',
    message: r.message || '',
    status: r.status,
    submittedAt: r.submitted_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Update enquiry status (Owner Only)
 */
export async function updateEnquiryStatus(id, status) {
  const now = new Date().toISOString();
  const res = await run(
    'UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, id]
  );
  return res.changes > 0;
}

// =========================================================================
// WEBSITE SETTINGS
// =========================================================================

export async function getSettings() {
  const row = await get('SELECT value FROM website_settings WHERE key = ?', ['global']);
  if (!row || !row.value) {
    return {
      showDemoInventory: true,
      businessName: 'Tomar Enterprises',
    };
  }
  try {
    return JSON.parse(row.value);
  } catch {
    return { showDemoInventory: true, businessName: 'Tomar Enterprises' };
  }
}

export async function updateSettings(newSettings) {
  const current = await getSettings();
  const updated = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };

  await run(
    'INSERT INTO website_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    ['global', JSON.stringify(updated), new Date().toISOString()]
  );

  return updated;
}
