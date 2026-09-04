#!/usr/bin/env node

/**
 * Migration Runner for Parent System Updates
 * Date: 2024-11-21
 * Description: Runs the parent system database updates
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'school_management',
  user: process.env.DATABASE_USERNAME || 'school_admin',
  password: process.env.DATABASE_PASSWORD || 'school_password_2024',
};

async function runMigration() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/2024-11-21-parent-system-updates.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running parent system migration...');
    
    // Execute the migration
    const result = await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Show results if any
    if (result && result.rows) {
      console.log('\n📊 Migration Results:');
      result.rows.forEach(row => {
        console.log(row);
      });
    }

    // Verify parent system setup
    console.log('\n🔍 Verifying parent system setup...');
    
    const verificationQuery = `
      SELECT 
        'Parent System Status' as check_type,
        COUNT(p.*) as total_parents,
        COUNT(p.user_id) as parents_with_accounts,
        COUNT(CASE WHEN u.role = 'parent' THEN 1 END) as valid_parent_users
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id;
    `;
    
    const verification = await client.query(verificationQuery);
    console.log('📈 Verification Results:');
    verification.rows.forEach(row => {
      console.log(`  - Total Parents: ${row.total_parents}`);
      console.log(`  - Parents with User Accounts: ${row.parents_with_accounts}`);
      console.log(`  - Valid Parent Users: ${row.valid_parent_users}`);
    });

    // Check for any parent users
    const parentUsersQuery = `
      SELECT 
        u.email,
        u."firstName" || ' ' || u."lastName" as full_name,
        u."isActive",
        p.id as parent_record_id
      FROM users u
      LEFT JOIN parents p ON u.id = p.user_id
      WHERE u.role = 'parent'
      ORDER BY u."createdAt" DESC
      LIMIT 5;
    `;
    
    const parentUsers = await client.query(parentUsersQuery);
    if (parentUsers.rows.length > 0) {
      console.log('\n👥 Parent Users Found:');
      parentUsers.rows.forEach(user => {
        console.log(`  - ${user.full_name} (${user.email}) - Active: ${user.isactive} - Parent Record: ${user.parent_record_id ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('\n⚠️  No parent users found. You may need to create parent accounts manually.');
    }

    console.log('\n🎉 Parent system migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Create parent user accounts through the admin interface');
    console.log('  2. Link parent records to students');
    console.log('  3. Test the parent dashboard at /parent/dashboard');
    console.log('  4. Verify parent can see their children\'s data');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  runMigration().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };
