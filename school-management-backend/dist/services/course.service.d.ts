import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { AcademicYear } from '../entities/academic-year.entity';
export interface CreateCourseDto {
    name: string;
    description?: string;
    age_group_min?: number;
    age_group_max?: number;
    is_active?: boolean;
    color_code?: string;
    icon?: string;
    send_notifications?: boolean;
    estimated_duration_weeks?: number;
    learning_objectives?: string;
    prerequisites?: string;
    materials_needed?: string;
    school_id: number;
    academic_year_id?: string;
    title?: string;
    category?: string;
    status?: string;
    totalDuration?: number;
    targetAgeGroup?: string;
    difficultyLevel?: string;
    maxStudents?: number;
}
export interface UpdateCourseDto {
    name?: string;
    description?: string;
    age_group_min?: number;
    age_group_max?: number;
    is_active?: boolean;
    color_code?: string;
    icon?: string;
    send_notifications?: boolean;
    estimated_duration_weeks?: number;
    learning_objectives?: string;
    prerequisites?: string;
    materials_needed?: string;
    academic_year_id?: string;
}
export declare class CourseService {
    private courseRepository;
    private academicYearRepository;
    private readonly logger;
    constructor(courseRepository: Repository<Course>, academicYearRepository: Repository<AcademicYear>);
    create(createCourseDto: CreateCourseDto): Promise<Course>;
    findAll(schoolId?: number): Promise<Course[]>;
    findByAcademicYear(schoolId: number, academicYear: string): Promise<Course[]>;
    findActiveYearCourses(schoolId: number, academicYear: string): Promise<Course[]>;
    findOne(id: string): Promise<Course>;
    findByAgeGroup(schoolId: number, minAge: number, maxAge: number): Promise<Course[]>;
    findByStatus(schoolId: number, isActive: boolean): Promise<Course[]>;
    findActiveCourses(schoolId: number): Promise<Course[]>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course>;
    updateStatus(id: string, isActive: boolean): Promise<Course>;
    remove(id: string): Promise<void>;
    getCourseStatistics(id: string): Promise<any>;
    searchCourses(schoolId: number, searchTerm: string): Promise<Course[]>;
    getTableSchema(): Promise<any>;
}
