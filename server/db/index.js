// Unified Persistent Relational Database Layer for Tomar Enterprises
// Engine:
//   - Local Development / File Database: SQLite (sql.js WASM engine) persisted atomically to server/data/tomar.db
//   - Production Deployment: PostgreSQL (pg connection pool) when DATABASE_URL is set
// Zero reliance on temporary JSON files, localStorage, or in-memory arrays as source of truth.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

try {
  if (!fs.existsSync(DATA_DIR) && !isServerless) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Read-only filesystem in serverless environments
  console.warn('[DB] Notice: Could not create DATA_DIR:', err.message);
}

/**
 * Resolve effective SQLite path across local and serverless environments
 */
export function getEffectiveSqlitePath() {
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }
  // On Vercel / AWS Lambda, the deployment directory (/var/task) is read-only.
  // /tmp is the only writable directory.
  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'tomar.db');
    const candidatePaths = [
      path.join(process.cwd(), 'server', 'data', 'tomar.db'),
      path.join(DATA_DIR, 'tomar.db'),
      path.join(process.cwd(), 'data', 'tomar.db'),
      path.resolve(__dirname, '..', 'data', 'tomar.db'),
      path.resolve(__dirname, '..', 'server', 'data', 'tomar.db'),
    ];
    const bundledPath = candidatePaths.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });

    if (bundledPath) {
      let shouldCopy = false;
      if (!fs.existsSync(tmpDbPath)) {
        shouldCopy = true;
      } else {
        try {
          const bundledStat = fs.statSync(bundledPath);
          const tmpStat = fs.statSync(tmpDbPath);
          if (bundledStat.mtimeMs > tmpStat.mtimeMs || bundledStat.size !== tmpStat.size) {
            shouldCopy = true;
          }
        } catch {
          shouldCopy = true;
        }
      }

      if (shouldCopy) {
        try {
          fs.copyFileSync(bundledPath, tmpDbPath);
          console.log(`[DB] Copied bundled database to serverless storage: ${tmpDbPath} from ${bundledPath}`);
        } catch (copyErr) {
          console.warn('[DB] Could not copy bundled DB to /tmp:', copyErr.message);
        }
      }
    }
    return tmpDbPath;
  }
  return path.join(DATA_DIR, 'tomar.db');
}

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = Boolean(DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://')));

let SQL = null;
let sqliteDb = null;
let pgPool = null;
let isInitialized = false;
let lastLoadedMtime = 0;

/**
 * Initialize Database Connection
 */
export async function initDatabase() {
  if (isPostgres) {
    if (!pgPool) {
      pgPool = new pg.Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' && !DATABASE_URL.includes('localhost')
          ? { rejectUnauthorized: false }
          : false,
        max: 10,
        idleTimeoutMillis: 30000,
      });
      console.log('[DB] Connected to PostgreSQL database pool.');
    }
    isInitialized = true;
    return { type: 'postgres', pool: pgPool };
  }

  // SQLite Engine (sql.js)
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => {
        const defaultPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
        if (fs.existsSync(defaultPath)) return defaultPath;
        return file;
      },
    });
  }

  const activeDbPath = getEffectiveSqlitePath();

  if (fs.existsSync(activeDbPath)) {
    const stat = fs.statSync(activeDbPath);
    if (!sqliteDb || stat.mtimeMs > lastLoadedMtime) {
      try {
        const fileBuffer = fs.readFileSync(activeDbPath);
        sqliteDb = new SQL.Database(fileBuffer);
        lastLoadedMtime = stat.mtimeMs;
        console.log(`[DB] Loaded persistent SQLite database from ${activeDbPath} (${fileBuffer.length} bytes)`);
      } catch (err) {
        console.error('[DB] Warning loading existing sqlite db, creating fresh:', err);
        sqliteDb = new SQL.Database();
      }
    }
  } else if (!sqliteDb) {
    const bundledPath = path.join(DATA_DIR, 'tomar.db');
    if (fs.existsSync(bundledPath)) {
      try {
        const fileBuffer = fs.readFileSync(bundledPath);
        sqliteDb = new SQL.Database(fileBuffer);
        console.log(`[DB] Loaded bundled SQLite database from ${bundledPath} (${fileBuffer.length} bytes)`);
      } catch {
        sqliteDb = new SQL.Database();
      }
    } else {
      sqliteDb = new SQL.Database();
      console.log(`[DB] Created new SQLite database in memory`);
    }
    saveSqliteToDisk();
  }

  isInitialized = true;
  return { type: 'sqlite', db: sqliteDb };
}

