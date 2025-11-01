import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    school_id: number;
    iat?: number;
    exp?: number;
}
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    validateUser(payload: JwtPayload): Promise<User>;
    refreshToken(userId: string): Promise<any>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any>;
    resetPassword(email: string): Promise<any>;
    deactivateUser(userId: string): Promise<any>;
    activateUser(userId: string): Promise<any>;
}
