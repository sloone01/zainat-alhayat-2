"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelDatabaseSeeder = void 0;
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const school_entity_1 = require("../entities/school.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
const semester_entity_1 = require("../entities/semester.entity");
const course_entity_1 = require("../entities/course.entity");
const room_entity_1 = require("../entities/room.entity");
const excel_import_service_1 = require("../services/excel-import.service");
const data_cleanup_service_1 = require("../services/data-cleanup.service");
class ExcelDatabaseSeeder {
    dataSource;
    cleanupService;
    excelImportService;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.cleanupService = new data_cleanup_service_1.DataCleanupService(dataSource);
        this.excelImportService = new excel_import_service_1.ExcelImportService(dataSource);
    }
    async run() {
        console.log('🌸 Starting Zinat Al-Haya Database Seeding with Excel Import...');
        await this.cleanupService.getPreCleanupSummary();
        await this.cleanupService.cleanExistingData();
        await this.cleanupService.verifyCleanup();
        await this.seedSchools();
        await this.seedRooms();
        await this.seedSystemAdmin();
        await this.seedAcademicYears();
        await this.seedSemesters();
        await this.seedCourses();
        await this.excelImportService.importFromExcelFiles();
        await this.showFinalSummary();
        console.log('🎉 Database seeding with Excel import completed successfully!');
    }
    async seedSchools() {
        const schoolRepository = this.dataSource.getRepository(school_entity_1.School);
        const schoolData = {
            name: 'Zinat Al-Haya Kindergarten',
            address: 'Muscat, Sultanate of Oman',
            phone: '+968-2234-5678',
            email: 'info@zinatalhaykindergarten.com',
            website: 'www.zinatalhaykindergarten.com',
            principal: 'Maryam Al-Rashid',
            established_year: 2020,
            is_active: true
        };
        const existingSchool = await schoolRepository.findOne({
            where: { name: schoolData.name }
        });
        if (!existingSchool) {
            const school = schoolRepository.create(schoolData);
            await schoolRepository.save(school);
            console.log('✅ School seeded successfully');
        }
        else {
            console.log('✅ School already exists');
        }
    }
    async seedSystemAdmin() {
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
        const schoolRepository = this.dataSource.getRepository(school_entity_1.School);
        const school = await schoolRepository.findOne({
            where: { name: 'Zinat Al-Haya Kindergarten' }
        });
        if (!school) {
            throw new Error('School not found. Please seed schools first.');
        }
        const adminData = {
            username: 'admin',
            email: 'admin@zinatalhaykindergarten.com',
            password: await bcrypt.hash('admin123', 10),
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            phone: '+968-9999-9999',
            isActive: true,
            school_id: school.id
        };
        const existingAdmin = await userRepository.findOne({
            where: { email: adminData.email }
        });
        if (!existingAdmin) {
            const admin = userRepository.create(adminData);
            await userRepository.save(admin);
            console.log('✅ System Administrator created successfully');
        }
        else {
            console.log('✅ System Administrator already exists');
        }
    }
    async seedRooms() {
        const roomRepository = this.dataSource.getRepository(room_entity_1.Room);
        const schoolRepository = this.dataSource.getRepository(school_entity_1.School);
        const school = await schoolRepository.findOne({
            where: { name: 'Zinat Al-Haya Kindergarten' }
        });
        if (!school) {
            throw new Error('School not found. Please seed schools first.');
        }
        const rooms = [
            {
                name: 'Sunshine Room',
                capacity: 20,
                room_type: 'classroom',
                description: 'Bright classroom for young learners',
                equipment: 'Interactive whiteboard, toys, books',
                is_active: true,
                school_id: school.id
            },
            {
                name: 'Rainbow Room',
                capacity: 18,
                room_type: 'classroom',
                description: 'Colorful learning environment',
                equipment: 'Art supplies, educational games',
                is_active: true,
                school_id: school.id
            },
            {
                name: 'Garden Room',
                capacity: 22,
                room_type: 'classroom',
                description: 'Nature-themed classroom',
                equipment: 'Plants, nature books, magnifying glasses',
                is_active: true,
                school_id: school.id
            },
            {
                name: 'Star Room',
                capacity: 25,
                room_type: 'classroom',
                description: 'Space-themed learning area',
                equipment: 'Telescope, star charts, science kits',
                is_active: true,
                school_id: school.id
            },
            {
                name: 'Art Studio',
                capacity: 15,
                room_type: 'special',
                description: 'Creative arts and crafts room',
                equipment: 'Easels, paints, brushes, clay',
                is_active: true,
                school_id: school.id
            },
            {
                name: 'Music Room',
                capacity: 20,
                room_type: 'special',
                description: 'Music and movement activities',
                equipment: 'Piano, drums, musical instruments',
                is_active: true,
                school_id: school.id
            }
        ];
        for (const roomData of rooms) {
            const existingRoom = await roomRepository.findOne({
                where: { name: roomData.name, school_id: school.id }
            });
            if (!existingRoom) {
                const room = roomRepository.create(roomData);
                await roomRepository.save(room);
                console.log(`✅ Room ${roomData.name} seeded successfully`);
            }
        }
    }
    async seedAcademicYears() {
        const academicYearRepository = this.dataSource.getRepository(academic_year_entity_1.AcademicYear);
        const academicYears = [
            {
                year: '2024-2025',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2025-06-30'),
                is_current: true,
                is_active: true
            },
            {
                year: '2025-2026',
                start_date: new Date('2025-09-01'),
                end_date: new Date('2026-06-30'),
                is_current: false,
                is_active: false
            }
        ];
        for (const yearData of academicYears) {
            const existingYear = await academicYearRepository.findOne({
                where: { year: yearData.year }
            });
            if (!existingYear) {
                const academicYear = academicYearRepository.create(yearData);
                await academicYearRepository.save(academicYear);
                console.log(`✅ Academic Year ${yearData.year} seeded successfully`);
            }
        }
    }
    async seedSemesters() {
        const semesterRepository = this.dataSource.getRepository(semester_entity_1.Semester);
        const academicYearRepository = this.dataSource.getRepository(academic_year_entity_1.AcademicYear);
        const currentYear = await academicYearRepository.findOne({
            where: { year: '2024-2025' }
        });
        if (!currentYear) {
            throw new Error('Current academic year not found');
        }
        const semesters = [
            {
                title: 'First Semester',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2025-01-31'),
                is_active: true,
                academic_year_id: currentYear.id
            },
            {
                title: 'Second Semester',
                start_date: new Date('2025-02-01'),
                end_date: new Date('2025-06-30'),
                is_active: true,
                academic_year_id: currentYear.id
            }
        ];
        for (const semesterData of semesters) {
            const existingSemester = await semesterRepository.findOne({
                where: { title: semesterData.title, academic_year_id: currentYear.id }
            });
            if (!existingSemester) {
                const semester = semesterRepository.create(semesterData);
                await semesterRepository.save(semester);
                console.log(`✅ Semester ${semesterData.title} seeded successfully`);
            }
        }
    }
    async seedCourses() {
        const courseRepository = this.dataSource.getRepository(course_entity_1.Course);
        const courses = [
            {
                name: 'Language Development',
                description: 'Arabic and English language skills development for young children',
                category: 'language',
                is_active: true,
                duration_weeks: 36,
                age_group: '2-6 years'
            },
            {
                name: 'Mathematics Foundations',
                description: 'Basic numeracy and mathematical concepts',
                category: 'mathematics',
                is_active: true,
                duration_weeks: 36,
                age_group: '3-6 years'
            },
            {
                name: 'Creative Arts',
                description: 'Art, music, and creative expression activities',
                category: 'arts',
                is_active: true,
                duration_weeks: 36,
                age_group: '2-6 years'
            },
            {
                name: 'Physical Development',
                description: 'Motor skills and physical fitness activities',
                category: 'physical',
                is_active: true,
                duration_weeks: 36,
                age_group: '2-6 years'
            },
            {
                name: 'Social Skills',
                description: 'Social interaction and emotional development',
                category: 'social',
                is_active: true,
                duration_weeks: 36,
                age_group: '2-6 years'
            }
        ];
        for (const courseData of courses) {
            const existingCourse = await courseRepository.findOne({
                where: { name: courseData.name }
            });
            if (!existingCourse) {
                const course = courseRepository.create(courseData);
                await courseRepository.save(course);
                console.log(`✅ Course ${courseData.name} seeded successfully`);
            }
        }
    }
    async showFinalSummary() {
        const summary = await this.excelImportService.getImportSummary();
        console.log('\n📊 Final Database Summary:');
        console.log('='.repeat(40));
        console.log(`👥 Total Users: ${summary.users}`);
        console.log(`👩‍🏫 Teachers: ${summary.teachers}`);
        console.log(`👨‍👩‍👧‍👦 Parents: ${summary.parents}`);
        console.log(`👶 Students: ${summary.students}`);
        console.log(`🏫 Groups: ${summary.groups}`);
        console.log('='.repeat(40));
        const groupDetails = await this.dataSource.query(`
      SELECT g.name, g.age_range_min, g.age_range_max, COUNT(sg.student_id) as student_count
      FROM groups g
      LEFT JOIN student_groups sg ON g.id = sg.group_id
      GROUP BY g.id, g.name, g.age_range_min, g.age_range_max
      ORDER BY g.age_range_min, g.name
    `);
        console.log('\n🏫 Groups Created from Excel:');
        groupDetails.forEach((group) => {
            console.log(`  - ${group.name} (Age ${group.age_range_min}-${group.age_range_max}): ${group.student_count} students`);
        });
        console.log('\n✅ Excel import verification completed!');
    }
}
exports.ExcelDatabaseSeeder = ExcelDatabaseSeeder;
//# sourceMappingURL=excel-seed.js.map