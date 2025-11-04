#!/usr/bin/env node

/**
 * Generate Secure Keys for Production Deployment
 * Zinat Al-Haya School Management System
 */

const crypto = require('crypto');

console.log('🔐 Generating Secure Keys for Production Deployment');
console.log('=' .repeat(60));
console.log('');

// Generate JWT Secret (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('📝 JWT Secret:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');

// Generate JWT Refresh Secret (64 bytes = 128 hex characters)
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('🔄 JWT Refresh Secret:');
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('');

// Generate Session Secret (32 bytes = 64 hex characters)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('🎫 Session Secret:');
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('');

// Generate Database Password (if needed)
const dbPassword = crypto.randomBytes(16).toString('hex');
console.log('🗄️  Database Password (if creating new DB):');
console.log(`DATABASE_PASSWORD=${dbPassword}`);
console.log('');

console.log('🚀 Complete Environment Variables for Render Backend:');
console.log('=' .repeat(60));
console.log('NODE_ENV=production');
console.log('PORT=10000');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('CORS_ORIGIN=https://school-management-frontend.onrender.com');
console.log('APP_NAME=Zinat Al-Haya School Management');
console.log('BCRYPT_SALT_ROUNDS=12');
console.log('LOG_LEVEL=info');
console.log('ENABLE_SWAGGER=false');
console.log('ENABLE_METRICS=true');
console.log('ENABLE_HEALTH_CHECK=true');
console.log('MAX_FILE_SIZE=10485760');
console.log('ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx');
console.log('RATE_LIMIT_WINDOW_MS=900000');
console.log('RATE_LIMIT_MAX_REQUESTS=100');
console.log('');

console.log('🌐 Complete Environment Variables for Render Frontend:');
console.log('=' .repeat(60));
console.log('VITE_API_URL=https://school-management-backend.onrender.com/api');
console.log('VITE_APP_NAME=Zinat Al-Haya School Management');
console.log('VITE_NODE_ENV=production');
console.log('VITE_DEFAULT_LOCALE=ar');
console.log('VITE_ENABLE_DEVTOOLS=false');
console.log('VITE_ENABLE_CONSOLE_LOGS=false');
console.log('VITE_SESSION_TIMEOUT=60');
console.log('VITE_API_TIMEOUT=30000');
console.log('');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('=' .repeat(60));
console.log('1. 🔒 Keep these secrets secure and private');
console.log('2. 🚫 Never commit these to version control');
console.log('3. 🔄 Use your hosting platform\'s environment variable settings');
console.log('4. 🌐 Update URLs after deployment with actual domain names');
console.log('5. 🔐 Store these secrets in a secure password manager');
console.log('');

console.log('📋 Next Steps for Render Deployment:');
console.log('=' .repeat(60));
console.log('1. Push your code to GitHub');
console.log('2. Create PostgreSQL database on Render');
console.log('3. Create backend web service with the environment variables above');
console.log('4. Create frontend static site with the environment variables above');
console.log('5. Update CORS_ORIGIN with your actual frontend URL');
console.log('6. Update VITE_API_URL with your actual backend URL');
console.log('7. Test your deployed application');
console.log('');

console.log('✅ Keys generated successfully!');
console.log('📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed step-by-step instructions');
