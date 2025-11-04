#!/usr/bin/env node

/**
 * Test Build Script to Identify Issues
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Testing build process...');

try {
  // Test TypeScript compilation
  console.log('📝 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation test passed');

  // Test actual build
  console.log('🔨 Testing actual build...');
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ Build test passed');

  // Check if dist directory was created
  if (fs.existsSync('dist')) {
    console.log('✅ Dist directory created successfully');
    
    // List files in dist
    const files = fs.readdirSync('dist');
    console.log('📁 Files in dist:', files.slice(0, 10)); // Show first 10 files
  } else {
    console.log('❌ Dist directory not created');
  }

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  
  // Try to identify specific issues
  console.log('\n🔍 Trying to identify specific issues...');
  
  try {
    // Test individual file compilation
    console.log('📝 Testing main.ts compilation...');
    execSync('npx tsc src/main.ts --noEmit', { stdio: 'inherit' });
    console.log('✅ main.ts compiles successfully');
  } catch (mainError) {
    console.error('❌ main.ts compilation failed:', mainError.message);
  }
  
  try {
    // Test app.module.ts compilation
    console.log('📝 Testing app.module.ts compilation...');
    execSync('npx tsc src/app.module.ts --noEmit --skipLibCheck', { stdio: 'inherit' });
    console.log('✅ app.module.ts compiles successfully');
  } catch (appError) {
    console.error('❌ app.module.ts compilation failed:', appError.message);
  }
  
  process.exit(1);
}
