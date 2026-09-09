import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from '../entities/bus.entity';

export interface CreateBusDto {
  title: string;
  driverName: string;
  capacity: number;
  driverContacts?: string;
  school_id: number;
  is_active?: boolean;
}

export interface UpdateBusDto {
  title?: string;
  driverName?: string;
  capacity?: number;
  driverContacts?: string;
  is_active?: boolean;
}

@Injectable()
export class BusService {
  constructor(
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
  ) {}

  async create(dto: CreateBusDto): Promise<Bus> {
    const bus = this.busRepository.create({
      title: dto.title,
      driverName: dto.driverName,
      capacity: dto.capacity,
      driverContacts: dto.driverContacts ?? null,
      school_id: dto.school_id,
      is_active: dto.is_active ?? true,
    });
    return this.busRepository.save(bus);
  }

  async findAll(schoolId?: number, isActive?: boolean): Promise<Bus[]> {
    const qb = this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.students', 'student')
      .orderBy('bus.created_at', 'DESC');

    if (schoolId !== undefined) {
      qb.andWhere('bus.school_id = :schoolId', { schoolId });
    }
    if (isActive !== undefined) {
      qb.andWhere('bus.is_active = :isActive', { isActive });
    }

    return qb.getMany();
  }

  async findOne(id: string, schoolId?: number | null): Promise<Bus> {
    const qb = this.busRepository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.students', 'student')
      .leftJoinAndSelect('bus.school', 'school')
      .where('bus.id = :id', { id });
    if (schoolId != null) {
      qb.andWhere('bus.school_id = :schoolId', { schoolId });
    }
    const bus = await qb.getOne();

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }

  async update(id: string, dto: UpdateBusDto, schoolId?: number | null): Promise<Bus> {
    const bus = await this.findOne(id, schoolId);
    if (dto.title !== undefined) bus.title = dto.title;
    if (dto.driverName !== undefined) bus.driverName = dto.driverName;
    if (dto.capacity !== undefined) bus.capacity = dto.capacity;
    if (dto.driverContacts !== undefined) bus.driverContacts = dto.driverContacts;
    if (dto.is_active !== undefined) bus.is_active = dto.is_active;
    return this.busRepository.save(bus);
  }

  async remove(id: string, schoolId?: number | null): Promise<void> {
    const bus = await this.findOne(id, schoolId);
    await this.busRepository.remove(bus);
  }
}
