#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Zinat Al-Haya School Management System
 */

require('dotenv').config();

const requiredVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const optionalVars = [
  'DATABASE_URL',
  'CORS_ORIGIN',
  'SESSION_SECRET',
  'BCRYPT_SALT_ROUNDS',
  'LOG_LEVEL'
];

console.log('🔍 Validating Environment Variables...');
console.log('=' .repeat(50));

let hasErrors = false;

// Check required variables
console.log('\n📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '*'.repeat(Math.min(value.length, 20)) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\n📝 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NOT SET (using default)`);
  } else {
    const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '*'.repeat(Math.min(value.length, 20)) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Security checks
console.log('\n🔒 Security Validation:');

// Check JWT secret strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    console.log('❌ JWT_SECRET: Too short (minimum 32 characters)');
    hasErrors = true;
  } else if (jwtSecret === 'your-super-secret-jwt-key-here' || jwtSecret.includes('default')) {
    console.log('❌ JWT_SECRET: Using default/example value');
    hasErrors = true;
  } else {
    console.log('✅ JWT_SECRET: Strong');
  }
}

// Check environment
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'production') {
  console.log('✅ NODE_ENV: Production mode');
  
  // Additional production checks
  if (process.env.ENABLE_SWAGGER === 'true') {
    console.log('⚠️  ENABLE_SWAGGER: Should be false in production');
  }
  
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('⚠️  LOG_LEVEL: Consider using "info" or "warn" in production');
  }
} else {
  console.log(`ℹ️  NODE_ENV: ${nodeEnv || 'development'} mode`);
}

// Check CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  if (corsOrigin.includes('localhost')) {
    console.log('⚠️  CORS_ORIGIN: Contains localhost (development setting)');
  } else if (corsOrigin.includes('https://')) {
    console.log('✅ CORS_ORIGIN: Using HTTPS');
  } else {
    console.log('⚠️  CORS_ORIGIN: Should use HTTPS in production');
  }
}

console.log('\n' + '=' .repeat(50));

if (hasErrors) {
  console.log('❌ Environment validation failed!');
  console.log('Please fix the errors above before deploying.');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed!');
  console.log('Your environment is ready for deployment.');
}

console.log('\n📖 For deployment help, see DEPLOYMENT_GUIDE.md');
