import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { Parent } from '../entities/parent.entity';
export interface CreateStudentDto {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female';
    address: string;
    phone?: string;
    email?: string;
    emergencyContact: string;
    medicalInfo?: string;
    notes?: string;
    secondName?: string;
    thirdName?: string;
    nationality?: string;
    studentId?: string;
    photo?: string;
    parentIds?: string[];
    userId?: string;
}
export interface UpdateStudentDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female';
    address?: string;
    phone?: string;
    email?: string;
    emergencyContact?: string;
    medicalInfo?: string;
    notes?: string;
    secondName?: string;
    thirdName?: string;
    nationality?: string;
    studentId?: string;
    photo?: string;
    parentIds?: string[];
    userId?: string;
}
export declare class StudentService {
    private studentRepository;
    private userRepository;
    private parentRepository;
    constructor(studentRepository: Repository<Student>, userRepository: Repository<User>, parentRepository: Repository<Parent>);
    create(createStudentDto: CreateStudentDto): Promise<Student>;
    findAll(): Promise<Student[]>;
    findOne(id: string): Promise<Student>;
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student>;
    remove(id: string): Promise<void>;
    findByGroup(groupId: string): Promise<Student[]>;
    findByParent(parentId: number): Promise<Student[]>;
    searchStudents(query: string): Promise<Student[]>;
    getStudentProgress(studentId: string): Promise<Student | null>;
    assignToGroup(studentId: string, groupId: string): Promise<Student>;
    removeFromGroup(studentId: string, groupId: string): Promise<Student>;
}
