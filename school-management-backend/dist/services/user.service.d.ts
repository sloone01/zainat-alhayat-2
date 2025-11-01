import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    roles?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    isActive?: boolean;
}
export interface UpdateUserDto {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'admin' | 'teacher' | 'student' | 'parent';
    roles?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    isActive?: boolean;
}
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updatePassword(id: string, newPassword: string): Promise<void>;
    remove(id: string): Promise<void>;
    findByRole(role: string): Promise<User[]>;
    toggleActive(id: string): Promise<User>;
}
