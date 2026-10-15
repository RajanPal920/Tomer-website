// Secure Owner Password Reset Script for Tomar Enterprises
// Allows the authorized administrator/owner to reset or change the password securely from the terminal.

import readline from 'node:readline/promises';
import { runMigrations, get, run } from '../server/db/index.js';
import { hashPassword } from '../server/auth.js';

async function main() {
  await runMigrations();

  const user = await get('SELECT id, username, role, updated_at FROM owner_users LIMIT 1');

  if (!user) {
    console.error(`
[ERROR] No owner account exists in the database.
Please initialize an owner account first by running:
  npm run setup-owner
`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let newPass = args[0] || process.env.NEW_OWNER_PASS || '';

  if (!newPass && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log(`\n========================================================================`);
      console.log(` TOMAR ENTERPRISES — SECURE OWNER PASSWORD RESET`);
      console.log(`========================================================================\n`);
      console.log(`Current Owner: ${user.username} (${user.role})\n`);

      newPass = await rl.question('Enter New Secure Password (minimum 8 characters): ');
    } finally {
      rl.close();
    }
  }

  if (!newPass) {
    console.log(`
Usage:
  npm run reset-owner-password -- <new-password>

Example:
  npm run reset-owner-password -- NewSecretPassword2026!
`);
    process.exit(1);
  }

  if (newPass.length < 8) {
    console.error('\n[ERROR] New password must be at least 8 characters long for security.');
    process.exit(1);
  }

  const hashedPassword = await hashPassword(newPass);
  const now = new Date().toISOString();

  await run(
    'UPDATE owner_users SET password_hash = ?, updated_at = ?, is_initial_password = 0 WHERE id = ?',
    [hashedPassword, now, user.id]
  );

  // Invalidate all active sessions and clear any lockout rate limits for security
  await run('DELETE FROM owner_sessions WHERE user_id = ?', [user.id]);
  await run('DELETE FROM login_rate_limits');

  console.log(`
========================================================================
 [SUCCESS] Owner Password Updated Successfully!
========================================================================
  Username: ${user.username}
  Updated:  ${now}
  Security: Bcrypt (12 salt rounds)
  Sessions: All prior active sessions have been invalidated for security.

  You can now log in with your new password at:
    http://localhost:5173/owner-login
========================================================================
`);
}

main().catch((err) => {
  console.error('[RESET ERROR]', err);
  process.exit(1);
});
