export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    first_name: string;
    family_name: string;
    user_type: string;
    phone?: string;
    school_id: number;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class ResetPasswordDto {
    email: string;
}
