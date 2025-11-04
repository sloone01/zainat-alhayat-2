"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCleanupService = void 0;
class DataCleanupService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async cleanExistingData() {
        console.log('🧹 Cleaning existing data...');
        try {
            await this.dataSource.transaction(async (manager) => {
                await manager.query('DELETE FROM student_groups');
                await manager.query('DELETE FROM student_parents');
                await manager.query('DELETE FROM schedules');
                await manager.query('DELETE FROM attendances');
                await manager.query('DELETE FROM student_progress');
                await manager.query('DELETE FROM activities');
                console.log('✅ Deleted relationship records');
                await manager.query('DELETE FROM students');
                await manager.query('DELETE FROM parents');
                await manager.query('DELETE FROM staff');
                await manager.query('DELETE FROM groups');
                console.log('✅ Deleted students, parents, staff, and groups');
                await manager.query(`
          DELETE FROM users 
          WHERE role != 'admin' 
          OR email != 'admin@zinatalhaykindergarten.com'
        `);
                console.log('✅ Deleted users (kept system admin)');
                await manager.query('ALTER SEQUENCE IF EXISTS students_id_seq RESTART WITH 1');
                await manager.query('ALTER SEQUENCE IF EXISTS parents_id_seq RESTART WITH 1');
                await manager.query('ALTER SEQUENCE IF EXISTS staff_id_seq RESTART WITH 1');
                console.log('✅ Reset sequences');
            });
            console.log('🎉 Data cleanup completed successfully!');
        }
        catch (error) {
            console.error('❌ Error during data cleanup:', error);
            throw error;
        }
    }
    async verifyCleanup() {
        console.log('🔍 Verifying cleanup...');
        const counts = {
            users: await this.dataSource.query('SELECT COUNT(*) FROM users'),
            students: await this.dataSource.query('SELECT COUNT(*) FROM students'),
            parents: await this.dataSource.query('SELECT COUNT(*) FROM parents'),
            groups: await this.dataSource.query('SELECT COUNT(*) FROM groups'),
            staff: await this.dataSource.query('SELECT COUNT(*) FROM staff'),
            studentGroups: await this.dataSource.query('SELECT COUNT(*) FROM student_groups'),
            studentParents: await this.dataSource.query('SELECT COUNT(*) FROM student_parents'),
            schedules: await this.dataSource.query('SELECT COUNT(*) FROM schedules'),
            attendances: await this.dataSource.query('SELECT COUNT(*) FROM attendances')
        };
        console.log('📊 Cleanup verification results:');
        console.log(`- Users remaining: ${counts.users[0].count} (should be 1 - admin only)`);
        console.log(`- Students: ${counts.students[0].count} (should be 0)`);
        console.log(`- Parents: ${counts.parents[0].count} (should be 0)`);
        console.log(`- Groups: ${counts.groups[0].count} (should be 0)`);
        console.log(`- Staff: ${counts.staff[0].count} (should be 0)`);
        console.log(`- Student-Group relationships: ${counts.studentGroups[0].count} (should be 0)`);
        console.log(`- Student-Parent relationships: ${counts.studentParents[0].count} (should be 0)`);
        console.log(`- Schedules: ${counts.schedules[0].count} (should be 0)`);
        console.log(`- Attendances: ${counts.attendances[0].count} (should be 0)`);
        const adminUser = await this.dataSource.query(`
      SELECT id, email, role FROM users 
      WHERE email = 'admin@zinatalhaykindergarten.com' AND role = 'admin'
    `);
        if (adminUser.length === 0) {
            throw new Error('❌ System admin user was accidentally deleted!');
        }
        console.log('✅ System admin user preserved:', adminUser[0]);
        console.log('✅ Cleanup verification completed successfully!');
    }
    async getPreCleanupSummary() {
        console.log('📋 Pre-cleanup data summary:');
        const summary = {
            users: await this.dataSource.query('SELECT COUNT(*) FROM users'),
            students: await this.dataSource.query('SELECT COUNT(*) FROM students'),
            parents: await this.dataSource.query('SELECT COUNT(*) FROM parents'),
            groups: await this.dataSource.query('SELECT COUNT(*) FROM groups'),
            staff: await this.dataSource.query('SELECT COUNT(*) FROM staff'),
            usersByRole: await this.dataSource.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role 
        ORDER BY role
      `)
        };
        console.log('Current data before cleanup:');
        console.log(`- Total users: ${summary.users[0].count}`);
        console.log(`- Students: ${summary.students[0].count}`);
        console.log(`- Parents: ${summary.parents[0].count}`);
        console.log(`- Groups: ${summary.groups[0].count}`);
        console.log(`- Staff: ${summary.staff[0].count}`);
        console.log('Users by role:');
        summary.usersByRole.forEach((role) => {
            console.log(`  - ${role.role}: ${role.count}`);
        });
        return summary;
    }
}
exports.DataCleanupService = DataCleanupService;
//# sourceMappingURL=data-cleanup.service.js.map