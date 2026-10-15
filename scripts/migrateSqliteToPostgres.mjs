// Migration Script: SQLite -> PostgreSQL for Tomar Enterprises
// Reads existing production SQLite database and uploads all properties, enquiries, settings,
// and owner credentials into PostgreSQL without data loss.
// Usage: DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/migrateSqliteToPostgres.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SQLITE_PATH = path.join(ROOT_DIR, 'server', 'data', 'tomar.db');

async function main() {
  console.log('====================================================');
  console.log('   SQLITE -> POSTGRESQL DATA MIGRATION UTILITY      ');
  console.log('====================================================');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('[ERROR] DATABASE_URL environment variable is not defined.');
    console.error('Provide a valid PostgreSQL connection string, e.g.:');
    console.error('DATABASE_URL="postgres://user:password@host/dbname" node scripts/migrateSqliteToPostgres.mjs');
    process.exit(1);
  }

  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`[ERROR] SQLite source database not found at ${SQLITE_PATH}`);
    process.exit(1);
  }

  console.log(`[MIGRATION] Reading SQLite source: ${SQLITE_PATH}`);
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(SQLITE_PATH);
  const sqliteDb = new SQL.Database(fileBuffer);

  console.log(`[MIGRATION] Connecting to target PostgreSQL database...`);
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: !databaseUrl.includes('localhost') ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[MIGRATION] Step 1: Ensuring PostgreSQL schema exists...');
    await client.query(`
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
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        property_id VARCHAR(64),
        property_title VARCHAR(255),
        property_location VARCHAR(255),
        requirement TEXT,
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
    `);

    // Helper to query SQLite
    function querySqlite(sql) {
      const stmt = sqliteDb.prepare(sql);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }

    // 1. Migrate owner users
    console.log('[MIGRATION] Step 2: Migrating owner users...');
    const owners = querySqlite('SELECT * FROM owner_users');
    for (const u of owners) {
      await client.query(
        `INSERT INTO owner_users (id, username, password_hash, role, created_at, updated_at, is_initial_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           updated_at = EXCLUDED.updated_at,
           is_initial_password = EXCLUDED.is_initial_password`,
        [u.id, u.username, u.password_hash, u.role || 'owner', u.created_at, u.updated_at, Boolean(u.is_initial_password)]
      );
    }
    console.log(`[MIGRATION] ✓ Migrated ${owners.length} owner account(s)`);

    // 2. Migrate properties
    console.log('[MIGRATION] Step 3: Migrating properties...');
    const properties = querySqlite('SELECT * FROM properties');
    for (const p of properties) {
      await client.query(
        `INSERT INTO properties (
           id, slug, title, category, transaction_type, locality, sub_location, address,
           price, price_display, price_per_sqft, price_number, monthly_rent, deposit_amount, lease_term,
           area_sqft, area_display, area_unit, bedrooms, bathrooms, furnishing, possession_status,
           image, gallery, features, description, status, featured, is_demo, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13, $14, $15,
           $16, $17, $18, $19, $20, $21, $22,
           $23, $24, $25, $26, $27, $28, $29, $30, $31
         ) ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           transaction_type = EXCLUDED.transaction_type,
           locality = EXCLUDED.locality,
           sub_location = EXCLUDED.sub_location,
           address = EXCLUDED.address,
           price = EXCLUDED.price,
           price_display = EXCLUDED.price_display,
           price_per_sqft = EXCLUDED.price_per_sqft,
           price_number = EXCLUDED.price_number,
           monthly_rent = EXCLUDED.monthly_rent,
           deposit_amount = EXCLUDED.deposit_amount,
           lease_term = EXCLUDED.lease_term,
           area_sqft = EXCLUDED.area_sqft,
           area_display = EXCLUDED.area_display,
           area_unit = EXCLUDED.area_unit,
           bedrooms = EXCLUDED.bedrooms,
           bathrooms = EXCLUDED.bathrooms,
           furnishing = EXCLUDED.furnishing,
           possession_status = EXCLUDED.possession_status,
           image = EXCLUDED.image,
           gallery = EXCLUDED.gallery,
           features = EXCLUDED.features,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           featured = EXCLUDED.featured,
           is_demo = EXCLUDED.is_demo,
           updated_at = EXCLUDED.updated_at`,
        [
          p.id, p.slug, p.title, p.category, p.transaction_type, p.locality, p.sub_location || '', p.address || '',
          p.price || '', p.price_display || '', p.price_per_sqft || '', Number(p.price_number) || 0, p.monthly_rent || '', p.deposit_amount || '', p.lease_term || '',
          Number(p.area_sqft) || 0, p.area_display || '', p.area_unit || 'sq.ft', p.bedrooms || null, p.bathrooms || null, p.furnishing || '', p.possession_status || 'Ready to Move',
          p.image || '', p.gallery || '[]', p.features || '[]', p.description || '', p.status || 'draft', Boolean(p.featured), Boolean(p.is_demo), p.created_at, p.updated_at
        ]
      );
    }
    console.log(`[MIGRATION] ✓ Migrated ${properties.length} property listings`);

    // 3. Migrate enquiries
    console.log('[MIGRATION] Step 4: Migrating enquiries...');
    const enquiries = querySqlite('SELECT * FROM enquiries');
    for (const e of enquiries) {
      await client.query(
        `INSERT INTO enquiries (
           id, name, phone, email, property_id, property_title, property_location,
           requirement, property_type, area, expected_price, message, status, submitted_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           status = EXCLUDED.status,
           updated_at = EXCLUDED.updated_at`,
        [
          e.id, e.name, e.phone, e.email || '', e.property_id || '', e.property_title || '', e.property_location || '',
          e.requirement || '', e.property_type || '', e.area || '', e.expected_price || '', e.message || '', e.status || 'new', e.submitted_at, e.updated_at || null
        ]
      );
    }
    console.log(`[MIGRATION] ✓ Migrated ${enquiries.length} enquiry leads`);

    // 4. Migrate website settings
    console.log('[MIGRATION] Step 5: Migrating website settings...');
    const settings = querySqlite('SELECT * FROM website_settings');
    for (const s of settings) {
      await client.query(
        `INSERT INTO website_settings (key, value, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [s.key, s.value, s.updated_at]
      );
    }
    console.log(`[MIGRATION] ✓ Migrated ${settings.length} setting(s)`);

    await client.query('COMMIT');

    // Verification
    const pgPropCount = await client.query('SELECT COUNT(*) as count FROM properties');
    const pgEnqCount = await client.query('SELECT COUNT(*) as count FROM enquiries');

    console.log('====================================================');
    console.log('[SUCCESS] SQLite to PostgreSQL migration complete!');
    console.log(`PostgreSQL Properties: ${pgPropCount.rows[0].count} / SQLite: ${properties.length}`);
    console.log(`PostgreSQL Enquiries:  ${pgEnqCount.rows[0].count} / SQLite: ${enquiries.length}`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Migration failed and rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
