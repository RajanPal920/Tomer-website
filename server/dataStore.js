// Server-Side Data Storage & Persistence for Tomar Enterprises
// Manages owner-created properties, enquiries, and website settings on disk.
// Enforces security boundaries: public requests never see drafts or internal notes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'owner_properties.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'owner_settings.json');

// Ensure files exist
function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROPERTIES_FILE)) {
    fs.writeFileSync(PROPERTIES_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(ENQUIRIES_FILE)) {
    fs.writeFileSync(ENQUIRIES_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      showDemoInventory: true,
      businessName: 'TOMAR ENTERPRISES',
      businessType: 'Real Estate Agency',
      contactPhone: '+91 82370 92224',
      contactPhoneAlt: '+91 99703 55543',
      contactPhoneShlok: '+91 93566 20596',
      contactEmail: 'Sanjaykumartomar4@gmail.com',
      officeAddress: 'Shop No. 06, Nakshatra Apartment, Viva Jangid Complex, Manvelpada, Virar East, Palghar - 401305, Maharashtra, India.',
      serviceCorridor: 'Vasai Road – Nalasopara – Virar – Vaitarna – Saphale – Kelve Road – Palghar',
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
  }
}

ensureFiles();

function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`[DATA] Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`[DATA] Error writing ${filePath}:`, err);
    return false;
  }
}

/**
 * Generate a clean, SEO-friendly slug
 */
export function generateSlug(title, locality, existingSlugs = []) {
  const base = `${title || 'property'} ${locality || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let slug = base;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// =========================================================================
// PROPERTIES CRUD
// =========================================================================

/**
 * Get all owner properties from disk
 */
export function getOwnerProperties() {
  return readJsonFile(PROPERTIES_FILE, []);
}

/**
 * Get public properties (strictly published, non-archived, internal notes stripped)
 */
export function getPublicProperties(sampleDemoProperties = []) {
  const ownerProps = getOwnerProperties();
  const settings = getSettings();

  const activeOwnerProps = ownerProps
    .filter((p) => p.status === 'published')
    .map((p) => {
      // Strip private internal notes from public payload
      const { internalNotes, ...safePublicProp } = p;
      return safePublicProp;
    });

  // If demo inventory is enabled, include demo properties flagged as isDemo: true
  if (settings.showDemoInventory && Array.isArray(sampleDemoProperties)) {
    return [...activeOwnerProps, ...sampleDemoProperties];
  }

  return activeOwnerProps;
}

/**
 * Find property by slug or ID
 */
export function findProperty(slugOrId, isOwner = false, sampleDemoProperties = []) {
  const ownerProps = getOwnerProperties();
  let prop = ownerProps.find((p) => p.slug === slugOrId || p.id === slugOrId);

  if (!prop && Array.isArray(sampleDemoProperties)) {
    prop = sampleDemoProperties.find((p) => p.slug === slugOrId || p.id === slugOrId);
  }

  if (!prop) return null;

  // If not owner, only return if published
  if (!isOwner) {
    if (prop.status && prop.status !== 'published') return null;
    const { internalNotes, ...safePublicProp } = prop;
    return safePublicProp;
  }

  return prop;
}

/**
 * Create a new property listing (Owner Only)
 */
export function createProperty(propertyData) {
  if (!propertyData.title || !propertyData.title.trim()) {
    throw new Error('Property title is required');
  }
  if (!propertyData.category) {
    throw new Error('Property category is required');
  }
  if (!propertyData.transactionType) {
    throw new Error('Transaction type is required');
  }
  if (!propertyData.locality) {
    throw new Error('Main location/station is required');
  }

  const props = getOwnerProperties();
  const existingSlugs = props.map((p) => p.slug);

  const id = propertyData.id || `te-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = propertyData.slug && !existingSlugs.includes(propertyData.slug)
    ? propertyData.slug
    : generateSlug(propertyData.title, propertyData.locality, existingSlugs);

  const status = propertyData.status || 'draft'; // Default to draft if unspecified

  const newProperty = {
    id,
    slug,
    title: propertyData.title.trim(),
    category: propertyData.category,
    transactionType: propertyData.transactionType,
    locality: propertyData.locality,
    subLocation: propertyData.subLocation || propertyData.locality,
    address: propertyData.address || '',
    price: propertyData.price || '',
    priceDisplay: propertyData.priceDisplay || propertyData.price || 'Price on Request',
    pricePerSqft: propertyData.pricePerSqft || null,
    priceNumber: propertyData.priceNumber ? Number(propertyData.priceNumber) : null,
    monthlyRent: propertyData.monthlyRent || null,
    depositAmount: propertyData.depositAmount || null,
    leaseTerm: propertyData.leaseTerm || null,
    areaSqFt: propertyData.areaSqFt ? Number(propertyData.areaSqFt) : null,
    areaDisplay: propertyData.areaDisplay || (propertyData.areaSqFt ? `${propertyData.areaSqFt} ${propertyData.areaUnit || 'sq.ft'}` : null),
    areaUnit: propertyData.areaUnit || 'sq.ft',
    bedrooms: propertyData.bedrooms ? (propertyData.bedrooms === 'none' ? null : Number(propertyData.bedrooms)) : null,
    bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
    furnishing: propertyData.furnishing || null,
    possessionStatus: propertyData.possessionStatus || 'Ready to Move',
    image: propertyData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    gallery: Array.isArray(propertyData.gallery) && propertyData.gallery.length > 0 ? propertyData.gallery : [propertyData.image],
    features: Array.isArray(propertyData.features) ? propertyData.features : [],
    description: propertyData.description || '',
    status, // draft | published | unavailable | sold | rented | archived
    featured: Boolean(propertyData.featured),
    isDemo: false, // Genuine owner listing
    isVerified: Boolean(propertyData.isVerified),
    internalNotes: propertyData.internalNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  props.unshift(newProperty);
  writeJsonFile(PROPERTIES_FILE, props);
  return newProperty;
}

/**
 * Update an existing property (Owner Only)
 */
export function updateProperty(id, updateData) {
  const props = getOwnerProperties();
  const index = props.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Property with ID "${id}" not found`);
  }

  const current = props[index];
  const updatedProps = [...props];

  // Update slug if title or locality changed
  let slug = current.slug;
  if (updateData.title && updateData.title !== current.title) {
    const existingSlugs = props.filter((p) => p.id !== id).map((p) => p.slug);
    slug = generateSlug(updateData.title, updateData.locality || current.locality, existingSlugs);
  }

  const updated = {
    ...current,
    ...updateData,
    id: current.id, // Immutable ID
    slug,
    isDemo: current.isDemo ?? false,
    updatedAt: new Date().toISOString(),
  };

  updatedProps[index] = updated;
  writeJsonFile(PROPERTIES_FILE, updatedProps);
  return updated;
}