/**
 * Persist SQLite memory database to disk atomically
 */
function saveSqliteToDisk() {
  if (!sqliteDb) return;
  const activeDbPath = getEffectiveSqlitePath();
  try {
    const data = sqliteDb.export();
    const tempPath = `${activeDbPath}.tmp`;
    fs.writeFileSync(tempPath, Buffer.from(data));
    fs.renameSync(tempPath, activeDbPath);
    if (fs.existsSync(activeDbPath)) {
      lastLoadedMtime = fs.statSync(activeDbPath).mtimeMs;
    }
  } catch (err) {
    console.warn('[DB WARNING] Could not persist SQLite to disk (read-only filesystem or ephemeral):', err.message);
    if (!isServerless) {
      throw err;
    }
  }
}

// =========================================================================
// QUERY EXECUTION INTERFACE (Cross-DB Compatible)
// =========================================================================

/**
 * Execute a query that returns multiple rows
 */
export async function query(sql, params = []) {
  await initDatabase();
  const cleanParams = params.map((p) => (p === undefined ? null : p));

  if (isPostgres) {
    let pIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
    const res = await pgPool.query(pgSql, cleanParams);
    return res.rows;
  }

  // Reload SQLite from disk if another process updated it
  const activeDbPath = getEffectiveSqlitePath();
  if (fs.existsSync(activeDbPath)) {
    const stat = fs.statSync(activeDbPath);
    if (stat.mtimeMs > lastLoadedMtime) {
      const fileBuffer = fs.readFileSync(activeDbPath);
      sqliteDb = new SQL.Database(fileBuffer);
      lastLoadedMtime = stat.mtimeMs;
    }
  }

  // SQLite sql.js
  const stmt = sqliteDb.prepare(sql);
  stmt.bind(cleanParams);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a query that returns a single row
 */
export async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT / UPDATE / DELETE query
 */
export async function run(sql, params = []) {
  await initDatabase();
  const cleanParams = params.map((p) => (p === undefined ? null : p));

  if (isPostgres) {
    let pIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIdx++}`);
    const res = await pgPool.query(pgSql, cleanParams);
    return { changes: res.rowCount };
  }

  // SQLite sql.js
  sqliteDb.run(sql, cleanParams);
  const changes = sqliteDb.getRowsModified();
  saveSqliteToDisk();
  return { changes };
}

/**
 * Check database health
 */
export async function checkHealth() {
  try {
    await initDatabase();
    if (isPostgres) {
      const res = await pgPool.query('SELECT 1 as ok');
      return { status: 'ok', type: 'postgres', ok: res.rows[0]?.ok === 1 };
    }
    const activeDbPath = getEffectiveSqlitePath();
    const row = await get('SELECT 1 as ok');
    return { status: 'ok', type: 'sqlite', ok: row?.ok === 1, path: activeDbPath };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

// =========================================================================
// SCHEMA MIGRATION & BOOTSTRAP
// =========================================================================

export async function runMigrations() {
  await initDatabase();

  if (isPostgres) {
    await runPostgresMigrations();
  } else {
    runSqliteMigrations();
  }

  // Seed default data if needed
  await seedInitialDataIfNeeded();
}

function runSqliteMigrations() {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS owner_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_initial_password INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS owner_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES owner_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      locality TEXT NOT NULL,
      sub_location TEXT,
      address TEXT,
      price TEXT,
      price_display TEXT,
      price_per_sqft TEXT,
      price_number REAL,
      monthly_rent TEXT,
      deposit_amount TEXT,
      lease_term TEXT,
      area_sqft REAL,
      area_display TEXT,
      area_unit TEXT DEFAULT 'sq.ft',
      bedrooms INTEGER,
      bathrooms INTEGER,
      furnishing TEXT,
      possession_status TEXT DEFAULT 'Ready to Move',
      image TEXT NOT NULL,
      gallery TEXT NOT NULL,
      features TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      featured INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 0,
      is_verified INTEGER NOT NULL DEFAULT 0,
      internal_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);
    CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
    CREATE INDEX IF NOT EXISTS idx_properties_tx ON properties(transaction_type);

    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      property_id TEXT,
      property_title TEXT,
      property_location TEXT,
      requirement TEXT,
      property_type TEXT,
      area TEXT,
      expected_price TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      submitted_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_submitted ON enquiries(submitted_at);

    CREATE TABLE IF NOT EXISTS website_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 1,
      first_attempt_at INTEGER NOT NULL,
      last_attempt_at INTEGER NOT NULL,
      locked_until INTEGER NOT NULL DEFAULT 0
    );
  `);
  saveSqliteToDisk();
}

