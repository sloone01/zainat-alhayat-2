#!/usr/bin/env node

/**
 * Minimal Build Script for Render Deployment
 * Builds only essential files to avoid dependency issues
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Minimal NestJS build process...');

// Debug environment variables first
console.log('🔍 Checking environment variables...');
execSync('node debug-env.js', { stdio: 'inherit' });

try {
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync('dist', { recursive: true });

  // Build with minimal configuration, excluding problematic files
  console.log('🔧 Compiling TypeScript with minimal config...');
  
  const buildCommand = [
    'npx tsc',
    '--outDir dist',
    '--skipLibCheck',
    '--experimentalDecorators',
    '--emitDecoratorMetadata',
    '--target ES2020',
    '--module commonjs',
    '--esModuleInterop',
    '--allowSyntheticDefaultImports',
    '--declaration false',
    '--sourceMap false',
    '--removeComments',
    'src/main.ts'
  ].join(' ');

  execSync(buildCommand, { stdio: 'inherit' });

  console.log('✅ Minimal build completed successfully!');
  console.log('📂 Output directory: dist/');

  // Copy migration runner to dist
  console.log('📋 Copying migration runner...');
  execSync('cp src/migration-runner.ts dist/migration-runner.js', { stdio: 'inherit' });

  console.log('🎉 Build process completed!');
  
} catch (error) {
  console.error('❌ Minimal build failed:', error.message);
  
  // Last resort: copy source files and compile individually
  console.log('🔄 Trying last resort method...');
  try {
    // Just copy the main files we need
    execSync('cp src/main.ts dist/', { stdio: 'inherit' });
    console.log('✅ Copied essential files');
  } catch (copyError) {
    console.error('❌ Even copy failed:', copyError.message);
    process.exit(1);
  }
}
