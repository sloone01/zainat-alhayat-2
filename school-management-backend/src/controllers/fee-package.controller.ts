import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { FeePackageService } from '../services/fee-package.service';
import { UpsertFeePackageDto } from '../dto/fee-package.dto';

@Controller('fee-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class FeePackageController {
  constructor(private readonly feePackageService: FeePackageService) {}

  @Get()
  async list(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.feePackageService.list(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.feePackageService.getOne(req.user, id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: UpsertFeePackageDto, @Request() req: { user: User }) {
    const data = await this.feePackageService.create(req.user, body);
    return { success: true, data, message: 'Fee package created' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpsertFeePackageDto, @Request() req: { user: User }) {
    const data = await this.feePackageService.update(req.user, id, body);
    return { success: true, data, message: 'Fee package saved' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    await this.feePackageService.delete(req.user, id);
    return { success: true, message: 'Fee package deleted' };
  }
}
