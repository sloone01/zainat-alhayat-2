import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { Group } from '../entities/group.entity';
import { School } from '../entities/school.entity';
import { AcademicYear } from '../entities/academic-year.entity';

export interface ExcelStudentData {
  fullName: string;
  birthDate: string;
  motherPhone: string;
  fatherPhone: string;
  address: string;
}

export interface ExcelSheetData {
  teacherName: string;
  groupName: string;
  students: ExcelStudentData[];
}

export interface ExcelFileData {
  fileName: string;
  ageRangeMin: number;
  ageRangeMax: number;
  stage: string;
  sheets: ExcelSheetData[];
}

export class ExcelImportService {
  private userRepository: Repository<User>;
  private studentRepository: Repository<Student>;
  private parentRepository: Repository<Parent>;
  private groupRepository: Repository<Group>;
  private schoolRepository: Repository<School>;
  private academicYearRepository: Repository<AcademicYear>;

  constructor(private dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.studentRepository = dataSource.getRepository(Student);
    this.parentRepository = dataSource.getRepository(Parent);
    this.groupRepository = dataSource.getRepository(Group);
    this.schoolRepository = dataSource.getRepository(School);
    this.academicYearRepository = dataSource.getRepository(AcademicYear);
  }

  async importFromExcelFiles(): Promise<void> {
    console.log('🌸 Starting Excel import for Zinat Al-Haya Kindergarten...');

    // Read and parse Excel files
    const excelFiles = [
      { path: './تمهيدي.xlsx', stage: 'Preparatory', ageMin: 2, ageMax: 4 },
      { path: './روضة.xlsx', stage: 'Kindergarten', ageMin: 4, ageMax: 6 }
    ];

    const allData: ExcelFileData[] = [];

    for (const file of excelFiles) {
      const fileData = await this.parseExcelFile(file.path, file.stage, file.ageMin, file.ageMax);
      allData.push(fileData);
    }

    // Get school and academic year
    const school = await this.schoolRepository.findOne({ where: { id: 1 } });
    const academicYear = await this.academicYearRepository.findOne({ 
      where: { year: '2024-2025' } 
    });

    if (!school || !academicYear) {
      throw new Error('School or Academic Year not found');
    }

    // Import all data
    for (const fileData of allData) {
      await this.importFileData(fileData, school, academicYear);
    }

    console.log('✅ Excel import completed successfully!');
  }

