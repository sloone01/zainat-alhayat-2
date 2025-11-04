#!/usr/bin/env node

/**
 * Alternative Build Script for Render Deployment
 * This script builds the NestJS application without requiring global nest CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting NestJS build process...');

try {
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Install dependencies with legacy peer deps to handle conflicts
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm ci', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  npm ci failed, trying with --legacy-peer-deps...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }

  // Build TypeScript
  console.log('🔧 Compiling TypeScript...');
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });

  // Copy non-TypeScript files
  console.log('📁 Copying assets...');
  
  // Copy package.json to dist
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: 'main.js',
    scripts: {
      start: 'node main.js'
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

  console.log('✅ Build completed successfully!');
  console.log('📂 Output directory: dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
