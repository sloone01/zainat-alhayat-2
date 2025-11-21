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

export class DatabaseSeeder {
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
      console.log('School seeded successfully');
    }
  }

  private async seedUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const schoolRepository = this.dataSource.getRepository(School);

    // Get the school ID
    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('School not found. Please seed schools first.');
      return;
    }

    const users = [
      // Admin Users
      {
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
      },
      {
        username: 'director',
        email: 'director@zinatalhaykindergarten.com',
        password: await bcrypt.hash('director123', 10),
        firstName: 'Maryam',
        lastName: 'Al-Rashid',
        role: 'admin' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-11-123-4568',
        address: 'Riyadh, Saudi Arabia'
      },

      // Teacher Users
      {
        username: 'teacher1',
        email: 'fatima.alzahra@zinatalhaykindergarten.com',
        password: await bcrypt.hash('teacher123', 10),
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        role: 'teacher' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-234-5678',
        address: 'Riyadh, Saudi Arabia'
      },
      {
        username: 'teacher2',
        email: 'aisha.mohamed@zinatalhaykindergarten.com',
        password: await bcrypt.hash('teacher123', 10),
        firstName: 'Aisha',
        lastName: 'Mohamed',
        role: 'teacher' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-345-6789',
        address: 'Riyadh, Saudi Arabia'
      },
      {
        username: 'teacher3',
        email: 'sara.abdullah@zinatalhaykindergarten.com',
        password: await bcrypt.hash('teacher123', 10),
        firstName: 'Sara',
        lastName: 'Abdullah',
        role: 'teacher' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-456-7890',
        address: 'Riyadh, Saudi Arabia'
      },
      {
        username: 'teacher4',
        email: 'nour.hassan@zinatalhaykindergarten.com',
        password: await bcrypt.hash('teacher123', 10),
        firstName: 'Nour',
        lastName: 'Hassan',
        role: 'teacher' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-567-8901',
        address: 'Riyadh, Saudi Arabia'
      },

      // Parent Users
      {
        username: 'parent1',
        email: 'ahmed.hassan@example.com',
        password: await bcrypt.hash('parent123', 10),
        firstName: 'Ahmed',
        lastName: 'Hassan',
        role: 'parent' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-678-9012',
        address: 'Al-Malaz District, Riyadh'
      },
      {
        username: 'parent2',
        email: 'omar.salem@example.com',
        password: await bcrypt.hash('parent123', 10),
        firstName: 'Omar',
        lastName: 'Salem',
        role: 'parent' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-789-0123',
        address: 'Al-Olaya District, Riyadh'
      },
      {
        username: 'parent3',
        email: 'khalid.alotaibi@example.com',
        password: await bcrypt.hash('parent123', 10),
        firstName: 'Khalid',
        lastName: 'Al-Otaibi',
        role: 'parent' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-890-1234',
        address: 'King Fahd District, Riyadh'
      },
      {
        username: 'parent4',
        email: 'mohammed.alqahtani@example.com',
        password: await bcrypt.hash('parent123', 10),
        firstName: 'Mohammed',
        lastName: 'Al-Qahtani',
        role: 'parent' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-901-2345',
        address: 'Al-Nakheel District, Riyadh'
      },
      {
        username: 'parent5',
        email: 'abdullah.almutairi@example.com',
        password: await bcrypt.hash('parent123', 10),
        firstName: 'Abdullah',
        lastName: 'Al-Mutairi',
        role: 'parent' as const,
        isActive: true,
        school_id: school.id,
        phone: '+966-50-012-3456',
        address: 'Al-Rawdah District, Riyadh'
      }
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`User ${userData.email} seeded successfully`);
      }
    }
  }

  private async seedAcademicYears(): Promise<void> {
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);
    const schoolRepository = this.dataSource.getRepository(School);

    // Get the school ID
    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('School not found. Please seed schools first.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const academicYears = [
      {
        year: `${currentYear}-${currentYear + 1}`,
        start_date: new Date(`${currentYear}-09-01`),
        end_date: new Date(`${currentYear + 1}-06-30`),
        is_active: true,
        school_id: 1,
        description: 'Current Academic Year'
      },
      {
        year: `${currentYear - 1}-${currentYear}`,
        start_date: new Date(`${currentYear - 1}-09-01`),
        end_date: new Date(`${currentYear}-06-30`),
        is_active: false,
        school_id: 1,
        description: 'Previous Academic Year'
      }
    ];

    for (const yearData of academicYears) {
      const existingYear = await academicYearRepository.findOne({
        where: { year: yearData.year, school_id: yearData.school_id }
      });

      if (!existingYear) {
        const academicYear = academicYearRepository.create(yearData);
        await academicYearRepository.save(academicYear);
        console.log(`Academic Year ${yearData.year} seeded successfully`);
      }
    }
  }

  private async seedRooms(): Promise<void> {
    const roomRepository = this.dataSource.getRepository(Room);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('School not found. Please seed schools first.');
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
      },
      {
        name: 'Garden Room',
        capacity: 20,
        room_type: 'classroom',
        description: 'Nature-themed room for kindergarten students',
        school_id: school.id
      },
      {
        name: 'Star Room',
        capacity: 16,
        room_type: 'classroom',
        description: 'Space-themed room for advanced learners',
        school_id: school.id
      },
      {
        name: 'Art Studio',
        capacity: 12,
        room_type: 'activity',
        description: 'Creative space for art and crafts',
        school_id: school.id
      },
      {
        name: 'Music Room',
        capacity: 25,
        room_type: 'activity',
        description: 'Musical activities and performances',
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
        console.log(`Room ${roomData.name} seeded successfully`);
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
      console.error('Current academic year not found. Please seed academic years first.');
      return;
    }

    const semesters = [
      {
        title: 'First Semester',
        start_date: new Date(`${currentYear}-09-01`),
        end_date: new Date(`${currentYear + 1}-01-15`),
        academic_year_id: currentAcademicYear.id,
        description: 'Fall semester focusing on foundational skills',
        is_active: true
      },
      {
        title: 'Second Semester',
        start_date: new Date(`${currentYear + 1}-01-16`),
        end_date: new Date(`${currentYear + 1}-06-30`),
        academic_year_id: currentAcademicYear.id,
        description: 'Spring semester with advanced learning activities',
        is_active: false
      }
    ];

    for (const semesterData of semesters) {
      const existingSemester = await semesterRepository.findOne({
        where: { title: semesterData.title, academic_year_id: semesterData.academic_year_id }
      });

      if (!existingSemester) {
        const semester = semesterRepository.create(semesterData);
        await semesterRepository.save(semester);
        console.log(`Semester ${semesterData.title} seeded successfully`);
      }
    }
  }

  private async seedStaff(): Promise<void> {
    const staffRepository = this.dataSource.getRepository(Staff);
    const userRepository = this.dataSource.getRepository(User);
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    if (!school) {
      console.error('School not found. Please seed schools first.');
      return;
    }

    // Get teacher users
    const teachers = await userRepository.find({
      where: { role: 'teacher', school_id: school.id }
    });

    const staffData = [
      {
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        position: 'Lead Teacher',
        department: 'Early Childhood Education',
        hireDate: new Date('2022-08-15'),
        salary: 8000,
        isActive: true,
        qualifications: 'Bachelor in Early Childhood Education, 5 years experience',
        specializations: 'Language Development, Creative Arts',
        user: teachers.find(t => t.firstName === 'Fatima'),
        school_id: school.id
      },
      {
        firstName: 'Aisha',
        lastName: 'Mohamed',
        position: 'Senior Teacher',
        department: 'Mathematics & Science',
        hireDate: new Date('2021-09-01'),
        salary: 7500,
        isActive: true,
        qualifications: 'Master in Education, 7 years experience',
        specializations: 'STEM Education, Montessori Method',
        user: teachers.find(t => t.firstName === 'Aisha'),
        school_id: school.id
      },
      {
        firstName: 'Sara',
        lastName: 'Abdullah',
        position: 'Art Teacher',
        department: 'Creative Arts',
        hireDate: new Date('2023-01-10'),
        salary: 6500,
        isActive: true,
        qualifications: 'Bachelor in Fine Arts, 3 years experience',
        specializations: 'Visual Arts, Music, Drama',
        user: teachers.find(t => t.firstName === 'Sara'),
        school_id: school.id
      },
      {
        firstName: 'Nour',
        lastName: 'Hassan',
        position: 'Physical Education Teacher',
        department: 'Physical Education',
        hireDate: new Date('2022-02-14'),
        salary: 6000,
        isActive: true,
        qualifications: 'Bachelor in Physical Education, 4 years experience',
        specializations: 'Motor Skills Development, Sports',
        user: teachers.find(t => t.firstName === 'Nour'),
        school_id: school.id
      }
    ];

    for (const staff of staffData) {
      if (staff.user) {
        // Skip staff creation for now due to user_id type mismatch (UUID vs number)
        console.log(`Skipping staff creation for ${staff.firstName} ${staff.lastName} due to type mismatch`);
        // TODO: Fix Staff entity to use UUID for user_id
      }
    }
  }

  private async seedParents(): Promise<void> {
    const parentRepository = this.dataSource.getRepository(Parent);
    const userRepository = this.dataSource.getRepository(User);

    // Get parent users
    const parentUsers = await userRepository.find({
      where: { role: 'parent' }
    });

    const parentsData = [
      {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@example.com',
        phone: '+966-50-678-9012',
        address: 'Al-Malaz District, Riyadh',
        user: parentUsers.find(u => u.firstName === 'Ahmed')
      },
      {
        firstName: 'Layla',
        lastName: 'Hassan',
        email: 'layla.hassan@example.com',
        phone: '+966-50-678-9013',
        address: 'Al-Malaz District, Riyadh',
        user: null // Mother without user account
      },
      {
        firstName: 'Omar',
        lastName: 'Salem',
        email: 'omar.salem@example.com',
        phone: '+966-50-789-0123',
        address: 'Al-Olaya District, Riyadh',
        user: parentUsers.find(u => u.firstName === 'Omar')
      },
      {
        firstName: 'Fatima',
        lastName: 'Salem',
        email: 'fatima.salem@example.com',
        phone: '+966-50-789-0124',
        address: 'Al-Olaya District, Riyadh',
        user: null // Mother without user account
      },
      {
        firstName: 'Khalid',
        lastName: 'Al-Otaibi',
        email: 'khalid.alotaibi@example.com',
        phone: '+966-50-890-1234',
        address: 'King Fahd District, Riyadh',
        user: parentUsers.find(u => u.firstName === 'Khalid')
      },
      {
        firstName: 'Maryam',
        lastName: 'Al-Otaibi',
        email: 'maryam.alotaibi@example.com',
        phone: '+966-50-890-1235',
        address: 'King Fahd District, Riyadh',
        user: null // Mother without user account
      },
      {
        firstName: 'Mohammed',
        lastName: 'Al-Qahtani',
        email: 'mohammed.alqahtani@example.com',
        phone: '+966-50-901-2345',
        address: 'Al-Nakheel District, Riyadh',
        user: parentUsers.find(u => u.firstName === 'Mohammed')
      },
      {
        firstName: 'Aisha',
        lastName: 'Al-Qahtani',
        email: 'aisha.alqahtani@example.com',
        phone: '+966-50-901-2346',
        address: 'Al-Nakheel District, Riyadh',
        user: null // Mother without user account
      },
      {
        firstName: 'Abdullah',
        lastName: 'Al-Mutairi',
        email: 'abdullah.almutairi@example.com',
        phone: '+966-50-012-3456',
        address: 'Al-Rawdah District, Riyadh',
        user: parentUsers.find(u => u.firstName === 'Abdullah')
      },
      {
        firstName: 'Nour',
        lastName: 'Al-Mutairi',
        email: 'nour.almutairi@example.com',
        phone: '+966-50-012-3457',
        address: 'Al-Rawdah District, Riyadh',
        user: null // Mother without user account
      }
    ];

    for (const parentData of parentsData) {
      const existingParent = await parentRepository.findOne({
        where: { email: parentData.email }
      });

      if (!existingParent) {
        const parent = parentRepository.create({
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          email: parentData.email,
          phone: parentData.phone,
          address: parentData.address,
          user_id: undefined, // Skip user_id for now due to type mismatch
          student_id: 1 // Will be updated when linking students
        });
        await parentRepository.save(parent);
        console.log(`Parent ${parentData.firstName} ${parentData.lastName} seeded successfully`);
      }
    }
  }

  private async seedStudents(): Promise<void> {
    const studentRepository = this.dataSource.getRepository(Student);
    const schoolRepository = this.dataSource.getRepository(School);
    const roomRepository = this.dataSource.getRepository(Room);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    const rooms = await roomRepository.find({
      where: { school_id: school?.id }
    });

    if (!school) {
      console.error('School not found. Please seed schools first.');
      return;
    }

    const studentsData = [
      {
        firstName: 'Yusuf',
        lastName: 'Hassan',
        dateOfBirth: new Date('2019-03-15'),
        gender: 'male' as const,
        address: 'Al-Malaz District, Riyadh',
        emergencyContact: '+966-50-678-9012',
        medicalInfo: 'No known allergies',
        notes: 'Very active and loves building blocks',
        secondName: 'Ahmed',
        thirdName: 'Ali',
        nationality: 'Saudi',
        studentId: 'STU001',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Sunshine Room')?.id
      },
      {
        firstName: 'Zahra',
        lastName: 'Hassan',
        dateOfBirth: new Date('2020-07-22'),
        gender: 'female' as const,
        address: 'Al-Malaz District, Riyadh',
        emergencyContact: '+966-50-678-9012',
        medicalInfo: 'Mild food allergy to nuts',
        notes: 'Loves reading and drawing',
        secondName: 'Ahmed',
        thirdName: 'Ali',
        nationality: 'Saudi',
        studentId: 'STU002',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Rainbow Room')?.id
      },
      {
        firstName: 'Khalid',
        lastName: 'Salem',
        dateOfBirth: new Date('2018-11-08'),
        gender: 'male' as const,
        address: 'Al-Olaya District, Riyadh',
        emergencyContact: '+966-50-789-0123',
        medicalInfo: 'Asthma - has inhaler',
        notes: 'Excellent at mathematics and puzzles',
        secondName: 'Omar',
        thirdName: 'Mohammed',
        nationality: 'Saudi',
        studentId: 'STU003',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Garden Room')?.id
      },
      {
        firstName: 'Lina',
        lastName: 'Al-Otaibi',
        dateOfBirth: new Date('2019-05-12'),
        gender: 'female' as const,
        address: 'King Fahd District, Riyadh',
        emergencyContact: '+966-50-890-1234',
        medicalInfo: 'No known medical conditions',
        notes: 'Very social and loves group activities',
        secondName: 'Khalid',
        thirdName: 'Abdullah',
        nationality: 'Saudi',
        studentId: 'STU004',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Rainbow Room')?.id
      },
      {
        firstName: 'Omar',
        lastName: 'Al-Qahtani',
        dateOfBirth: new Date('2020-01-30'),
        gender: 'male' as const,
        address: 'Al-Nakheel District, Riyadh',
        emergencyContact: '+966-50-901-2345',
        medicalInfo: 'No known allergies',
        notes: 'Loves music and singing',
        secondName: 'Mohammed',
        thirdName: 'Salem',
        nationality: 'Saudi',
        studentId: 'STU005',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Sunshine Room')?.id
      },
      {
        firstName: 'Nora',
        lastName: 'Al-Mutairi',
        dateOfBirth: new Date('2019-09-18'),
        gender: 'female' as const,
        address: 'Al-Rawdah District, Riyadh',
        emergencyContact: '+966-50-012-3456',
        medicalInfo: 'Lactose intolerant',
        notes: 'Creative and artistic, loves painting',
        secondName: 'Abdullah',
        thirdName: 'Fahad',
        nationality: 'Saudi',
        studentId: 'STU006',
        photo: undefined,
        school_id: school.id,
        room_id: rooms.find(r => r.name === 'Star Room')?.id
      }
    ];

    for (const studentData of studentsData) {
      const existingStudent = await studentRepository.findOne({
        where: { studentId: studentData.studentId }
      });

      if (!existingStudent) {
        const student = studentRepository.create(studentData);
        await studentRepository.save(student);
        console.log(`Student ${studentData.firstName} ${studentData.lastName} seeded successfully`);
      }
    }
  }

  private async seedGroups(): Promise<void> {
    const groupRepository = this.dataSource.getRepository(Group);
    const schoolRepository = this.dataSource.getRepository(School);
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    const currentAcademicYear = await academicYearRepository.findOne({
      where: { is_active: true }
    });

    if (!school || !currentAcademicYear) {
      console.error('School or Academic Year not found. Please seed them first.');
      return;
    }

    const groupsData = [
      {
        name: 'Little Stars',
        description: 'Age group 2-3 years - Early development and basic skills',
        age_range_min: 2,
        age_range_max: 3,
        capacity: 15,
        is_active: true,
        school_id: school.id,
        color: '#FFD700',
        status: 'active',
        studentCount: 0,
        teacherCount: 1
      },
      {
        name: 'Bright Minds',
        description: 'Age group 3-4 years - Language and social skills development',
        age_range_min: 3,
        age_range_max: 4,
        capacity: 18,
        is_active: true,
        school_id: school.id,
        color: '#FF6B6B',
        status: 'active',
        studentCount: 0,
        teacherCount: 1
      },
      {
        name: 'Future Leaders',
        description: 'Age group 4-5 years - Pre-academic skills and independence',
        age_range_min: 4,
        age_range_max: 5,
        capacity: 20,
        is_active: true,
        school_id: school.id,
        color: '#4ECDC4',
        status: 'active',
        studentCount: 0,
        teacherCount: 1
      },
      {
        name: 'Creative Explorers',
        description: 'Mixed age group for creative and artistic activities',
        age_range_min: 3,
        age_range_max: 5,
        capacity: 16,
        is_active: true,
        school_id: school.id,
        color: '#45B7D1',
        status: 'active',
        studentCount: 0,
        teacherCount: 1
      }
    ];

    for (const groupData of groupsData) {
      const existingGroup = await groupRepository.findOne({
        where: { name: groupData.name, school_id: groupData.school_id }
      });

      if (!existingGroup) {
        const group = groupRepository.create(groupData);
        await groupRepository.save(group);
        console.log(`Group ${groupData.name} seeded successfully`);
      }
    }
  }

  private async seedCourses(): Promise<void> {
    const courseRepository = this.dataSource.getRepository(Course);
    const schoolRepository = this.dataSource.getRepository(School);
    const academicYearRepository = this.dataSource.getRepository(AcademicYear);

    const school = await schoolRepository.findOne({
      where: { name: 'Zinat Al-Haya Kindergarten' }
    });

    const currentAcademicYear = await academicYearRepository.findOne({
      where: { is_active: true }
    });

    if (!school || !currentAcademicYear) {
      console.error('School or Academic Year not found. Please seed them first.');
      return;
    }

    const coursesData = [
      {
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
      },
      {
        name: 'Mathematics Foundations',
        title: 'Mathematics Foundations',
        description: 'Number recognition, counting, basic math concepts',
        category: 'Mathematics',
        status: 'active',
        age_group_min: 3,
        age_group_max: 5,
        is_active: true,
        color_code: '#4ECDC4',
        icon: '🔢',
        send_notifications: true,
        estimated_duration_weeks: 36,
        totalDuration: 36,
        learning_objectives: 'Learn numbers, counting, shapes, patterns, and basic operations',
        prerequisites: 'Basic attention span',
        materials_needed: 'Counting blocks, number cards, shape puzzles',
        targetAgeGroup: '3-5 years',
        difficultyLevel: 'Beginner',
        maxStudents: 18,
        school_id: school.id,
        academic_year_id: currentAcademicYear.id
      },
      {
        name: 'Creative Arts',
        title: 'Creative Arts',
        description: 'Art, music, drama, and creative expression',
        category: 'Arts',
        status: 'active',
        age_group_min: 2,
        age_group_max: 5,
        is_active: true,
        color_code: '#96CEB4',
        icon: '🎨',
        send_notifications: true,
        estimated_duration_weeks: 36,
        totalDuration: 36,
        learning_objectives: 'Develop creativity, fine motor skills, and artistic expression',
        prerequisites: 'None',
        materials_needed: 'Art supplies, musical instruments, costumes',
        targetAgeGroup: '2-5 years',
        difficultyLevel: 'Beginner',
        maxStudents: 15,
        school_id: school.id,
        academic_year_id: currentAcademicYear.id
      },
      {
        name: 'Physical Development',
        title: 'Physical Development',
        description: 'Gross and fine motor skills, physical fitness',
        category: 'Physical Education',
        status: 'active',
        age_group_min: 2,
        age_group_max: 5,
        is_active: true,
        color_code: '#FFEAA7',
        icon: '🏃',
        send_notifications: true,
        estimated_duration_weeks: 36,
        totalDuration: 36,
        learning_objectives: 'Develop motor skills, coordination, and physical fitness',
        prerequisites: 'None',
        materials_needed: 'Sports equipment, playground, exercise mats',
        targetAgeGroup: '2-5 years',
        difficultyLevel: 'Beginner',
        maxStudents: 25,
        school_id: school.id,
        academic_year_id: currentAcademicYear.id
      },
      {
        name: 'Social Skills',
        title: 'Social Skills',
        description: 'Interaction, sharing, cooperation, and emotional development',
        category: 'Social Development',
        status: 'active',
        age_group_min: 2,
        age_group_max: 5,
        is_active: true,
        color_code: '#DDA0DD',
        icon: '👥',
        send_notifications: true,
        estimated_duration_weeks: 36,
        totalDuration: 36,
        learning_objectives: 'Learn cooperation, empathy, communication, and conflict resolution',
        prerequisites: 'None',
        materials_needed: 'Group games, role-play materials, books about emotions',
        targetAgeGroup: '2-5 years',
        difficultyLevel: 'Beginner',
        maxStudents: 20,
        school_id: school.id,
        academic_year_id: currentAcademicYear.id
      }
    ];

    for (const courseData of coursesData) {
      const existingCourse = await courseRepository.findOne({
        where: { name: courseData.name, school_id: courseData.school_id }
      });

      if (!existingCourse) {
        const course = courseRepository.create(courseData);
        await courseRepository.save(course);
        console.log(`Course ${courseData.name} seeded successfully`);
      }
    }
  }

  private async linkStudentsToParents(): Promise<void> {
    const studentRepository = this.dataSource.getRepository(Student);
    const parentRepository = this.dataSource.getRepository(Parent);

    // Define parent-student relationships
    const relationships = [
      { studentName: 'Yusuf Hassan', parentNames: ['Ahmed Hassan', 'Layla Hassan'] },
      { studentName: 'Zahra Hassan', parentNames: ['Ahmed Hassan', 'Layla Hassan'] },
      { studentName: 'Khalid Salem', parentNames: ['Omar Salem', 'Fatima Salem'] },
      { studentName: 'Lina Al-Otaibi', parentNames: ['Khalid Al-Otaibi', 'Maryam Al-Otaibi'] },
      { studentName: 'Omar Al-Qahtani', parentNames: ['Mohammed Al-Qahtani', 'Aisha Al-Qahtani'] },
      { studentName: 'Nora Al-Mutairi', parentNames: ['Abdullah Al-Mutairi', 'Nour Al-Mutairi'] }
    ];

    for (const relationship of relationships) {
      const [firstName, lastName] = relationship.studentName.split(' ');
      const student = await studentRepository.findOne({
        where: { firstName, lastName },
        relations: ['parents']
      });

      if (student) {
        for (const parentName of relationship.parentNames) {
          const [parentFirstName, parentLastName] = parentName.split(' ');
          const parent = await parentRepository.findOne({
            where: { firstName: parentFirstName, lastName: parentLastName },
            relations: ['students']
          });

          if (parent) {
            // Check if relationship already exists
            const existingRelation = student.parents?.find(p => p.id === parent.id);
            if (!existingRelation) {
              if (!student.parents) student.parents = [];
              student.parents.push(parent);
              await studentRepository.save(student);
              console.log(`Linked ${parentName} to ${relationship.studentName}`);
            }
          }
        }
      }
    }
  }

  private async linkStudentsToGroups(): Promise<void> {
    const studentRepository = this.dataSource.getRepository(Student);
    const groupRepository = this.dataSource.getRepository(Group);

    // Define student-group assignments based on age
    const assignments = [
      { studentName: 'Yusuf Hassan', groupName: 'Bright Minds' }, // 4 years old
      { studentName: 'Zahra Hassan', groupName: 'Little Stars' }, // 3 years old
      { studentName: 'Khalid Salem', groupName: 'Future Leaders' }, // 5 years old
      { studentName: 'Lina Al-Otaibi', groupName: 'Bright Minds' }, // 4 years old
      { studentName: 'Omar Al-Qahtani', groupName: 'Little Stars' }, // 3 years old
      { studentName: 'Nora Al-Mutairi', groupName: 'Creative Explorers' } // 4 years old
    ];

    for (const assignment of assignments) {
      const [firstName, lastName] = assignment.studentName.split(' ');
      const student = await studentRepository.findOne({
        where: { firstName, lastName },
        relations: ['groups']
      });

      const group = await groupRepository.findOne({
        where: { name: assignment.groupName }
      });

      if (student && group) {
        // Check if relationship already exists
        const existingRelation = student.groups?.find(g => g.id === group.id);
        if (!existingRelation) {
          if (!student.groups) student.groups = [];
          student.groups.push(group);
          await studentRepository.save(student);

          // Update group student count
          group.studentCount = (group.studentCount || 0) + 1;
          await groupRepository.save(group);

          console.log(`Assigned ${assignment.studentName} to ${assignment.groupName}`);
        }
      }
    }
  }
}