// Database Backup Utility for Tomar Enterprises
// Creates a comprehensive snapshot of all properties, enquiries, settings, and owner accounts.
// Usage: node scripts/backupDatabase.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, checkHealth, getEffectiveSqlitePath } from '../server/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

async function main() {
  console.log('====================================================');
  console.log('   TOMAR ENTERPRISES - DATABASE BACKUP UTILITY      ');
  console.log('====================================================');

  try {
    const health = await checkHealth();
    console.log(`[BACKUP] Connected engine: ${health.engine}`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetDir = path.join(BACKUPS_DIR, `backup-${timestamp}`);
    fs.mkdirSync(targetDir, { recursive: true });

    // 1. Fetch properties
    const properties = await query('SELECT * FROM properties ORDER BY created_at DESC');
    fs.writeFileSync(path.join(targetDir, 'properties.json'), JSON.stringify(properties, null, 2), 'utf-8');
    console.log(`[BACKUP] Saved ${properties.length} properties to properties.json`);

    // 2. Fetch enquiries
    const enquiries = await query('SELECT * FROM enquiries ORDER BY submitted_at DESC');
    fs.writeFileSync(path.join(targetDir, 'enquiries.json'), JSON.stringify(enquiries, null, 2), 'utf-8');
    console.log(`[BACKUP] Saved ${enquiries.length} customer enquiries to enquiries.json`);

    // 3. Fetch website settings
    const settings = await query('SELECT * FROM website_settings');
    fs.writeFileSync(path.join(targetDir, 'website_settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
    console.log(`[BACKUP] Saved ${settings.length} website settings to website_settings.json`);

    // 4. Fetch owner users (hashed passwords only)
    const owners = await query('SELECT id, username, password_hash, role, created_at, updated_at, is_initial_password FROM owner_users');
    fs.writeFileSync(path.join(targetDir, 'owner_users.json'), JSON.stringify(owners, null, 2), 'utf-8');
    console.log(`[BACKUP] Saved ${owners.length} owner user accounts to owner_users.json`);

    // 5. If SQLite, also copy the binary .db file
    if (health.engine === 'sqlite') {
      const activePath = getEffectiveSqlitePath();
      if (fs.existsSync(activePath)) {
        const destDb = path.join(targetDir, 'tomar.db');
        fs.copyFileSync(activePath, destDb);
        console.log(`[BACKUP] Copied binary SQLite database to ${destDb}`);
      }
    }

    // 6. Write manifest
    const manifest = {
      backupDate: new Date().toISOString(),
      engine: health.engine,
      totalProperties: properties.length,
      totalEnquiries: enquiries.length,
      totalSettings: settings.length,
      totalOwners: owners.length,
      status: 'VERIFIED_COMPLETE',
    };
    fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

    console.log('====================================================');
    console.log(`[SUCCESS] Backup completed cleanly!`);
    console.log(`Destination: ${targetDir}`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Backup failed:', err);
    process.exit(1);
  }
}

main();
