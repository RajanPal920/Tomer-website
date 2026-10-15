// Secure Owner Account Provisioning Script for Tomar Enterprises
// Supports 3 execution modes:
//   1. Interactive Terminal Prompt: npm run setup-owner
//   2. Direct CLI Arguments:        npm run setup-owner -- <username> <new-password>
//   3. Environment Variables:       TOMAR_OWNER_USER and TOMAR_OWNER_PASS

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const AUTH_FILE = path.join(DATA_DIR, 'owner_auth.json');

// Ensure server/data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

async function main() {
  const args = process.argv.slice(2);
  let cleanUser = (args[0] || process.env.TOMAR_OWNER_USER || '').trim();
  let cleanPass = args[1] || process.env.TOMAR_OWNER_PASS || '';

  // If parameters were not provided via CLI or env, prompt interactively if in a terminal
  if ((!cleanUser || !cleanPass) && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log(`\n========================================================================`);
      console.log(` TOMAR ENTERPRISES — INTERACTIVE OWNER ACCOUNT SETUP`);
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

  // If still missing credentials, show clean usage instructions
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
  - Passwords are salted with a cryptographically secure 256-bit random salt
  - Hashed using PBKDF2-SHA-512 with 100,000 iterations
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

  const salt = crypto.randomBytes(32).toString('hex');
  const passwordHash = hashPassword(cleanPass, salt);

  const authRecord = {
    username: cleanUser,
    salt,
    passwordHash,
    role: 'owner',
    updatedAt: new Date().toISOString(),
    isInitialPassword: false,
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(authRecord, null, 2), 'utf-8');

  console.log(`
========================================================================
 [SUCCESS] Authorized Owner Account Configured Successfully!
========================================================================
  Username: ${cleanUser}
  Role:     owner
  Security: PBKDF2-SHA-512 (100,000 iterations, 32-byte salt)
  Updated:  ${authRecord.updatedAt}

  You can now log in at: http://localhost:5173/owner-login
========================================================================
`);
}

main().catch((err) => {
  console.error('[SETUP ERROR]', err);
  process.exit(1);
});
