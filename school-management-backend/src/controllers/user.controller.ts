import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('users')
@UseGuards(JwtAuthGuard)
@RequireClaim('users', 'view')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('search')
  async search(@Query('q') query: string, @Req() req: { user: User }) {
    try {
      if (!query) {
        throw new BadRequestException('Search query is required');
      }

      // Scoped: findAll() without an actor searched every school's accounts.
      const users = await this.userService.findAll(req.user);
      const needle = query.toLowerCase();
      const matches = (value?: string | null) =>
        typeof value === 'string' && value.toLowerCase().includes(needle);
      const filteredUsers = users.filter(
        (user) =>
          matches(user.firstName) ||
          matches(user.lastName) ||
          matches(user.username) ||
          matches(user.email),
      );

      return {
        success: true,
        data: filteredUsers,
        count: filteredUsers.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      // Scoped: an unscoped read by id exposed other schools' accounts.
      const user = await this.userService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: user
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id/password')
  @RequireClaim('users', 'manage')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
    @Req() req: { user: User },
  ) {
    try {
      await this.userService.updatePassword(id, body.newPassword, req.user);
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}

