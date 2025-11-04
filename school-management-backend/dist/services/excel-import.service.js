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
exports.ExcelImportService = void 0;
const XLSX = __importStar(require("xlsx"));
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const student_entity_1 = require("../entities/student.entity");
const parent_entity_1 = require("../entities/parent.entity");
const group_entity_1 = require("../entities/group.entity");
const school_entity_1 = require("../entities/school.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
class ExcelImportService {
    dataSource;
    userRepository;
    studentRepository;
    parentRepository;
    groupRepository;
    schoolRepository;
    academicYearRepository;
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.userRepository = dataSource.getRepository(user_entity_1.User);
        this.studentRepository = dataSource.getRepository(student_entity_1.Student);
        this.parentRepository = dataSource.getRepository(parent_entity_1.Parent);
        this.groupRepository = dataSource.getRepository(group_entity_1.Group);
        this.schoolRepository = dataSource.getRepository(school_entity_1.School);
        this.academicYearRepository = dataSource.getRepository(academic_year_entity_1.AcademicYear);
    }
    async importFromExcelFiles() {
        console.log('🌸 Starting Excel import for Zinat Al-Haya Kindergarten...');
        const excelFiles = [
            { path: './تمهيدي.xlsx', stage: 'Preparatory', ageMin: 2, ageMax: 4 },
            { path: './روضة.xlsx', stage: 'Kindergarten', ageMin: 4, ageMax: 6 }
        ];
        const allData = [];
        for (const file of excelFiles) {
            const fileData = await this.parseExcelFile(file.path, file.stage, file.ageMin, file.ageMax);
            allData.push(fileData);
        }
        const school = await this.schoolRepository.findOne({ where: { id: 1 } });
        const academicYear = await this.academicYearRepository.findOne({
            where: { year: '2024-2025' }
        });
        if (!school || !academicYear) {
            throw new Error('School or Academic Year not found');
        }
        for (const fileData of allData) {
            await this.importFileData(fileData, school, academicYear);
        }
        console.log('✅ Excel import completed successfully!');
    }
    async parseExcelFile(filePath, stage, ageMin, ageMax) {
        console.log(`📊 Parsing ${filePath}...`);
        const workbook = XLSX.readFile(filePath);
        const sheets = [];
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            if (data.length < 3)
                continue;
            const groupName = (data[0] && data[0][0]) ? data[0][0].toString() : '';
            const teacherName = sheetName;
            const students = [];
            for (let i = 2; i < data.length; i++) {
                const row = data[i];
                if (!row || !row[0] || row[0] === 'اسم العبقري')
                    continue;
                students.push({
                    fullName: row[0]?.toString().trim() || '',
                    birthDate: row[1]?.toString().trim() || '',
                    motherPhone: this.cleanPhoneNumber(row[2]?.toString() || ''),
                    fatherPhone: this.cleanPhoneNumber(row[3]?.toString() || ''),
                    address: row[4]?.toString().trim() || ''
                });
            }
            if (students.length > 0) {
                sheets.push({
                    teacherName,
                    groupName,
                    students
                });
            }
        }
        return {
            fileName: filePath,
            ageRangeMin: ageMin,
            ageRangeMax: ageMax,
            stage,
            sheets
        };
    }
    cleanPhoneNumber(phone) {
        if (!phone)
            return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 8 && cleaned.startsWith('9')) {
            return cleaned;
        }
        if (cleaned.length > 8) {
            const last8 = cleaned.slice(-8);
            if (last8.startsWith('9')) {
                return last8;
            }
        }
        return cleaned;
    }
    parseArabicName(fullName) {
        if (!fullName)
            return { firstName: '', lastName: '', gender: 'male' };
        const parts = fullName.trim().split(/\s+/);
        const isFemale = fullName.includes('بنت') || fullName.includes('بنة');
        const gender = isFemale ? 'female' : 'male';
        const firstName = parts[0] || '';
        const lastName = parts[parts.length - 1] || '';
        return { firstName, lastName, gender };
    }
    parseBirthDate(dateStr) {
        if (!dateStr)
            return new Date('2020-01-01');
        if (dateStr.includes('\\') || dateStr.includes('/')) {
            const parts = dateStr.split(/[\\\/]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0]) || 1;
                const month = parseInt(parts[1]) || 1;
                const year = parseInt(parts[2]) || 2020;
                return new Date(year, month - 1, day);
            }
        }
        if (/^\d{4}$/.test(dateStr)) {
            const year = parseInt(dateStr);
            return new Date(year, 0, 1);
        }
        if (/^\d+$/.test(dateStr)) {
            const num = parseInt(dateStr);
            if (num > 40000 && num < 50000) {
                const excelEpoch = new Date(1900, 0, 1);
                return new Date(excelEpoch.getTime() + (num - 2) * 24 * 60 * 60 * 1000);
            }
        }
        return new Date('2020-01-01');
    }
    async findOrCreateParent(phone, isMotherPhone = true, studentFullName) {
        if (!phone)
            return null;
        const existingParent = await this.parentRepository.findOne({
            where: { phone: phone }
        });
        if (existingParent) {
            return existingParent;
        }
        const parentFirstName = isMotherPhone ? 'والدة' : 'والد';
        const parentLastName = studentFullName ? `الطالب ${studentFullName}` : 'الطالب';
        const parentUser = await this.userRepository.save({
            username: `parent_${phone}`,
            email: `parent_${phone}@zinat.local`,
            password: await bcrypt.hash('parent123', 10),
            firstName: parentFirstName,
            lastName: parentLastName,
            role: 'parent',
            phone,
            isActive: true,
            school_id: 1
        });
        const parent = await this.parentRepository.save({
            firstName: parentFirstName,
            lastName: parentLastName,
            email: `parent_${phone}@zinat.local`,
            phone: phone,
            address: 'عمان',
            student_id: 1
        });
        return parent;
    }
    async importFileData(fileData, school, academicYear) {
        console.log(`📚 Importing ${fileData.stage} data from ${fileData.fileName}...`);
        for (const sheetData of fileData.sheets) {
            await this.importSheetData(sheetData, fileData, school, academicYear);
        }
    }
    async importSheetData(sheetData, fileData, school, academicYear) {
        console.log(`👩‍🏫 Processing teacher: ${sheetData.teacherName}, Group: ${sheetData.groupName}`);
        const teacher = await this.createTeacher(sheetData.teacherName, school);
        const group = await this.createGroup(sheetData.groupName, fileData, school, academicYear, teacher);
        for (const studentData of sheetData.students) {
            await this.createStudentWithParents(studentData, group, school);
        }
        console.log(`✅ Processed ${sheetData.students.length} students for ${sheetData.teacherName}`);
    }
    async createTeacher(teacherName, school) {
        const existingTeacher = await this.userRepository.findOne({
            where: { firstName: teacherName, role: 'teacher' }
        });
        if (existingTeacher) {
            return existingTeacher;
        }
        const teacher = await this.userRepository.save({
            username: `teacher_${teacherName.replace(/\s+/g, '_')}`,
            email: `${teacherName.replace(/\s+/g, '_')}@zinat.local`,
            password: await bcrypt.hash('teacher123', 10),
            firstName: teacherName,
            lastName: 'معلمة',
            role: 'teacher',
            isActive: true,
            school_id: school.id
        });
        console.log(`👩‍🏫 Created teacher: ${teacherName}`);
        return teacher;
    }
    async createGroup(groupName, fileData, school, academicYear, teacher) {
        const existingGroup = await this.groupRepository.findOne({
            where: { name: groupName }
        });
        if (existingGroup) {
            return existingGroup;
        }
        const group = await this.groupRepository.save({
            name: groupName,
            description: `${fileData.stage} - Supervised by ${teacher.firstName}`,
            age_range_min: fileData.ageRangeMin,
            age_range_max: fileData.ageRangeMax,
            capacity: 25,
            is_active: true,
            status: 'active',
            studentCount: 0,
            teacherCount: 1,
            school_id: school.id,
            academic_year_id: academicYear.id
        });
        console.log(`🏫 Created group: ${groupName} (Age ${fileData.ageRangeMin}-${fileData.ageRangeMax})`);
        return group;
    }
    async createStudentWithParents(studentData, group, school) {
        const { firstName, lastName, gender } = this.parseArabicName(studentData.fullName);
        const birthDate = this.parseBirthDate(studentData.birthDate);
        const existingStudent = await this.studentRepository.findOne({
            where: {
                firstName,
                lastName,
                dateOfBirth: birthDate
            }
        });
        if (existingStudent) {
            console.log(`⚠️ Student already exists: ${firstName} ${lastName}`);
            return;
        }
        const student = await this.studentRepository.save({
            firstName,
            lastName,
            dateOfBirth: birthDate,
            gender,
            address: studentData.address || 'عمان',
            emergencyContact: studentData.motherPhone || studentData.fatherPhone || '',
            nationality: 'عماني',
            school_id: school.id
        });
        const parents = [];
        const studentFullName = `${firstName} ${lastName}`;
        if (studentData.motherPhone) {
            const mother = await this.findOrCreateParent(studentData.motherPhone, true, studentFullName);
            if (mother)
                parents.push(mother);
        }
        if (studentData.fatherPhone && studentData.fatherPhone !== studentData.motherPhone) {
            const father = await this.findOrCreateParent(studentData.fatherPhone, false, studentFullName);
            if (father)
                parents.push(father);
        }
        for (const parent of parents) {
            await this.dataSource.query('INSERT INTO student_parents (student_id, parent_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student.id, parent.id]);
        }
        await this.dataSource.query('INSERT INTO student_groups (student_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student.id, group.id]);
        await this.groupRepository.update(group.id, {
            studentCount: () => 'studentCount + 1'
        });
        console.log(`👶 Created student: ${firstName} ${lastName} (${gender})`);
    }
    async getImportSummary() {
        const userCount = await this.userRepository.count();
        const teacherCount = await this.userRepository.count({ where: { role: 'teacher' } });
        const parentCount = await this.userRepository.count({ where: { role: 'parent' } });
        const studentCount = await this.studentRepository.count();
        const groupCount = await this.groupRepository.count();
        return {
            users: userCount,
            teachers: teacherCount,
            parents: parentCount,
            students: studentCount,
            groups: groupCount
        };
    }
}
exports.ExcelImportService = ExcelImportService;
//# sourceMappingURL=excel-import.service.js.map