import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.first_name,
      lastName: registerDto.family_name,
      role: registerDto.user_type as 'admin' | 'teacher' | 'student' | 'parent',
      phone: registerDto.phone,
      school_id: registerDto.school_id,
      isActive: true,
      createdAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      school_id: savedUser.school_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        school_id: savedUser.school_id,
        isActive: savedUser.isActive,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['school'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school_id: user.school_id,
        school_name: user.school?.name,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    console.log('JWT Validation - Payload received:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      school_id: payload.school_id,
      iat: payload.iat,
      exp: payload.exp
    });

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['school'],
    });

    console.log('JWT Validation - Database query result:', {
      userFound: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userActive: user?.isActive,
      searchedId: payload.sub
    });

    if (!user || !user.isActive) {
      console.log('JWT Validation - Rejecting user:', {
        reason: !user ? 'User not found' : 'User inactive',
        userExists: !!user,
        userActive: user?.isActive
      });
      throw new UnauthorizedException('User not found or inactive');
    }

    console.log('JWT Validation - Success for user:', user.email);
    return user;
  }

  async refreshToken(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school_id: user.school_id,
        school_name: user.school?.name,
        isActive: user.isActive,
      },
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async resetPassword(email: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate temporary password (in production, send email with reset link)
    const tempPassword = Math.random().toString(36).slice(-8);
    const saltRounds = 12;
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

    user.password = hashedTempPassword;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    // In production, send email instead of returning password
    return {
      message: 'Temporary password generated',
      temp_password: tempPassword, // Remove this in production
    };
  }

  async deactivateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.isActive = false;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'User deactivated successfully',
    };
  }

  async activateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.isActive = true;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'User activated successfully',
    };
  }
}

