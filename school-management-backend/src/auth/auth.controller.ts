import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto, ChangePasswordDto, ResetPasswordDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return {
      success: true,
      data: await this.authService.register(registerDto),
      message: 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(loginDto),
      message: 'Login successful',
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req) {
    return {
      success: true,
      data: await this.authService.refreshToken(req.user.id),
      message: 'Token refreshed successfully',
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return {
      success: true,
      data: await this.authService.changePassword(req.user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword),
      message: 'Password changed successfully',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return {
      success: true,
      data: await this.authService.resetPassword(resetPasswordDto.email),
      message: 'Password reset initiated',
    };
  }

  @Post('deactivate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deactivate(@Request() req) {
    return {
      success: true,
      data: await this.authService.deactivateUser(req.user.id),
      message: 'Account deactivated successfully',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        family_name: req.user.family_name,
        user_type: req.user.user_type,
        school_id: req.user.school_id,
        school_name: req.user.school?.name,
        is_active: req.user.is_active,
        last_login: req.user.last_login,
        created_at: req.user.created_at,
      },
      message: 'Profile retrieved successfully',
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req) {
    return {
      success: true,
      data: {
        valid: true,
        user_id: req.user.id,
        user_type: req.user.user_type,
        school_id: req.user.school_id,
      },
      message: 'Token is valid',
    };
  }
}

