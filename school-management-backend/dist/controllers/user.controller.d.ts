import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: import("../entities/user.entity").User;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findAll(role?: string): Promise<{
        success: boolean;
        data: import("../entities/user.entity").User[];
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
        data: import("../entities/user.entity").User[];
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
        data: import("../entities/user.entity").User;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: import("../entities/user.entity").User;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    updatePassword(id: string, body: {
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
    toggleActive(id: string): Promise<{
        success: boolean;
        data: import("../entities/user.entity").User;
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
    findByRole(role: string): Promise<{
        success: boolean;
        data: import("../entities/user.entity").User[];
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
}
