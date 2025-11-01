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
const data_source_1 = require("../../data-source");
const user_entity_1 = require("../../entities/user.entity");
const school_entity_1 = require("../../entities/school.entity");
const room_entity_1 = require("../../entities/room.entity");
const group_entity_1 = require("../../entities/group.entity");
const bcrypt = __importStar(require("bcryptjs"));
async function runSeeds() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('🌱 Starting database seeding...');
        const schoolRepository = data_source_1.AppDataSource.getRepository(school_entity_1.School);
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
        const userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
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
        const roomRepository = data_source_1.AppDataSource.getRepository(room_entity_1.Room);
        const rooms = [
            { name: 'قاعة الورود - Rose Room', capacity: 15, room_type: 'classroom', description: 'قاعة مخصصة للأطفال الصغار' },
            { name: 'قاعة النجوم - Star Room', capacity: 20, room_type: 'classroom', description: 'قاعة للأنشطة التعليمية' },
            { name: 'قاعة الألعاب - Play Room', capacity: 25, room_type: 'activity', description: 'قاعة الألعاب والأنشطة الترفيهية' },
            { name: 'المكتبة - Library', capacity: 12, room_type: 'library', description: 'مكتبة الأطفال' }
        ];
        const savedRooms = [];
        for (const roomData of rooms) {
            const room = roomRepository.create({
                ...roomData,
                school_id: savedSchool.id
            });
            const savedRoom = await roomRepository.save(room);
            savedRooms.push(savedRoom);
        }
        console.log('✅ Rooms created');
        const groupRepository = data_source_1.AppDataSource.getRepository(group_entity_1.Group);
        const groups = [
            { name: 'مجموعة الفراشات - Butterflies', description: 'للأطفال من 3-4 سنوات', age_range_min: 3, age_range_max: 4, capacity: 15 },
            { name: 'مجموعة النحل - Bees', description: 'للأطفال من 4-5 سنوات', age_range_min: 4, age_range_max: 5, capacity: 18 },
            { name: 'مجموعة الطيور - Birds', description: 'للأطفال من 5-6 سنوات', age_range_min: 5, age_range_max: 6, capacity: 20 }
        ];
        const savedGroups = [];
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
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
runSeeds();
//# sourceMappingURL=run-seeds.js.map