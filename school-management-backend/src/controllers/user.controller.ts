import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
@RequireClaim('users', 'view')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequireClaim('users', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: { user: User }, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto, req.user);
      return {
        success: true,
        data: user,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get()
  async findAll(@Req() req: { user: User }, @Query('role') role?: string) {
    try {
      const users = role
        ? await this.userService.findByRole(role, req.user)
        : await this.userService.findAll(req.user);

      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    try {
      if (!query) {
        return {
          success: false,
          message: 'Search query is required'
        };
      }

      const users = await this.userService.findAll();
      const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: filteredUsers,
        count: filteredUsers.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id')
  @RequireClaim('users', 'edit')
  async update(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto, req.user);
      return {
        success: true,
        data: user,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/password')
  @RequireClaim('users', 'manage')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string }
  ) {
    try {
      await this.userService.updatePassword(id, body.newPassword);
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/toggle-active')
  @RequireClaim('users', 'manage')
  async toggleActive(@Param('id') id: string) {
    try {
      const user = await this.userService.toggleActive(id);
      return {
        success: true,
        data: user,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Delete(':id')
  @RequireClaim('users', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.userService.remove(id);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string) {
    try {
      const users = await this.userService.findByRole(role);
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }
}

