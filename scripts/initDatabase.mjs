// Database Migration & Initialization Script for Tomar Enterprises
import { runMigrations, checkHealth } from '../server/db/index.js';

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
  process.exit(1);
});

async function main() {
  console.log('--- INITIALIZING TOMAR ENTERPRISES DATABASE ---');
  try {
    console.log('Step 1: Running migrations...');
    await runMigrations();
    console.log('Step 2: Checking health...');
    const health = await checkHealth();
    console.log('[SUCCESS] Database initialized successfully!');
    console.log('Health Status:', health);
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Database migration failed:', err);
    process.exit(1);
  }
}

main();
