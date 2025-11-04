#!/usr/bin/env node

/**
 * Simple Build Script for Render Deployment
 * Avoids npm ci issues by using npm install directly
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Simple NestJS build process...');

try {
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build TypeScript directly (skip npm install since Render already did it)
  console.log('🔧 Compiling TypeScript...');
  try {
    execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  } catch (buildError) {
    console.log('⚠️  Standard build failed, trying with skipLibCheck...');
    execSync('npx tsc -p tsconfig.build.json --skipLibCheck', { stdio: 'inherit' });
  }

  console.log('✅ Build completed successfully!');
  console.log('📂 Output directory: dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Try alternative build method
  console.log('🔄 Trying alternative build method...');
  try {
    execSync('npx @nestjs/cli build', { stdio: 'inherit' });
    console.log('✅ Alternative build succeeded!');
  } catch (altError) {
    console.error('❌ Alternative build also failed:', altError.message);
    process.exit(1);
  }
}
