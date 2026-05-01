import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { ActivityQueryDto, CreateActivityDto, UpdateActivityDto } from '../dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create();
    activity.title = createActivityDto.title;
    activity.description = createActivityDto.description;
    activity.activity_date = new Date(createActivityDto.activity_date);
    activity.start_time = createActivityDto.start_time;
    activity.end_time = createActivityDto.end_time;
    activity.location = createActivityDto.location;
    activity.activity_type = createActivityDto.activity_type;
    activity.is_active = createActivityDto.is_active ?? true;
    activity.school_id = createActivityDto.school_id;
    activity.group_id = createActivityDto.group_id;
    activity.created_by = createActivityDto.created_by;
    return this.activityRepository.save(activity);
  }

  async findAll(query: ActivityQueryDto): Promise<Activity[]> {
    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.group', 'group')
      .leftJoinAndSelect('activity.createdByUser', 'createdByUser')
      .orderBy('activity.activity_date', 'DESC')
      .addOrderBy('activity.created_at', 'DESC');

    if (query.school_id !== undefined) {
      qb.andWhere('activity.school_id = :schoolId', { schoolId: query.school_id });
    }
    if (query.group_id) {
      qb.andWhere('activity.group_id = :groupId', { groupId: query.group_id });
    }
    if (query.is_active !== undefined) {
      qb.andWhere('activity.is_active = :isActive', { isActive: query.is_active });
    }
    if (query.activity_type) {
      qb.andWhere('activity.activity_type = :activityType', { activityType: query.activity_type });
    }
    if (query.from_date) {
      qb.andWhere('activity.activity_date >= :fromDate', { fromDate: query.from_date });
    }
    if (query.to_date) {
      qb.andWhere('activity.activity_date <= :toDate', { toDate: query.to_date });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['group', 'createdByUser'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    Object.assign(activity, {
      ...updateActivityDto,
      group_id:
        updateActivityDto.group_id === undefined
          ? activity.group_id
          : updateActivityDto.group_id || undefined,
      activity_date: updateActivityDto.activity_date
        ? new Date(updateActivityDto.activity_date)
        : activity.activity_date,
      description: updateActivityDto.description ?? activity.description,
      start_time: updateActivityDto.start_time ?? activity.start_time,
      end_time: updateActivityDto.end_time ?? activity.end_time,
      location: updateActivityDto.location ?? activity.location,
    });
    return this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }
}
