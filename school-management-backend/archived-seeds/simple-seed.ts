import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { Semester } from '../entities/semester.entity';
import { Course } from '../entities/course.entity';
import { Room } from '../entities/room.entity';

export class SimpleDatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌸 Starting Simple Database Seeding...');

    // Seed essential data only
    await this.seedSchools();
    await this.seedRooms();
    await this.seedSystemAdmin();
    await this.seedAcademicYears();
    await this.seedSemesters();
    await this.seedCourses();

    console.log('🎉 Simple database seeding completed successfully!');
  }

  private async seedSchools(): Promise<void> {
    const schoolRepository = this.dataSource.getRepository(School);

    const existingSchool = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });
    
    if (!existingSchool) {
      const school = schoolRepository.create({
        name: 'Zinat Al-Haya Kindergarten',
        address: 'Main Street, City Center',
        phone: '+1234567890',
        email: 'info@zinatalhaykindergarten.com',
        website: 'www.zinatalhaykindergarten.com',
        established_date: new Date('2020-09-01'),
        description: 'A premier kindergarten focused on early childhood development'
      });

      await schoolRepository.save(school);
      console.log('✅ School seeded successfully');
    }
  }

  private async seedSystemAdmin(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('❌ School not found. Please seed schools first.');
      return;
    }

    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@zinatalhaykindergarten.com' }
    });

    if (!existingAdmin) {
      const admin = userRepository.create({
        username: 'admin',
        email: 'admin@zinatalhaykindergarten.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-11-123-4567',
        address: 'Main Office, Zinat Al-Haya Kindergarten'
      });

      await userRepository.save(admin);
      console.log('✅ System admin seeded successfully');
    }
  }

  private async seedAcademicYears(): Promise<void> {
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('❌ School not found.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const academicYear = {
      year: `${currentYear}-${currentYear + 1}`,
      start_date: new Date(`${currentYear}-09-01`),
      end_date: new Date(`${currentYear + 1}-06-30`),
      is_active: true,
      school_id: school.id,
      description: 'Current Academic Year'
    };

    const existingYear = await academicYearRepository.findOne({
      where: { year: academicYear.year, school_id: academicYear.school_id }
    });

    if (!existingYear) {
      const year = academicYearRepository.create(academicYear);
      await academicYearRepository.save(year);
      console.log(`✅ Academic Year ${academicYear.year} seeded successfully`);
    }
  }

  private async seedRooms(): Promise<void> {
    const roomRepository = this.dataSource.getRepository(Room);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('❌ School not found.');
      return;
    }

    const rooms = [
      {
        name: 'Sunshine Room',
        capacity: 15,
        room_type: 'classroom',
        description: 'Bright and cheerful room for toddlers',
        school_id: school.id
      },
      {
        name: 'Rainbow Room',
        capacity: 18,
        room_type: 'classroom',
        description: 'Colorful learning space for preschoolers',
        school_id: school.id
      }
    ];

    for (const roomData of rooms) {
      const existingRoom = await roomRepository.findOne({
        where: { name: roomData.name, school_id: roomData.school_id }
      });

      if (!existingRoom) {
        const room = roomRepository.create(roomData);
        await roomRepository.save(room);
        console.log(`✅ Room ${roomData.name} seeded successfully`);
      }
    }
  }

  private async seedSemesters(): Promise<void> {
    const semesterRepository = this.dataSource.getRepository(Semester);
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

    const currentYear = new Date().getFullYear();
    const currentAcademicYear = await academicYearRepository.findOne({
      where: { year: `${currentYear}-${currentYear + 1}`, is_active: true }
    });

    if (!currentAcademicYear) {
      console.error('❌ Current academic year not found.');
      return;
    }

    const semester = {
      title: 'First Semester',
      start_date: new Date(`${currentYear}-09-01`),
      end_date: new Date(`${currentYear + 1}-01-15`),
      academic_year_id: currentAcademicYear.id,
      description: 'Fall semester focusing on foundational skills',
      is_active: true
    };

    const existingSemester = await semesterRepository.findOne({
      where: { title: semester.title, academic_year_id: semester.academic_year_id }
    });

    if (!existingSemester) {
      const sem = semesterRepository.create(semester);
      await semesterRepository.save(sem);
      console.log(`✅ Semester ${semester.title} seeded successfully`);
    }
  }

  private async seedCourses(): Promise<void> {
    const courseRepository = this.dataSource.getRepository(Course);
    const schoolRepository = this.dataSource.getRepository(School);
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    const currentYear = new Date().getFullYear();
    const currentAcademicYear = await academicYearRepository.findOne({
      where: { year: `${currentYear}-${currentYear + 1}`, is_active: true }
    });

    if (!school || !currentAcademicYear) {
      console.error('❌ School or Academic Year not found.');
      return;
    }

    const course = {
      name: 'Language Development',
      title: 'Language Development',
      description: 'Building vocabulary, communication skills, and early literacy',
      category: 'Language Arts',
      status: 'active',
      age_group_min: 2,
      age_group_max: 5,
      is_active: true,
      color_code: '#FF6B6B',
      icon: '📚',
      send_notifications: true,
      estimated_duration_weeks: 36,
      totalDuration: 36,
      learning_objectives: 'Develop speaking, listening, reading readiness, and writing skills',
      prerequisites: 'None',
      materials_needed: 'Books, flashcards, writing materials',
      targetAgeGroup: '2-5 years',
      difficultyLevel: 'Beginner',
      maxStudents: 20,
      school_id: school.id,
      academic_year_id: currentAcademicYear.id
    };

    const existingCourse = await courseRepository.findOne({
      where: { name: course.name, school_id: course.school_id }
    });

    if (!existingCourse) {
      const courseEntity = courseRepository.create(course);
      await courseRepository.save(courseEntity);
      console.log(`✅ Course ${course.name} seeded successfully`);
    }
  }
}
