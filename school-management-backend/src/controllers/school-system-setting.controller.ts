import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { SchoolSystemSettingService } from '../services/school-system-setting.service';
import type { CreateSchoolSystemSettingDto } from '../services/school-system-setting.service';
import { CreateSchoolSettingDto, PatchSchoolSettingDto, SchoolSettingBulkDto } from '../dto/school-system-setting.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SchoolSystemSettingController {
  constructor(private readonly schoolSystemSettingService: SchoolSystemSettingService) {}

  @Get()
  async findAll(@Request() req: { user: User }) {
    const data = await this.schoolSystemSettingService.findAllForUser(req.user);
    return { success: true, data, count: data.length };
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string, @Request() req: { user: User }) {
    const data = await this.schoolSystemSettingService.findByCategory(req.user, category);
    return { success: true, data, count: data.length };
  }

  @Get('key/:key')
  async findByKey(@Param('key') key: string, @Request() req: { user: User }) {
    const data = await this.schoolSystemSettingService.findByKey(req.user, key);
    return { success: true, data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: CreateSchoolSettingDto, @Request() req: { user: User }) {
    const dto: CreateSchoolSystemSettingDto = {
      key: body.key,
      value: body.value as CreateSchoolSystemSettingDto['value'],
      type: body.type,
      category: body.category,
      title: body.title,
      description: body.description,
      is_public: body.is_public,
    };
    const data = await this.schoolSystemSettingService.create(req.user, dto);
    return { success: true, data, message: 'Setting created' };
  }

  @Patch('key/:key')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateByKey(
    @Param('key') key: string,
    @Body() body: PatchSchoolSettingDto,
    @Request() req: { user: User },
  ) {
    const data = await this.schoolSystemSettingService.updateByKey(req.user, key, {
      value: body.value as any,
      title: body.title,
      description: body.description,
      is_public: body.is_public,
    });
    return { success: true, data, message: 'Setting updated' };
  }

  @Delete('key/:key')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeByKey(@Param('key') key: string, @Request() req: { user: User }) {
    await this.schoolSystemSettingService.deleteByKey(req.user, key);
    return { success: true, message: 'Setting deleted' };
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulk(@Body() body: SchoolSettingBulkDto, @Request() req: { user: User }) {
    const data = await this.schoolSystemSettingService.bulkUpsert(req.user, body.settings);
    return { success: true, data, count: data.length };
  }
}
