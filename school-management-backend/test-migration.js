#!/usr/bin/env node

/**
 * Test Migration Script
 * Tests the migration locally before deploying to Render
 */

const { execSync } = require('child_process');

console.log('🧪 Testing migration locally...');

try {
  // Build the project first
  console.log('🔨 Building project...');
  execSync('npm run build:minimal', { stdio: 'inherit' });

  // Run migrations
  console.log('🚀 Running migrations...');
  execSync('npm run migration:run', { stdio: 'inherit' });

  console.log('✅ Migration test completed successfully!');
  console.log('🎉 Ready for Render deployment!');

} catch (error) {
  console.error('❌ Migration test failed:', error.message);
  console.log('🔧 Check the error above and fix before deploying');
  process.exit(1);
}
