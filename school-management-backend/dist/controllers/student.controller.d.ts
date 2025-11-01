import { StudentService } from '../services/student.service';
import type { CreateStudentDto, UpdateStudentDto } from '../services/student.service';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    create(createStudentDto: CreateStudentDto): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    search(query: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        count?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: import("../entities/student.entity").Student[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    findByGroup(groupId: string): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    findByParent(parentId: number): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getProgress(id: string): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student | null;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    assignToGroup(id: string, groupId: string): Promise<{
        success: boolean;
        data: import("../entities/student.entity").Student;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
}
