// Database Restore Utility for Tomar Enterprises
// Restores properties, enquiries, settings, and owner accounts from a snapshot directory.
// Usage: node scripts/restoreDatabase.mjs [path-to-backup-dir]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, runMigrations } from '../server/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

async function main() {
  console.log('====================================================');
  console.log('   TOMAR ENTERPRISES - DATABASE RESTORE UTILITY     ');
  console.log('====================================================');

  const customDir = process.argv[2];
  let backupDir = customDir;

  if (!backupDir) {
    // Find latest backup directory
    if (!fs.existsSync(BACKUPS_DIR)) {
      console.error('[ERROR] No backups directory found at', BACKUPS_DIR);
      process.exit(1);
    }
    const dirs = fs.readdirSync(BACKUPS_DIR)
      .filter((d) => d.startsWith('backup-'))
      .sort()
      .reverse();
    if (dirs.length === 0) {
      console.error('[ERROR] No backups found in', BACKUPS_DIR);
      process.exit(1);
    }
    backupDir = path.join(BACKUPS_DIR, dirs[0]);
  }

  console.log(`[RESTORE] Source backup directory: ${backupDir}`);

  if (!fs.existsSync(backupDir)) {
    console.error(`[ERROR] Specified backup directory does not exist: ${backupDir}`);
    process.exit(1);
  }

  try {
    await runMigrations();

    // 1. Restore owner users
    const ownersFile = path.join(backupDir, 'owner_users.json');
    if (fs.existsSync(ownersFile)) {
      const owners = JSON.parse(fs.readFileSync(ownersFile, 'utf-8'));
      for (const u of owners) {
        await query(
          `INSERT INTO owner_users (id, username, password_hash, role, created_at, updated_at, is_initial_password)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
             username = excluded.username,
             password_hash = excluded.password_hash,
             role = excluded.role,
             updated_at = excluded.updated_at,
             is_initial_password = excluded.is_initial_password`,
          [u.id, u.username, u.password_hash, u.role || 'owner', u.created_at, u.updated_at, u.is_initial_password ? 1 : 0]
        );
      }
      console.log(`[RESTORE] Restored ${owners.length} owner users.`);
    }

    // 2. Restore properties
    const propsFile = path.join(backupDir, 'properties.json');
    if (fs.existsSync(propsFile)) {
      const properties = JSON.parse(fs.readFileSync(propsFile, 'utf-8'));
      for (const p of properties) {
        await query(
          `INSERT INTO properties (
             id, slug, title, category, transaction_type, locality, sub_location, address,
             price, price_display, price_per_sqft, price_number, monthly_rent, deposit_amount, lease_term,
             area_sqft, area_display, area_unit, bedrooms, bathrooms, furnishing, possession_status,
             image, gallery, features, description, status, featured, is_demo, created_at, updated_at
           ) VALUES (
             ?, ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?, ?, ?
           ) ON CONFLICT (id) DO UPDATE SET
             slug = excluded.slug,
             title = excluded.title,
             category = excluded.category,
             transaction_type = excluded.transaction_type,
             locality = excluded.locality,
             sub_location = excluded.sub_location,
             address = excluded.address,
             price = excluded.price,
             price_display = excluded.price_display,
             price_per_sqft = excluded.price_per_sqft,
             price_number = excluded.price_number,
             monthly_rent = excluded.monthly_rent,
             deposit_amount = excluded.deposit_amount,
             lease_term = excluded.lease_term,
             area_sqft = excluded.area_sqft,
             area_display = excluded.area_display,
             area_unit = excluded.area_unit,
             bedrooms = excluded.bedrooms,
             bathrooms = excluded.bathrooms,
             furnishing = excluded.furnishing,
             possession_status = excluded.possession_status,
             image = excluded.image,
             gallery = excluded.gallery,
             features = excluded.features,
             description = excluded.description,
             status = excluded.status,
             featured = excluded.featured,
             is_demo = excluded.is_demo,
             updated_at = excluded.updated_at`,
          [
            p.id, p.slug, p.title, p.category, p.transaction_type, p.locality, p.sub_location || '', p.address || '',
            p.price || '', p.price_display || '', p.price_per_sqft || '', p.price_number || 0, p.monthly_rent || '', p.deposit_amount || '', p.lease_term || '',
            p.area_sqft || 0, p.area_display || '', p.area_unit || 'sq.ft', p.bedrooms || null, p.bathrooms || null, p.furnishing || '', p.possession_status || 'Ready to Move',
            p.image || '', p.gallery || '[]', p.features || '[]', p.description || '', p.status || 'draft', p.featured ? 1 : 0, p.is_demo ? 1 : 0, p.created_at, p.updated_at
          ]
        );
      }
      console.log(`[RESTORE] Restored ${properties.length} properties.`);
    }

    // 3. Restore enquiries
    const enqFile = path.join(backupDir, 'enquiries.json');
    if (fs.existsSync(enqFile)) {
      const enquiries = JSON.parse(fs.readFileSync(enqFile, 'utf-8'));
      for (const e of enquiries) {
        await query(
          `INSERT INTO enquiries (
             id, name, phone, email, property_id, property_title, property_location,
             requirement, property_type, area, expected_price, message, status, submitted_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
             name = excluded.name,
             phone = excluded.phone,
             email = excluded.email,
             status = excluded.status,
             updated_at = excluded.updated_at`,
          [
            e.id, e.name, e.phone, e.email || '', e.property_id || '', e.property_title || '', e.property_location || '',
            e.requirement || '', e.property_type || '', e.area || '', e.expected_price || '', e.message || '', e.status || 'new', e.submitted_at, e.updated_at || null
          ]
        );
      }
      console.log(`[RESTORE] Restored ${enquiries.length} customer enquiries.`);
    }

    // 4. Restore settings
    const settingsFile = path.join(backupDir, 'website_settings.json');
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
      for (const s of settings) {
        await query(
          `INSERT INTO website_settings (key, value, updated_at) VALUES (?, ?, ?)
           ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          [s.key, s.value, s.updated_at]
        );
      }
      console.log(`[RESTORE] Restored ${settings.length} website settings.`);
    }

    console.log('====================================================');
    console.log('[SUCCESS] Database restore completed cleanly!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Restore failed:', err);
    process.exit(1);
  }
}

main();
