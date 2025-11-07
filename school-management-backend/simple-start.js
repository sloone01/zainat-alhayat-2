#!/usr/bin/env node

/**
 * Simple Startup Script
 * Just starts the app without complex migration logic
 */

const { execSync, spawn } = require('child_process');

console.log('🚀 Starting school management application...');

async function startApp() {
  try {
    // Step 1: Check environment
    console.log('🔍 Checking environment variables...');
    try {
      execSync('node debug-env.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Debug script not available, continuing...');
    }

    // Step 2: Start the application directly
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