  private async parseExcelFile(filePath: string, stage: string, ageMin: number, ageMax: number): Promise<ExcelFileData> {
    console.log(`📊 Parsing ${filePath}...`);
    
    const workbook = XLSX.readFile(filePath);
    const sheets: ExcelSheetData[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (data.length < 3) continue; // Skip sheets with insufficient data

      const groupName = (data[0] && data[0][0]) ? data[0][0].toString() : '';
      const teacherName = sheetName;
      const students: ExcelStudentData[] = [];

      // Parse student rows (skip header row at index 1)
      for (let i = 2; i < data.length; i++) {
        const row = data[i] as any[];
        if (!row || !row[0] || row[0] === 'اسم العبقري') continue; // Skip empty or header rows

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

  private cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle Omani phone numbers (should start with 9 and be 8 digits)
    if (cleaned.length === 8 && cleaned.startsWith('9')) {
      return cleaned;
    }
    
    // Handle numbers with country code
    if (cleaned.length > 8) {
      const last8 = cleaned.slice(-8);
      if (last8.startsWith('9')) {
        return last8;
      }
    }
    
    return cleaned;
  }

  private parseArabicName(fullName: string): { firstName: string; lastName: string; gender: 'male' | 'female' } {
    if (!fullName) return { firstName: '', lastName: '', gender: 'male' };

    const parts = fullName.trim().split(/\s+/);
    
    // Detect gender from Arabic patterns
    const isFemale = fullName.includes('بنت') || fullName.includes('بنة');
    const gender: 'male' | 'female' = isFemale ? 'female' : 'male';

    // Extract first name (usually the first part)
    const firstName = parts[0] || '';

    // Extract last name (usually the last part, often family name)
    const lastName = parts[parts.length - 1] || '';

    return { firstName, lastName, gender };
  }

  private parseBirthDate(dateStr: string): Date {
    if (!dateStr) return new Date('2020-01-01'); // Default date

    // Handle various date formats
    if (dateStr.includes('\\') || dateStr.includes('/')) {
      // Format: 1\11\2020 or 1/11/2020
      const parts = dateStr.split(/[\\\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]) || 1;
        const month = parseInt(parts[1]) || 1;
        const year = parseInt(parts[2]) || 2020;
        return new Date(year, month - 1, day);
      }
    }

    // Handle year only: 2021, 2022
    if (/^\d{4}$/.test(dateStr)) {
      const year = parseInt(dateStr);
      return new Date(year, 0, 1); // January 1st of that year
    }

    // Handle numeric dates (Excel serial dates)
    if (/^\d+$/.test(dateStr)) {
      const num = parseInt(dateStr);
      if (num > 40000 && num < 50000) { // Excel date range
        const excelEpoch = new Date(1900, 0, 1);
        return new Date(excelEpoch.getTime() + (num - 2) * 24 * 60 * 60 * 1000);
      }
    }

    // Default fallback
    return new Date('2020-01-01');
  }

  private async findOrCreateParent(phone: string, isMotherPhone: boolean = true, studentFullName?: string): Promise<Parent | null> {
    if (!phone) return null;

    // Check if parent with this phone already exists
    const existingParent = await this.parentRepository.findOne({
      where: { phone: phone }
    });

    if (existingParent) {
      return existingParent;
    }

    // Create descriptive parent names with student full name
    const parentFirstName = isMotherPhone ? 'والدة' : 'والد';
    const parentLastName = studentFullName ? `الطالب ${studentFullName}` : 'الطالب';

    // Create new parent user
    const parentUser = await this.userRepository.save({
      username: `parent_${phone}`,
      email: `parent_${phone}@zinat.local`,
      password: await bcrypt.hash('parent123', 10),
      firstName: parentFirstName,
      lastName: parentLastName,
      role: 'parent' as const,
      phone,
      isActive: true,
      school_id: 1
    });

    // Create parent record with required student_id (using a numeric placeholder)
    const parent = await this.parentRepository.save({
      firstName: parentFirstName,
      lastName: parentLastName,
      email: `parent_${phone}@zinat.local`,
      phone: phone,
      address: 'عمان',
      student_id: 1 // Using placeholder numeric ID since we use many-to-many relationship
    });

    return parent;
  }

  private async importFileData(fileData: ExcelFileData, school: School, academicYear: AcademicYear): Promise<void> {
    console.log(`📚 Importing ${fileData.stage} data from ${fileData.fileName}...`);

    for (const sheetData of fileData.sheets) {
      await this.importSheetData(sheetData, fileData, school, academicYear);
    }
  }

  private async importSheetData(
    sheetData: ExcelSheetData,
    fileData: ExcelFileData,
    school: School,
    academicYear: AcademicYear
  ): Promise<void> {
    console.log(`👩‍🏫 Processing teacher: ${sheetData.teacherName}, Group: ${sheetData.groupName}`);

    // Create teacher user
    const teacher = await this.createTeacher(sheetData.teacherName, school);

    // Create group
    const group = await this.createGroup(sheetData.groupName, fileData, school, academicYear, teacher);

    // Process students
    for (const studentData of sheetData.students) {
      await this.createStudentWithParents(studentData, group, school);
    }

    console.log(`✅ Processed ${sheetData.students.length} students for ${sheetData.teacherName}`);
  }

  private async createTeacher(teacherName: string, school: School): Promise<User> {
    // Check if teacher already exists
    const existingTeacher = await this.userRepository.findOne({
      where: { firstName: teacherName, role: 'teacher' }
    });

    if (existingTeacher) {
      return existingTeacher;
    }

    // Create new teacher
    const teacher = await this.userRepository.save({
      username: `teacher_${teacherName.replace(/\s+/g, '_')}`,
      email: `${teacherName.replace(/\s+/g, '_')}@zinat.local`,
      password: await bcrypt.hash('teacher123', 10),
      firstName: teacherName,
      lastName: 'معلمة',
      role: 'teacher' as const,
      isActive: true,
      school_id: school.id
    });

    console.log(`👩‍🏫 Created teacher: ${teacherName}`);
    return teacher;
  }

  private async createGroup(
    groupName: string,
    fileData: ExcelFileData,
    school: School,
    academicYear: AcademicYear,
    teacher: User
  ): Promise<Group> {
    // Check if group already exists
    const existingGroup = await this.groupRepository.findOne({
      where: { name: groupName }
    });

    if (existingGroup) {
      return existingGroup;
    }

    // Create new group
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

  private async createStudentWithParents(
    studentData: ExcelStudentData,
    group: Group,
    school: School
  ): Promise<void> {
    const { firstName, lastName, gender } = this.parseArabicName(studentData.fullName);
    const birthDate = this.parseBirthDate(studentData.birthDate);

    // Check if student already exists
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

    // Create student
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

    // Create parents with student_id and student full name
    const parents: Parent[] = [];
    const studentFullName = `${firstName} ${lastName}`;

    if (studentData.motherPhone) {
      const mother = await this.findOrCreateParent(studentData.motherPhone, true, studentFullName);
      if (mother) parents.push(mother);
    }

    if (studentData.fatherPhone && studentData.fatherPhone !== studentData.motherPhone) {
      const father = await this.findOrCreateParent(studentData.fatherPhone, false, studentFullName);
      if (father) parents.push(father);
    }

    // Link student to parents
    for (const parent of parents) {
      await this.dataSource.query(
        'INSERT INTO student_parents (student_id, parent_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [student.id, parent.id]
      );
    }

    // Link student to group
    await this.dataSource.query(
      'INSERT INTO student_groups (student_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [student.id, group.id]
    );

    // Update group student count
    await this.groupRepository.update(group.id, {
      studentCount: () => 'studentCount + 1'
    });

    console.log(`👶 Created student: ${firstName} ${lastName} (${gender})`);
  }

  async getImportSummary(): Promise<any> {
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
