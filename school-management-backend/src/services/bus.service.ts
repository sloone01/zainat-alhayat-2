import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from '../entities/bus.entity';
import { User } from '../entities/user.entity';
import { hasStaffMembership } from '../common/identity/staff-membership';

export interface CreateBusDto {
  title: string;
  driverName?: string;
  capacity: number;
  driverContacts?: string | null;
  driver_user_id: string;
  supervisor_user_id?: string | null;
  school_id: string;
  is_active?: boolean;
}

export interface UpdateBusDto {
  title?: string;
  driverName?: string;
  capacity?: number;
  driverContacts?: string | null;
  driver_user_id?: string;
  supervisor_user_id?: string | null;
  is_active?: boolean;
}

@Injectable()
export class BusService {
  constructor(
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private staffDisplayName(user: User): string {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.email || user.id;
  }

  private async assertStaffInSchool(
    schoolId: string,
    userId: string | null | undefined,
    roleLabel: 'Driver' | 'Supervisor',
    required: boolean,
  ): Promise<{ id: string | null; user: User | null }> {
    if (userId == null || String(userId).trim() === '') {
      if (required) {
        throw new BadRequestException(`${roleLabel} is required`);
      }
      return { id: null, user: null };
    }
    const id = String(userId).trim();
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException(`${roleLabel} user not found`);
    }
    if (user.user_type === 'parent' || user.user_type === 'student' || user.role === 'parent' || user.role === 'student') {
      throw new BadRequestException(`${roleLabel} must be a school staff user`);
    }
    const atSchool =
      (user.school_id != null && String(user.school_id) === String(schoolId)) ||
      (await hasStaffMembership(this.userRepository.manager, user.id, schoolId));
    if (!atSchool) {
      throw new BadRequestException(`${roleLabel} must belong to this school`);
    }
    return { id, user };
  }

  async create(dto: CreateBusDto): Promise<Bus> {
    const driver = await this.assertStaffInSchool(dto.school_id, dto.driver_user_id, 'Driver', true);
    const supervisor = await this.assertStaffInSchool(
      dto.school_id,
      dto.supervisor_user_id,
      'Supervisor',
      false,
    );
    const driverName = driver.user ? this.staffDisplayName(driver.user) : (dto.driverName || '').trim();
    if (!driverName) {
      throw new BadRequestException('Driver is required');
    }
    const bus = this.busRepository.create({
      title: dto.title,
      driverName,
      capacity: dto.capacity,
      driverContacts: (driver.user?.phone || dto.driverContacts || '').trim() || null,
      driver_user_id: driver.id,
      supervisor_user_id: supervisor.id,
      school_id: dto.school_id,
      is_active: dto.is_active ?? true,
    });
    const saved = await this.busRepository.save(bus);
    return this.findOne(saved.id);
  }

  async findAll(schoolId?: string, isActive?: boolean): Promise<Bus[]> {
    const qb = this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.students', 'student')
      .leftJoinAndSelect('bus.supervisor', 'supervisor')
      .leftJoinAndSelect('bus.driverUser', 'driverUser')
      .orderBy('bus.created_at', 'DESC');

    if (schoolId !== undefined) {
      qb.andWhere('bus.school_id = :schoolId', { schoolId });
    }
    if (isActive !== undefined) {
      qb.andWhere('bus.is_active = :isActive', { isActive });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Bus> {
    const bus = await this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.students', 'student')
      .leftJoinAndSelect('bus.school', 'school')
      .leftJoinAndSelect('bus.supervisor', 'supervisor')
      .leftJoinAndSelect('bus.driverUser', 'driverUser')
      .where('bus.id = :id', { id })
      .getOne();

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }

  async update(id: string, dto: UpdateBusDto): Promise<Bus> {
    const bus = await this.findOne(id);
    if (dto.title !== undefined) bus.title = dto.title;
    if (dto.capacity !== undefined) bus.capacity = dto.capacity;
    if (dto.driver_user_id !== undefined) {
      const driver = await this.assertStaffInSchool(bus.school_id, dto.driver_user_id, 'Driver', true);
      bus.driver_user_id = driver.id;
      if (driver.user) {
        bus.driverName = this.staffDisplayName(driver.user);
        bus.driverContacts = (driver.user.phone || '').trim() || null;
      }
    } else {
      if (dto.driverName !== undefined) bus.driverName = dto.driverName;
      if (dto.driverContacts !== undefined) {
        bus.driverContacts = dto.driverContacts?.trim() || null;
      }
    }
    if (dto.supervisor_user_id !== undefined) {
      const supervisor = await this.assertStaffInSchool(
        bus.school_id,
        dto.supervisor_user_id,
        'Supervisor',
        false,
      );
      bus.supervisor_user_id = supervisor.id;
    }
    if (dto.is_active !== undefined) bus.is_active = dto.is_active;
    await this.busRepository.save(bus);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const bus = await this.findOne(id);
    await this.busRepository.remove(bus);
  }
}
