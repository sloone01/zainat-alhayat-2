"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const excel_seed_1 = require("../seeds/excel-seed");
async function runExcelImport() {
    try {
        console.log('🌸 Initializing Zinat Al-Haya Excel Import...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        const seeder = new excel_seed_1.ExcelDatabaseSeeder(data_source_1.AppDataSource);
        await seeder.run();
        console.log('🎉 Excel import completed successfully!');
    }
    catch (error) {
        console.error('❌ Excel import failed:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('✅ Database connection closed');
        }
    }
}
runExcelImport();
//# sourceMappingURL=run-excel-import.js.map