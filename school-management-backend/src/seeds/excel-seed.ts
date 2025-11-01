import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { Semester } from '../entities/semester.entity';
import { Course } from '../entities/course.entity';
import { Room } from '../entities/room.entity';
import { ExcelImportService } from '../services/excel-import.service';
import { DataCleanupService } from '../services/data-cleanup.service';

export class ExcelDatabaseSeeder {
  private cleanupService: DataCleanupService;
  private excelImportService: ExcelImportService;

  constructor(private dataSource: DataSource) {
    this.cleanupService = new DataCleanupService(dataSource);
    this.excelImportService = new ExcelImportService(dataSource);
  }

  async run(): Promise<void> {
    console.log('🌸 Starting Zinat Al-Haya Database Seeding with Excel Import...');
    
    // Get pre-cleanup summary
    await this.cleanupService.getPreCleanupSummary();
    
    // Clean existing data (keep only essential data)
    await this.cleanupService.cleanExistingData();
    await this.cleanupService.verifyCleanup();
    
    // Seed essential data (schools, rooms, academic years, etc.)
    await this.seedSchools();
    await this.seedRooms();
    await this.seedSystemAdmin(); // Only create system admin
    await this.seedAcademicYears();
    await this.seedSemesters();
    await this.seedCourses();
    
    // Import Excel data (teachers, students, parents, groups)
    await this.excelImportService.importFromExcelFiles();
    
    // Show final summary
    await this.showFinalSummary();
    
    console.log('🎉 Database seeding with Excel import completed successfully!');
  }

  private async seedSchools(): Promise<void> {
    const schoolRepository = this.dataSource.getRepository(School);

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
    } else {
      console.log('✅ School already exists');
    }
  }

  private async seedSystemAdmin(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      throw new Error('School not found. Please seed schools first.');
    }

    // Only create system admin user
    const adminData = {
      username: 'admin',
      email: 'admin@zinatalhaykindergarten.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin' as const,
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
    } else {
      console.log('✅ System Administrator already exists');
    }
  }

  private async seedRooms(): Promise<void> {
    const roomRepository = this.dataSource.getRepository(Room);
    const schoolRepository = this.dataSource.getRepository(School);

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

  private async seedAcademicYears(): Promise<void> {
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

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

  private async seedSemesters(): Promise<void> {
    const semesterRepository = this.dataSource.getRepository(Semester);
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

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

  private async seedCourses(): Promise<void> {
    const courseRepository = this.dataSource.getRepository(Course);

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

  private async showFinalSummary(): Promise<void> {
    const summary = await this.excelImportService.getImportSummary();

    console.log('\n📊 Final Database Summary:');
    console.log('='.repeat(40));
    console.log(`👥 Total Users: ${summary.users}`);
    console.log(`👩‍🏫 Teachers: ${summary.teachers}`);
    console.log(`👨‍👩‍👧‍👦 Parents: ${summary.parents}`);
    console.log(`👶 Students: ${summary.students}`);
    console.log(`🏫 Groups: ${summary.groups}`);
    console.log('='.repeat(40));

    // Verify Excel files were processed
    const groupDetails = await this.dataSource.query(`
      SELECT g.name, g.age_range_min, g.age_range_max, COUNT(sg.student_id) as student_count
      FROM groups g
      LEFT JOIN student_groups sg ON g.id = sg.group_id
      GROUP BY g.id, g.name, g.age_range_min, g.age_range_max
      ORDER BY g.age_range_min, g.name
    `);

    console.log('\n🏫 Groups Created from Excel:');
    groupDetails.forEach((group: any) => {
      console.log(`  - ${group.name} (Age ${group.age_range_min}-${group.age_range_max}): ${group.student_count} students`);
    });

    console.log('\n✅ Excel import verification completed!');
  }
}