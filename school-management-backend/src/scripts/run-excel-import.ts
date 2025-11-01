import { AppDataSource } from '../data-source';
import { ExcelDatabaseSeeder } from '../seeds/excel-seed';

async function runExcelImport() {
  try {
    console.log('🌸 Initializing Zinat Al-Haya Excel Import...');
    
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Create and run the Excel seeder
    const seeder = new ExcelDatabaseSeeder(AppDataSource);
    await seeder.run();

    console.log('🎉 Excel import completed successfully!');
    
  } catch (error) {
    console.error('❌ Excel import failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the import
runExcelImport();
