import {
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
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusService, type CreateBusDto, type UpdateBusDto } from '../services/bus.service';
import {
  BusMovementService,
  type BusMovementEventType,
  type BusTripType,
} from '../services/bus-movement.service';

import { StudentService } from '../services/student.service';

@Controller('buses')
@UseGuards(JwtAuthGuard)
export class BusController {
  constructor(
    private readonly busService: BusService,
    private readonly busMovementService: BusMovementService,
    private readonly studentService: StudentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBusDto) {
    return {
      success: true,
      data: await this.busService.create(body),
      message: 'Bus created successfully',
    };
  }

  @Get()
  async findAll(
    @Query('school_id') schoolId?: string,
    @Query('is_active') isActive?: string,
  ) {
    const schoolIdNum = schoolId ? parseInt(schoolId, 10) : undefined;
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    const buses = await this.busService.findAll(schoolIdNum, isActiveBool);
    return {
      success: true,
      data: buses,
      count: buses.length,
      message: 'Buses retrieved successfully',
    };
  }

  @Get(':id/movements')
  async listMovements(
    @Param('id') busId: string,
    @Query('date') date?: string,
    @Query('tripType') tripTypeRaw?: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : undefined;
    const trip =
      tripTypeRaw === 'going' || tripTypeRaw === 'return'
        ? tripTypeRaw
        : undefined;
    const data = await this.busMovementService.findForBus(busId, {
      date,
      tripType: trip,
      limit: lim,
    });
    return {
      success: true,
      data,
      count: data.length,
      message: 'Bus movements retrieved successfully',
    };
  }

  @Post(':id/movements')
  @HttpCode(HttpStatus.CREATED)
  async logMovement(
    @Param('id') busId: string,
    @Body()
    body: {
      studentId: string;
      eventType: BusMovementEventType;
      tripType: BusTripType;
      tripDate: string;
    },
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.busMovementService.logMovement(
      busId,
      body.studentId,
      body.eventType,
      body.tripType,
      body.tripDate,
      req.user?.id,
    );
    return {
      success: true,
      data,
      message: 'Movement logged successfully',
    };
  }

  @Post(':id/movements/bulk')
  @HttpCode(HttpStatus.CREATED)
  async logMovementsBulk(
    @Param('id') busId: string,
    @Body()
    body: {
      studentIds: string[];
      eventType: BusMovementEventType;
      tripType: BusTripType;
      tripDate: string;
    },
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.busMovementService.logBulk(
      busId,
      body.studentIds,
      body.eventType,
      body.tripType,
      body.tripDate,
      req.user?.id,
    );
    return {
      success: true,
      data,
      count: data.length,
      message: 'Movements logged successfully',
    };
  }

  @Get(':id/students')
  async listStudentsOnBus(@Param('id') busId: string) {
    await this.busService.findOne(busId);
    const data = await this.studentService.findByBus(busId);
    return {
      success: true,
      data,
      count: data.length,
      message: 'Students on bus retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.busService.findOne(id),
      message: 'Bus retrieved successfully',
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBusDto) {
    return {
      success: true,
      data: await this.busService.update(id, body),
      message: 'Bus updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.busService.remove(id);
    return { success: true, message: 'Bus deleted successfully' };
  }
}
