// Secure Owner Account Provisioning Script for Tomar Enterprises
// Enforces:
//   - Safe, Idempotent Execution: Running setup-owner again will NEVER overwrite an existing password!
//   - Relational Database Persistence (SQLite / PostgreSQL)
//   - Bcrypt Cryptographic Hashing (12 rounds) - never plaintext
//   - Supports 3 modes: Interactive prompt, CLI args, or Environment variables

import readline from 'node:readline/promises';
import { runMigrations, get, run } from '../server/db/index.js';
import { hashPassword } from '../server/auth.js';

async function main() {
  // Ensure database tables exist
  await runMigrations();

  // 1. Check if an owner account is already initialized in the database
  const existingOwner = await get('SELECT id, username, role, updated_at FROM owner_users LIMIT 1');

  if (existingOwner) {
    console.log(`
========================================================================
 TOMAR ENTERPRISES — OWNER ACCOUNT ALREADY INITIALIZED
========================================================================
  Username:   ${existingOwner.username}
  Role:       ${existingOwner.role}
  Last Update:${existingOwner.updated_at}
  Database:   Persistent Relational Store (server/data/tomar.db)

  [INFO] An authorized owner account already exists in the database.
  To prevent unexpected password resets or accidental lockouts,
  "npm run setup-owner" will NOT overwrite existing owner credentials.

  To log in to the dashboard:
    http://localhost:5173/owner-login

  To securely reset or change the owner password via terminal:
    npm run reset-owner-password
========================================================================
`);
    process.exit(0);
  }

  // 2. No account exists yet; proceed with initial provisioning
  const args = process.argv.slice(2);
  let cleanUser = (args[0] || process.env.TOMAR_OWNER_USER || '').trim();
  let cleanPass = args[1] || process.env.TOMAR_OWNER_PASS || '';

  if ((!cleanUser || !cleanPass) && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log(`\n========================================================================`);
      console.log(` TOMAR ENTERPRISES — INITIAL OWNER ACCOUNT SETUP`);
      console.log(`========================================================================\n`);

      if (!cleanUser) {
        cleanUser = (await rl.question('Enter Owner Username: ')).trim();
      }

      if (!cleanPass) {
        cleanPass = await rl.question('Enter Secure Password (minimum 8 characters): ');
      }
    } finally {
      rl.close();
    }
  }

  if (!cleanUser || !cleanPass) {
    console.log(`
========================================================================
 TOMAR ENTERPRISES — SECURE OWNER ACCOUNT SETUP
========================================================================

Usage:
  npm run setup-owner -- <username> <password>

Examples:
  npm run setup-owner -- tomaradmin YourSecurePass2026!
  node scripts/setupOwnerAccount.mjs tomaradmin YourSecurePass2026!

Or via environment variables:
  PowerShell:
    $env:TOMAR_OWNER_USER="tomaradmin"
    $env:TOMAR_OWNER_PASS="YourSecurePass2026!"
    npm run setup-owner
  Bash / Linux / macOS:
    TOMAR_OWNER_USER="tomaradmin" TOMAR_OWNER_PASS="YourSecurePass2026!" npm run setup-owner

Security Assurance:
  - Credentials stored in persistent relational database
  - Password hashed using bcrypt with 12 salt rounds
  - Raw passwords are NEVER saved in plaintext or exposed to client JavaScript
========================================================================
`);
    process.exit(1);
  }

  if (cleanUser.length < 3) {
    console.error('\n[ERROR] Username must be at least 3 characters long.');
    process.exit(1);
  }

  if (cleanPass.length < 8) {
    console.error('\n[ERROR] Password must be at least 8 characters long for security.');
    process.exit(1);
  }

  const hashedPassword = await hashPassword(cleanPass);
  const now = new Date().toISOString();
  const id = `user-owner-${Date.now()}`;

  await run(
    'INSERT INTO owner_users (id, username, password_hash, role, created_at, updated_at, is_initial_password) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, cleanUser, hashedPassword, 'owner', now, now, 0]
  );

  console.log(`
========================================================================
 [SUCCESS] Authorized Owner Account Initialized in Database!
========================================================================
  Username: ${cleanUser}
  Role:     owner
  Security: Bcrypt (12 salt rounds)
  Created:  ${now}
  Storage:  Persistent Relational Database (survives all app restarts)

  You can now log in at:
    http://localhost:5173/owner-login
========================================================================
`);
}

main().catch((err) => {
  console.error('[SETUP ERROR]', err);
  process.exit(1);
});
