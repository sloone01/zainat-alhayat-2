#!/usr/bin/env node

/**
 * Startup Script with Safe Migrations
 * Runs migrations safely before starting the application
 */

const { execSync, spawn } = require('child_process');

console.log('🚀 Starting application with safe migrations...');

async function startApp() {
  try {
    // Step 1: Check environment
    console.log('🔍 Checking environment variables...');
    execSync('node debug-env.js', { stdio: 'inherit' });

    // Step 2: Run migrations safely
    console.log('📋 Running database migrations safely...');
    try {
      execSync('npm run migration:run:prod', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully!');
    } catch (migrationError) {
      console.log('⚠️  Migration had issues, but continuing...');
      console.log('Error:', migrationError.message);
    }

    // Step 3: Start the application
    console.log('🌟 Starting NestJS application...');
    const app = spawn('node', ['dist/main.js'], {
      stdio: 'inherit',
      env: process.env
    });

    // Handle application exit
    app.on('close', (code) => {
      console.log(`Application exited with code ${code}`);
      process.exit(code);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      app.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      app.kill('SIGINT');
    });

  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

startApp();
