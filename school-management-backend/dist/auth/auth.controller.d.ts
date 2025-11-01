import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ResetPasswordDto } from '../dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    refresh(req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    deactivate(req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            email: any;
            first_name: any;
            family_name: any;
            user_type: any;
            school_id: any;
            school_name: any;
            is_active: any;
            last_login: any;
            created_at: any;
        };
        message: string;
    }>;
    verify(req: any): Promise<{
        success: boolean;
        data: {
            valid: boolean;
            user_id: any;
            user_type: any;
            school_id: any;
        };
        message: string;
    }>;
}
