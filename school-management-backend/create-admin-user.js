const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdminUser() {
  // Database connection
  const client = new Client({
    user: 'school_admin',
    host: 'localhost',
    database: 'school_management',
    password: 'school_password_2024',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Admin user credentials
    const username = 'admin';
    const email = 'admin@zinat-al-haya.om';
    const password = 'Admin123!';
    const firstName = 'Super';
    const lastName = 'Admin';
    const role = 'admin';

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    let result;
    if (existingUser.rows.length > 0) {
      console.log('👤 Admin user already exists. Updating password...');

      // Update existing admin user
      result = await client.query(`
        UPDATE users
        SET password = $1, "updatedAt" = NOW()
        WHERE username = $2
        RETURNING id, username, email, "firstName", "lastName", role
      `, [hashedPassword, username]);

      console.log('✅ Admin user password updated successfully!');
    } else {
      // Create admin user
      result = await client.query(`
        INSERT INTO users (
          username, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        ) RETURNING id, username, email, "firstName", "lastName", role
      `, [username, email, hashedPassword, firstName, lastName, role, true]);

      console.log('✅ Admin user created successfully!');
    }
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🔐 Password:', password);
    console.log('');
    console.log('👑 Role: Super Administrator (all privileges)');
    console.log('🆔 User ID:', result.rows[0].id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the script
createAdminUser();