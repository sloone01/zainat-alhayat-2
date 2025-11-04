import { MigrationInterface, QueryRunner } from 'typeorm';

export class SafeSchemaAnalysis1704067250000 implements MigrationInterface {
    name = 'SafeSchemaAnalysis1704067250000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔍 Starting safe schema analysis...');

        try {
            // Check what tables exist
            const tables = await queryRunner.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `);
            
            console.log('📊 Existing tables:', tables.map(t => t.table_name));

            // Check attendances/attendance table structure
            const attendanceColumns = await queryRunner.query(`
                SELECT table_name, column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name IN ('attendance', 'attendances')
                ORDER BY table_name, ordinal_position
            `);
            
            console.log('📋 Attendance table columns:', attendanceColumns);

            // Check schedules table structure
            const scheduleColumns = await queryRunner.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'schedules'
                ORDER BY ordinal_position
            `);
            
            console.log('📅 Schedule table columns:', scheduleColumns);

            // Check existing constraints
            const constraints = await queryRunner.query(`
                SELECT constraint_name, table_name, constraint_type
                FROM information_schema.table_constraints 
                WHERE table_name IN ('attendance', 'attendances', 'schedules')
                ORDER BY table_name, constraint_name
            `);
            
            console.log('🔗 Existing constraints:', constraints);

            console.log('✅ Schema analysis completed - no changes made');

        } catch (error) {
            console.log('❌ Error during analysis:', error.message);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Analysis migration - nothing to revert');
    }
}
