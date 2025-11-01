import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
export interface CreateParentDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    userId?: number;
    studentIds?: number[];
}
export interface UpdateParentDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    userId?: number;
    studentIds?: number[];
}
export declare class ParentService {
    private parentRepository;
    private studentRepository;
    private userRepository;
    constructor(parentRepository: Repository<Parent>, studentRepository: Repository<Student>, userRepository: Repository<User>);
    create(createParentDto: CreateParentDto): Promise<Parent>;
    findAll(): Promise<Parent[]>;
    findOne(id: number): Promise<Parent>;
    update(id: number, updateParentDto: UpdateParentDto): Promise<Parent>;
    remove(id: number): Promise<void>;
    searchParents(query: string): Promise<Parent[]>;
    assignToStudent(parentId: number, studentId: string): Promise<Parent>;
    removeFromStudent(parentId: number, studentId: string): Promise<Parent>;
}