/**
 * Delete a property (Owner Only)
 */
export function deleteProperty(id) {
  const props = getOwnerProperties();
  const filtered = props.filter((p) => p.id !== id);

  if (filtered.length === props.length) {
    return false;
  }

  writeJsonFile(PROPERTIES_FILE, filtered);
  return true;
}

// =========================================================================
// ENQUIRIES CRUD
// =========================================================================

/**
 * Save a visitor property enquiry
 */
export function recordEnquiry(enquiryData) {
  if (!enquiryData.name || !enquiryData.name.trim()) {
    throw new Error('Full name is required');
  }
  if (!enquiryData.phone || !enquiryData.phone.trim()) {
    throw new Error('Mobile number is required');
  }

  const enquiries = readJsonFile(ENQUIRIES_FILE, []);
  const newEnquiry = {
    id: `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: enquiryData.name.trim(),
    phone: enquiryData.phone.trim(),
    email: enquiryData.email ? enquiryData.email.trim() : '',
    propertyId: enquiryData.propertyId || null,
    propertyTitle: enquiryData.propertyTitle || 'General Enquiry',
    propertyLocation: enquiryData.propertyLocation || '',
    requirement: enquiryData.requirement || '',
    propertyType: enquiryData.propertyType || '',
    area: enquiryData.area || '',
    expectedPrice: enquiryData.expectedPrice || '',
    message: enquiryData.message ? enquiryData.message.trim() : '',
    submittedAt: new Date().toISOString(),
    status: 'new', // new | reviewed | contacted | closed
  };

  enquiries.unshift(newEnquiry);
  writeJsonFile(ENQUIRIES_FILE, enquiries);
  return newEnquiry;
}

/**
 * Get all enquiries (Owner Only)
 */
export function getEnquiries() {
  return readJsonFile(ENQUIRIES_FILE, []);
}

/**
 * Update enquiry status (Owner Only)
 */
export function updateEnquiryStatus(id, status) {
  const enquiries = getEnquiries();
  const index = enquiries.findIndex((e) => e.id === id);
  if (index === -1) return false;

  enquiries[index].status = status;
  enquiries[index].updatedAt = new Date().toISOString();
  return writeJsonFile(ENQUIRIES_FILE, enquiries);
}

// =========================================================================
// SETTINGS
// =========================================================================

export function getSettings() {
  return readJsonFile(SETTINGS_FILE, {
    showDemoInventory: true,
    businessName: 'Tomar Enterprises',
  });
}

export function updateSettings(newSettings) {
  const current = getSettings();
  const updated = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile(SETTINGS_FILE, updated);
  return updated;
}