async function runPostgresMigrations() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS owner_users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'owner',
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      is_initial_password BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS owner_sessions (
      token VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES owner_users(id) ON DELETE CASCADE,
      username VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      ip_address VARCHAR(100),
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS properties (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      transaction_type VARCHAR(100) NOT NULL,
      locality VARCHAR(100) NOT NULL,
      sub_location VARCHAR(255),
      address TEXT,
      price VARCHAR(100),
      price_display VARCHAR(100),
      price_per_sqft VARCHAR(100),
      price_number NUMERIC,
      monthly_rent VARCHAR(100),
      deposit_amount VARCHAR(100),
      lease_term VARCHAR(100),
      area_sqft NUMERIC,
      area_display VARCHAR(100),
      area_unit VARCHAR(50) DEFAULT 'sq.ft',
      bedrooms INT,
      bathrooms INT,
      furnishing VARCHAR(100),
      possession_status VARCHAR(100) DEFAULT 'Ready to Move',
      image TEXT NOT NULL,
      gallery TEXT NOT NULL,
      features TEXT NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_demo BOOLEAN NOT NULL DEFAULT FALSE,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      internal_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);
    CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
    CREATE INDEX IF NOT EXISTS idx_properties_tx ON properties(transaction_type);

    CREATE TABLE IF NOT EXISTS enquiries (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(150),
      property_id VARCHAR(64),
      property_title VARCHAR(255),
      property_location VARCHAR(150),
      requirement VARCHAR(100),
      property_type VARCHAR(100),
      area VARCHAR(100),
      expected_price VARCHAR(100),
      message TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      submitted_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_rate_limits (
      key VARCHAR(150) PRIMARY KEY,
      attempts INT NOT NULL DEFAULT 1,
      first_attempt_at BIGINT NOT NULL,
      last_attempt_at BIGINT NOT NULL,
      locked_until BIGINT NOT NULL DEFAULT 0
    );
  `);
}

// =========================================================================
// SEEDING AND MIGRATION OF EXISTING ASSETS
// =========================================================================

async function seedInitialDataIfNeeded() {
  // 1. Settings
  const existingSettings = await get('SELECT value FROM website_settings WHERE key = ?', ['global']);
  if (!existingSettings) {
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
    await run(
      'INSERT INTO website_settings (key, value, updated_at) VALUES (?, ?, ?)',
      ['global', JSON.stringify(defaultSettings), new Date().toISOString()]
    );
  }

  // 2. Existing JSON properties & Catalog properties
  const propCountRow = await get('SELECT COUNT(*) as count FROM properties');
  const count = Number(propCountRow?.count || 0);

  if (count === 0) {
    console.log('[DB SEED] Properties table empty. Migrating existing listings & catalog into database...');

    // A: Check server/data/owner_properties.json
    const jsonFile = path.join(DATA_DIR, 'owner_properties.json');
    if (fs.existsSync(jsonFile)) {
      try {
        const rawJson = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        if (Array.isArray(rawJson) && rawJson.length > 0) {
          for (const p of rawJson) {
            await insertPropertyRecord(p);
          }
          console.log(`[DB SEED] Migrated ${rawJson.length} properties from owner_properties.json`);
        }
      } catch (err) {
        console.warn('[DB SEED] Error reading owner_properties.json during seed:', err.message);
      }
    }

    // B: Seed Curated Catalog from src/data/properties.js
    try {
      const { sampleProperties } = await import('../../src/data/properties.js');
      if (Array.isArray(sampleProperties) && sampleProperties.length > 0) {
        let insertedCatalog = 0;
        for (const p of sampleProperties) {
          const existing = await get('SELECT id FROM properties WHERE id = ? OR slug = ?', [p.id, p.slug]);
          if (!existing) {
            await insertPropertyRecord({ ...p, isDemo: true, status: 'published' });
            insertedCatalog++;
          }
        }
        console.log(`[DB SEED] Seeded ${insertedCatalog} catalog properties into database.`);
      }
    } catch (err) {
      console.warn('[DB SEED] Catalog import warning:', err.message);
    }
  }

  // 3. Existing JSON Enquiries
  const enqCountRow = await get('SELECT COUNT(*) as count FROM enquiries');
  const enqCount = Number(enqCountRow?.count || 0);
  if (enqCount === 0) {
    const enqFile = path.join(DATA_DIR, 'enquiries.json');
    if (fs.existsSync(enqFile)) {
      try {
        const rawEnquiries = JSON.parse(fs.readFileSync(enqFile, 'utf-8'));
        if (Array.isArray(rawEnquiries) && rawEnquiries.length > 0) {
          for (const e of rawEnquiries) {
            await run(
              `INSERT INTO enquiries (id, name, phone, email, property_id, property_title, property_location, requirement, property_type, area, expected_price, message, status, submitted_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                e.id,
                e.name,
                e.phone,
                e.email || null,
                e.propertyId || null,
                e.propertyTitle || 'General Enquiry',
                e.propertyLocation || null,
                e.requirement || null,
                e.propertyType || null,
                e.area || null,
                e.expectedPrice || null,
                e.message || null,
                e.status || 'new',
                e.submittedAt || new Date().toISOString(),
                e.updatedAt || null,
              ]
            );
          }
          console.log(`[DB SEED] Migrated ${rawEnquiries.length} enquiries from enquiries.json`);
        }
      } catch (err) {
        console.warn('[DB SEED] Error migrating enquiries.json:', err.message);
      }
    }
  }
}

