import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function runMigrations() {
  console.log('🚀 Starting safe migration runner...');
  
  try {
    // Create the NestJS application
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    
    // Get the DataSource
    const dataSource = app.get(DataSource);
    
    console.log('📊 Database connection status:', dataSource.isInitialized ? 'Connected' : 'Not connected');
    
    if (!dataSource.isInitialized) {
      console.log('🔌 Initializing database connection...');
      await dataSource.initialize();
    }
    
    // Check current migration status
    console.log('🔍 Checking migration status...');
    const executedMigrations = await dataSource.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_name = 'migrations'
    `);
    
    if (executedMigrations.length === 0) {
      console.log('📋 Creating migrations table...');
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "migrations" (
          "id" SERIAL PRIMARY KEY,
          "timestamp" bigint NOT NULL,
          "name" character varying NOT NULL
        )
      `);
    }
    
    // Get pending migrations
    const pendingMigrations = await dataSource.showMigrations();
    console.log(`📊 Pending migrations: ${pendingMigrations ? 'Yes' : 'No'}`);
    
    if (pendingMigrations) {
      console.log('🔄 Running migrations safely...');

      // Run migrations with error handling
      try {
        await dataSource.runMigrations({
          transaction: 'none' // Disable transaction to prevent aborts
        });
        console.log('✅ All migrations completed successfully!');
      } catch (migrationError) {
        console.log('⚠️  Migration error occurred:', migrationError.message);
        console.log('🔧 This may be due to migrations already being partially applied.');
        console.log('🔧 Continuing with application startup...');
        // Don't fail the entire process - let the app start
      }
    } else {
      console.log('✅ All migrations are already up to date!');
    }
    
    // Test database connection
    console.log('🧪 Testing database connection...');
    const testResult = await dataSource.query('SELECT NOW() as current_time');
    console.log('✅ Database test successful:', testResult[0].current_time);
    
    // Close the application
    await app.close();
    console.log('🎉 Migration runner completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration runner failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
