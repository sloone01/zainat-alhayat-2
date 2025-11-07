#!/usr/bin/env node

/**
 * Debug Environment Variables
 * Helps debug what environment variables are actually available
 */

console.log('🔍 Environment Variables Debug:');
console.log('================================');

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
    // Hide password for security
    const safeUrl = databaseUrl.replace(/:([^:@]+)@/, ':***@');
    console.log('✅ DATABASE_URL is set:', safeUrl);
    
    // Parse URL to check format
    try {
        const url = new URL(databaseUrl);
        console.log('📊 Database URL Analysis:');
        console.log('  Protocol:', url.protocol);
        console.log('  Username:', url.username);
        console.log('  Password:', url.password ? '***' : 'NOT SET');
        console.log('  Host:', url.hostname);
        console.log('  Port:', url.port);
        console.log('  Database:', url.pathname.substring(1));
    } catch (error) {
        console.log('❌ DATABASE_URL format error:', error.message);
    }
} else {
    console.log('❌ DATABASE_URL is NOT set');
}

// Check other important variables
const envVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'RENDER_SERVICE_NAME',
    'RENDER_EXTERNAL_URL'
];

console.log('\n📋 Other Environment Variables:');
envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        const displayValue = varName.includes('SECRET') ? '***' : value;
        console.log(`✅ ${varName}: ${displayValue}`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log('\n🔧 Render-specific variables:');
console.log('RENDER:', process.env.RENDER ? 'YES' : 'NO');
console.log('RENDER_SERVICE_ID:', process.env.RENDER_SERVICE_ID ? 'SET' : 'NOT SET');

console.log('\n================================');
console.log('Debug completed');
