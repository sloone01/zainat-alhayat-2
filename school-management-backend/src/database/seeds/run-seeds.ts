import { AppDataSource } from '../../data-source';
import { User } from '../../entities/user.entity';
import { School } from '../../entities/school.entity';
import { Room } from '../../entities/room.entity';
import { Group } from '../../entities/group.entity';
import { Course } from '../../entities/course.entity';
import { Phase } from '../../entities/phase.entity';
import { Milestone } from '../../entities/milestone.entity';
import * as bcrypt from 'bcryptjs';

async function runSeeds() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('🌱 Starting database seeding...');

    // Create school
    const schoolRepository = AppDataSource.getRepository(School);
    const school = schoolRepository.create({
      name: 'روضة زينة الحياة - Zinat Al-Haya Kindergarten',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966-11-123-4567',
      email: 'info@zinat-alhaya.edu.sa',
      website: 'https://zinat-alhaya.edu.sa',
      established_date: new Date('2020-01-01'),
      description: 'نرعى العقول الصغيرة، ننمي المستقبل المشرق - Nurturing young minds, growing bright futures'
    });
    const savedSchool = await schoolRepository.save(school);
    console.log('✅ School created');

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = userRepository.create({
      username: 'admin',
      email: 'admin@zinat-alhaya.edu.sa',
      password: hashedPassword,
      firstName: 'مدير',
      lastName: 'النظام',
      role: 'admin',
      phone: '+966-50-123-4567',
      isActive: true,
      school_id: savedSchool.id
    });
    const savedAdmin = await userRepository.save(adminUser);
    console.log('✅ Admin user created');

    // Create teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const teacherUser = userRepository.create({
      username: 'teacher1',
      email: 'teacher@zinat-alhaya.edu.sa',
      password: teacherPassword,
      firstName: 'فاطمة',
      lastName: 'أحمد',
      role: 'teacher',
      phone: '+966-50-234-5678',
      isActive: true,
      school_id: savedSchool.id
    });
    const savedTeacher = await userRepository.save(teacherUser);
    console.log('✅ Teacher user created');

    // Create parent user
    const parentPassword = await bcrypt.hash('parent123', 12);
    const parentUser = userRepository.create({
      username: 'parent1',
      email: 'parent@example.com',
      password: parentPassword,
      firstName: 'محمد',
      lastName: 'السعيد',
      role: 'parent',
      phone: '+966-50-345-6789',
      isActive: true,
      school_id: savedSchool.id
    });
    await userRepository.save(parentUser);
    console.log('✅ Parent user created');

    // Create rooms
    const roomRepository = AppDataSource.getRepository(Room);
    const rooms = [
      { name: 'قاعة الورود - Rose Room', capacity: 15, room_type: 'classroom', description: 'قاعة مخصصة للأطفال الصغار' },
      { name: 'قاعة النجوم - Star Room', capacity: 20, room_type: 'classroom', description: 'قاعة للأنشطة التعليمية' },
      { name: 'قاعة الألعاب - Play Room', capacity: 25, room_type: 'activity', description: 'قاعة الألعاب والأنشطة الترفيهية' },
      { name: 'المكتبة - Library', capacity: 12, room_type: 'library', description: 'مكتبة الأطفال' }
    ];

    const savedRooms: Room[] = [];
    for (const roomData of rooms) {
      const room = roomRepository.create({
        ...roomData,
        school_id: savedSchool.id
      });
      const savedRoom = await roomRepository.save(room);
      savedRooms.push(savedRoom);
    }
    console.log('✅ Rooms created');

    // Create groups
    const groupRepository = AppDataSource.getRepository(Group);
    const groups = [
      { name: 'مجموعة الفراشات - Butterflies', description: 'للأطفال من 3-4 سنوات', age_range_min: 3, age_range_max: 4, capacity: 15 },
      { name: 'مجموعة النحل - Bees', description: 'للأطفال من 4-5 سنوات', age_range_min: 4, age_range_max: 5, capacity: 18 },
      { name: 'مجموعة الطيور - Birds', description: 'للأطفال من 5-6 سنوات', age_range_min: 5, age_range_max: 6, capacity: 20 }
    ];

    const savedGroups: Group[] = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groupRepository.create({
        ...groups[i],
        school_id: savedSchool.id
      });
      const savedGroup = await groupRepository.save(group);
      savedGroups.push(savedGroup);
    }
    console.log('✅ Groups created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👨‍💼 Admin: admin / admin123');
    console.log('👩‍🏫 Teacher: teacher1 / teacher123');
    console.log('👨‍👩‍👧‍👦 Parent: parent1 / parent123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();