/**
 * Helper to insert a property record into the database
 */
async function insertPropertyRecord(p) {
  const gallery = Array.isArray(p.gallery) ? JSON.stringify(p.gallery) : JSON.stringify([p.image || '']);
  const features = Array.isArray(p.features) ? JSON.stringify(p.features) : JSON.stringify([]);

  const isDemo = p.isDemo ? 1 : 0;
  const isVerified = p.isVerified ? 1 : 0;
  const featured = p.featured ? 1 : 0;

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
    p.id,
    p.slug,
    p.title,
    p.category,
    p.transactionType || p.transaction_type,
    p.locality,
    p.subLocation || p.sub_location || p.locality,
    p.address || '',
    p.price || '',
    p.priceDisplay || p.price_display || p.price || 'Price on Request',
    p.pricePerSqft || p.price_per_sqft || null,
    p.priceNumber ? Number(p.priceNumber) : (p.price_number ? Number(p.price_number) : null),
    p.monthlyRent || p.monthly_rent || null,
    p.depositAmount || p.deposit_amount || null,
    p.leaseTerm || p.lease_term || null,
    p.areaSqFt ? Number(p.areaSqFt) : (p.area_sqft ? Number(p.area_sqft) : null),
    p.areaDisplay || p.area_display || (p.areaSqFt ? `${p.areaSqFt} sq.ft` : null),
    p.areaUnit || p.area_unit || 'sq.ft',
    p.bedrooms !== undefined && p.bedrooms !== null ? Number(p.bedrooms) : null,
    p.bathrooms !== undefined && p.bathrooms !== null ? Number(p.bathrooms) : null,
    p.furnishing || null,
    p.possessionStatus || p.possession_status || 'Ready to Move',
    p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    gallery,
    features,
    p.description || '',
    p.status || 'published',
    featured,
    isDemo,
    isVerified,
    p.internalNotes || p.internal_notes || '',
    p.createdAt || p.created_at || new Date().toISOString(),
    p.updatedAt || p.updated_at || new Date().toISOString(),
  ];

  await run(sql, params);
}
