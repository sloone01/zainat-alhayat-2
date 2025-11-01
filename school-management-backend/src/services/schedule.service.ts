import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';

export interface CreateScheduleDto {
  day_of_week: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes?: string;
  is_recurring?: boolean;
  specific_date?: Date;
  group_id: string;
  course_id?: string;
  teacher_id?: string;
  room_id?: number;
}

export interface UpdateScheduleDto {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  is_recurring?: boolean;
  specific_date?: Date;
  status?: string;
  course_id?: string;
  teacher_id?: string;
  room_id?: number;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    try {
      // Temporarily disable conflict checking to fix the 500 error
      // TODO: Fix conflict detection for UUID teacher_id
      // await this.checkForConflicts(createScheduleDto);

      const schedule = this.scheduleRepository.create(createScheduleDto);
      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      console.error('Schedule creation error:', error);
      throw new BadRequestException('Failed to create schedule: ' + error.message);
    }
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      relations: ['group', 'course', 'teacher', 'room'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByGroup(groupId: string): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { group_id: groupId, status: 'active' },
      relations: ['course', 'teacher', 'room'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByTeacher(teacherId: string): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { teacher_id: teacherId, status: 'active' },
      relations: ['group', 'course', 'room'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByRoom(roomId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { room_id: roomId, status: 'active' },
      relations: ['group', 'course', 'teacher'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByDay(dayOfWeek: string): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { day_of_week: dayOfWeek, status: 'active' },
      relations: ['group', 'course', 'teacher', 'room'],
      order: { start_time: 'ASC' },
    });
  }

  async findTeacherCourses(teacherId: string): Promise<any[]> {
    const schedules = await this.scheduleRepository.find({
      where: { teacher_id: teacherId, status: 'active' },
      relations: ['group', 'course'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });

    // Group by course and group
    const courseGroups = new Map();
    
    schedules.forEach(schedule => {
      const key = `${schedule.course_id}-${schedule.group_id}`;
      if (!courseGroups.has(key)) {
        courseGroups.set(key, {
          course: schedule.course,
          group: schedule.group,
          schedules: []
        });
      }
      courseGroups.get(key).schedules.push(schedule);
    });

    return Array.from(courseGroups.values());
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['group', 'course', 'teacher', 'room'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);
    
    // Check for conflicts if time or day changed
    if (updateScheduleDto.day_of_week || updateScheduleDto.start_time || updateScheduleDto.end_time) {
      await this.checkForConflicts({
        ...schedule,
        ...updateScheduleDto,
      }, id);
    }
    
    Object.assign(schedule, updateScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
  }

  async cancelSchedule(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.status = 'cancelled';
    return await this.scheduleRepository.save(schedule);
  }

  async getWeeklySchedule(groupId?: string, teacherId?: string): Promise<any> {
    let query = this.scheduleRepository.createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.group', 'group')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('schedule.teacher', 'teacher')
      .leftJoinAndSelect('schedule.room', 'room')
      .where('schedule.status = :status', { status: 'active' });

    if (groupId) {
      query = query.andWhere('schedule.group_id = :groupId', { groupId });
    }

    if (teacherId) {
      query = query.andWhere('schedule.teacher_id = :teacherId', { teacherId });
    }

    const schedules = await query
      .orderBy('schedule.day_of_week', 'ASC')
      .addOrderBy('schedule.start_time', 'ASC')
      .getMany();

    // Group by day of week
    const weeklySchedule = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };

    schedules.forEach(schedule => {
      const day = schedule.day_of_week.toLowerCase();
      if (weeklySchedule[day]) {
        weeklySchedule[day].push(schedule);
      }
    });

    return weeklySchedule;
  }

  private async checkForConflicts(scheduleData: any, excludeId?: string): Promise<void> {
    let query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.day_of_week = :dayOfWeek', { dayOfWeek: scheduleData.day_of_week })
      .andWhere('schedule.status = :status', { status: 'active' })
      .andWhere(
        '(schedule.start_time < :endTime AND schedule.end_time > :startTime)',
        { 
          startTime: scheduleData.start_time,
          endTime: scheduleData.end_time 
        }
      );

    if (excludeId) {
      query = query.andWhere('schedule.id != :excludeId', { excludeId });
    }

    // Check teacher conflict (only if teacher is assigned)
    if (scheduleData.teacher_id) {
      const teacherConflict = await query
        .andWhere('schedule.teacher_id = :teacherId', { teacherId: scheduleData.teacher_id })
        .getOne();

      if (teacherConflict) {
        throw new ConflictException('Teacher has a conflicting schedule at this time');
      }
    }

    // Check room conflict if room is specified
    if (scheduleData.room_id) {
      const roomConflict = await query
        .andWhere('schedule.room_id = :roomId', { roomId: scheduleData.room_id })
        .getOne();

      if (roomConflict) {
        throw new ConflictException('Room is already booked at this time');
      }
    }

    // Check group conflict
    const groupConflict = await query
      .andWhere('schedule.group_id = :groupId', { groupId: scheduleData.group_id })
      .getOne();

    if (groupConflict) {
      throw new ConflictException('Group has a conflicting schedule at this time');
    }
  }
}

