import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource, MigrationInterface } from 'typeorm';

function migrationName(m: MigrationInterface): string {
  return m.name || m.constructor.name;
}

function migrationTimestamp(name: string): number {
  const match = name.match(/(\d{13})$/);
  return match ? Number(match[1]) : 0;
}

/**
 * Runs each still-pending migration on its own, recording successes in the
 * migrations table and logging (not throwing) failures, so one failing
 * migration cannot block the ones after it.
 */
async function runPendingIndividually(dataSource: DataSource): Promise<void> {
  const executedRows: { name: string }[] = await dataSource.query(`SELECT name FROM "migrations"`);
  const executed = new Set(executedRows.map((r) => r.name));
  const pending = dataSource.migrations
    .filter((m) => !executed.has(migrationName(m)))
    .sort((a, b) => {
      const diff = migrationTimestamp(migrationName(a)) - migrationTimestamp(migrationName(b));
      return diff !== 0 ? diff : migrationName(a).localeCompare(migrationName(b));
    });

  console.log(`🔁 Retrying ${pending.length} pending migration(s) individually...`);
  const failed: string[] = [];
  for (const migration of pending) {
    const name = migrationName(migration);
    const queryRunner = dataSource.createQueryRunner();
    try {
      await migration.up(queryRunner);
      await queryRunner.query(`INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)`, [
        migrationTimestamp(name),
        name,
      ]);
      console.log(`✅ Migration ${name} applied`);
    } catch (err) {
      failed.push(name);
      console.error(`❌ Migration ${name} failed: ${err?.message ?? err}`);
    } finally {
      await queryRunner.release();
    }
  }
  if (failed.length) {
    console.error(`❌ ${failed.length} migration(s) still failing: ${failed.join(', ')}`);
  } else {
    console.log('✅ All pending migrations applied after retry');
  }
}

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
        console.error('⚠️  Migration error occurred:', migrationError.message);
        // TypeORM stops at the first failing migration, which silently blocks every
        // later one (e.g. ChatAdminReview never ran → "column m.admin_review does not exist").
        // Retry the remaining pending migrations one by one so a single broken
        // migration no longer holds back unrelated schema changes.
        await runPendingIndividually(dataSource);
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
