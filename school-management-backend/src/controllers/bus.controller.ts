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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { BusService, type CreateBusDto, type UpdateBusDto } from '../services/bus.service';
import {
  BusMovementService,
  type BusMovementEventType,
  type BusTripType,
} from '../services/bus-movement.service';
import { BusEtaService } from '../services/bus-eta.service';

import { StudentService } from '../services/student.service';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId, assertSameSchool } from '../common/security/school-access';

@Controller('buses')
@UseGuards(JwtAuthGuard)
@RequireAnyClaim(
  { page: 'transportation', action: 'view' },
  { page: 'transportation_daily_log', action: 'view' },
)
export class BusController {
  constructor(
    private readonly busService: BusService,
    private readonly busMovementService: BusMovementService,
    private readonly studentService: StudentService,
    private readonly busEtaService: BusEtaService,
  ) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  private async assertBusAccess(req: { user: User }, busId: string) {
    const bus = await this.busService.findOne(busId);
    assertSameSchool(req.user, bus.school_id);
    return bus;
  }

  @Post()
  @RequireClaim('transportation', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: { user: User }, @Body() body: CreateBusDto) {
    const schoolId = this.schoolOf(req, body.school_id);
    body.school_id = schoolId;
    return {
      success: true,
      data: await this.busService.create(body),
      message: 'Bus created successfully',
    };
  }

  @Get()
  async findAll(
    @Request() req: { user: User },
    @Query('school_id') schoolId?: string,
    @Query('is_active') isActive?: string,
  ) {
    const requested = schoolId ? String(schoolId) : undefined;
    const schoolIdNum = this.schoolOf(req, requested);
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
  @RequireAnyClaim(
    { page: 'transportation', action: 'view' },
    { page: 'transportation_daily_log', action: 'view' },
  )
  async listMovements(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Query('date') date?: string,
    @Query('tripType') tripTypeRaw?: string,
    @Query('limit') limit?: string,
  ) {
    await this.assertBusAccess(req, busId);
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

  /** Live GPS fix from the driver/supervisor device (or admin/teacher). */
  @Patch(':id/position')
  @RequireAnyClaim(
    { page: 'transportation', action: 'edit' },
    { page: 'transportation_daily_log', action: 'create' },
    { page: 'transportation_daily_log', action: 'edit' },
  )
  async updatePosition(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Body() body: { lat?: number; lng?: number; trip_type?: BusTripType; trip_date?: string },
  ) {
    await this.assertBusAccess(req, busId);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      throw new BadRequestException('lat and lng are required');
    }
    const bus = await this.busService.updatePosition(busId, lat, lng);
    const tripType = body.trip_type === 'return' ? 'return' : 'going';
    const eta = await this.busEtaService.afterPositionUpdate(bus, {
      tripType,
      tripDate: body.trip_date,
    });
    return {
      success: true,
      data: {
        bus_id: bus.id,
        last_lat: bus.last_lat,
        last_lng: bus.last_lng,
        last_position_at: bus.last_position_at,
        eta,
      },
      message: 'Position updated successfully',
    };
  }

  /** Ordered stop ETAs from the bus’s last known fix (staff/driver). */
  @Get(':id/eta')
  @RequireAnyClaim(
    { page: 'transportation', action: 'view' },
    { page: 'transportation_daily_log', action: 'view' },
  )
  async getEta(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Query('trip_type') tripTypeRaw?: string,
    @Query('trip_date') tripDate?: string,
  ) {
    const bus = await this.assertBusAccess(req, busId);
    const tripType = tripTypeRaw === 'return' ? 'return' : 'going';
    const eta = await this.busEtaService.computeForBus(bus, { tripType, tripDate });
    return { success: true, data: eta };
  }

  @Post(':id/movements')
  @RequireAnyClaim(
    { page: 'transportation', action: 'create' },
    { page: 'transportation_daily_log', action: 'create' },
  )
  @HttpCode(HttpStatus.CREATED)
  async logMovement(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Body()
    body: {
      studentId: string;
      eventType: BusMovementEventType;
      tripType: BusTripType;
      tripDate: string;
    },
  ) {
    await this.assertBusAccess(req, busId);
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
  @RequireAnyClaim(
    { page: 'transportation', action: 'create' },
    { page: 'transportation_daily_log', action: 'create' },
  )
  @HttpCode(HttpStatus.CREATED)
  async logMovementsBulk(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Body()
    body: {
      studentIds: string[];
      eventType: BusMovementEventType;
      tripType: BusTripType;
      tripDate: string;
    },
  ) {
    await this.assertBusAccess(req, busId);
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
  async listStudentsOnBus(@Request() req: { user: User }, @Param('id') busId: string) {
    await this.assertBusAccess(req, busId);
    const data = await this.studentService.findByBusWithPickup(busId);
    return {
      success: true,
      data,
      count: data.length,
      message: 'Students on bus retrieved successfully',
    };
  }

  @Patch(':id/students/:studentId/pickup')
  @RequireAnyClaim(
    { page: 'transportation', action: 'edit' },
    { page: 'transportation_daily_log', action: 'create' },
    { page: 'transportation_daily_log', action: 'edit' },
  )
  async setStudentPickup(
    @Request() req: { user: User },
    @Param('id') busId: string,
    @Param('studentId') studentId: string,
    @Body()
    body: {
      pickup_lat?: number | null;
      pickup_lng?: number | null;
      pickup_source?: string | null;
    },
  ) {
    await this.assertBusAccess(req, busId);
    const student = await this.studentService.findOne(studentId);
    assertSameSchool(req.user, student.school_id);
    const data = await this.studentService.setBusPickup(studentId, busId, {
      pickup_lat: body.pickup_lat ?? null,
      pickup_lng: body.pickup_lng ?? null,
      pickup_source: body.pickup_source ?? 'staff',
    });
    return {
      success: true,
      data,
      message: 'Pickup location updated',
    };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const bus = await this.busService.findOne(id);
    assertSameSchool(req.user, bus.school_id);
    return {
      success: true,
      data: bus,
      message: 'Bus retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('transportation', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() body: UpdateBusDto,
  ) {
    const bus = await this.busService.findOne(id);
    assertSameSchool(req.user, bus.school_id);
    return {
      success: true,
      data: await this.busService.update(id, body),
      message: 'Bus updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('transportation', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    const bus = await this.busService.findOne(id);
    assertSameSchool(req.user, bus.school_id);
    await this.busService.remove(id);
    return { success: true, message: 'Bus deleted successfully' };
  }
}
