#!/usr/bin/env node
/**
 * Apply pending TypeORM migrations to the database pointed at by DATABASE_URL.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://...'
 *   npm run migrate:deploy
 *
 * Or put DATABASE_URL in .env / .env.local in school-management-backend (this script loads them).
 *
 * Disable TLS for local Postgres URLs: DATABASE_SSL=false
 */

const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
process.chdir(root);

try {
  require('dotenv').config({ path: path.join(root, '.env') });
  require('dotenv').config({ path: path.join(root, '.env.local'), override: true });
} catch {
  /* dotenv is optional if DATABASE_URL is already in the environment */
}

if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
  console.error(
    'DATABASE_URL is not set.\n' +
      '  • Railway: copy the Postgres DATABASE_URL into your shell or into .env\n' +
      '  • Example: export DATABASE_URL="postgresql://user:pass@host:5432/railway"\n' +
      '  • Local Postgres without TLS: export DATABASE_SSL=false',
  );
  process.exit(1);
}

console.log('Running migrations from:', root);
console.log('Target: DATABASE_URL is set (host hidden)');

execSync('npm run migration:run', {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: root,
});

console.log('Migrations finished successfully.');
