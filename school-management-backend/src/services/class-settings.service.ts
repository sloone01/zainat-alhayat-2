import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSettings } from '../entities/class-settings.entity';
import { Schedule } from '../entities/schedule.entity';

export interface CreateClassSettingsDto {
  durations: number[];
  startTimes: string[];
  defaultDuration?: number;
  is_active?: boolean;
}

export interface UpdateClassSettingsDto {
  durations?: number[];
  startTimes?: string[];
  defaultDuration?: number;
  is_active?: boolean;
}

@Injectable()
export class ClassSettingsService {
  constructor(
    @InjectRepository(ClassSettings)
    private classSettingsRepository: Repository<ClassSettings>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createClassSettingsDto: CreateClassSettingsDto, schoolId: number): Promise<ClassSettings> {
    const classSettings = this.classSettingsRepository.create({
      ...createClassSettingsDto,
      school_id: schoolId,
    });
    return this.classSettingsRepository.save(classSettings);
  }

  async findAll(schoolId: number): Promise<(ClassSettings & { in_use?: boolean })[]> {
    const settings = await this.classSettingsRepository.find({
      where: { school_id: schoolId },
      order: { created_at: 'DESC' },
    });
    const usedMinutes = await this.getUsedDurationMinutes(schoolId);

    return settings.map((setting) => ({
      ...setting,
      in_use:
        setting.setting_type === 'duration' &&
        setting.duration_minutes != null &&
        usedMinutes.has(setting.duration_minutes),
    }));
  }

  async findOne(id: string, schoolId?: number): Promise<ClassSettings> {
    const where: { id: string; school_id?: number } = { id };
    if (schoolId != null) {
      where.school_id = schoolId;
    }

    const classSettings = await this.classSettingsRepository.findOne({ where });

    if (!classSettings) {
      throw new NotFoundException(`Class settings with ID ${id} not found`);
    }

    return classSettings;
  }

  async findActive(schoolId: number): Promise<ClassSettings | null> {
    return this.classSettingsRepository.findOne({
      where: { is_active: true, school_id: schoolId },
    });
  }

  async update(
    id: string,
    updateClassSettingsDto: UpdateClassSettingsDto,
    schoolId: number,
  ): Promise<ClassSettings> {
    const classSettings = await this.findOne(id, schoolId);

    Object.assign(classSettings, updateClassSettingsDto);
    return this.classSettingsRepository.save(classSettings);
  }

  async remove(id: string, schoolId: number): Promise<void> {
    const classSettings = await this.findOne(id, schoolId);
    await this.classSettingsRepository.remove(classSettings);
  }

  async setActive(id: string, schoolId: number): Promise<ClassSettings> {
    await this.classSettingsRepository.update({ school_id: schoolId }, { is_active: false });

    const classSettings = await this.findOne(id, schoolId);
    classSettings.is_active = true;
    return this.classSettingsRepository.save(classSettings);
  }

  async getOrCreateDefault(schoolId: number): Promise<ClassSettings> {
    let activeSettings = await this.findActive(schoolId);

    if (!activeSettings) {
      activeSettings = this.classSettingsRepository.create({
        setting_type: 'duration',
        name: 'Default Duration',
        duration_minutes: 60,
        is_default: true,
        is_active: true,
        order_index: 1,
        school_id: schoolId,
      });
      activeSettings = await this.classSettingsRepository.save(activeSettings);
    }

    return activeSettings;
  }

  async addDuration(duration: number, schoolId: number, name?: string): Promise<ClassSettings> {
    const existingDefault = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', is_default: true, school_id: schoolId },
    });

    const durationSetting = this.classSettingsRepository.create({
      setting_type: 'duration',
      name: name?.trim() || `${duration} minutes`,
      duration_minutes: duration,
      is_default: !existingDefault,
      is_active: true,
      order_index: duration,
      school_id: schoolId,
    });

    return this.classSettingsRepository.save(durationSetting);
  }

  async updateDuration(
    id: string,
    schoolId: number,
    data: { duration: number; name?: string },
  ): Promise<ClassSettings> {
    const setting = await this.findOne(id, schoolId);
    if (setting.setting_type !== 'duration') {
      throw new BadRequestException('Setting is not a duration');
    }

    setting.name = data.name?.trim() || setting.name;
    setting.duration_minutes = data.duration;
    setting.order_index = data.duration;
    return this.classSettingsRepository.save(setting);
  }

  async getUsedDurationMinutes(schoolId: number): Promise<Set<number>> {
    const rows = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.group', 'group')
      .select('DISTINCT schedule.duration_minutes', 'minutes')
      .where('schedule.duration_minutes IS NOT NULL')
      .andWhere('group.school_id = :schoolId', { schoolId })
      .getRawMany<{ minutes: number | string }>();

    return new Set(
      rows
        .map((row) => Number(row.minutes))
        .filter((minutes) => Number.isFinite(minutes)),
    );
  }

  async isDurationInUse(duration: number, schoolId: number): Promise<boolean> {
    const count = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.group', 'group')
      .where('schedule.duration_minutes = :duration', { duration })
      .andWhere('group.school_id = :schoolId', { schoolId })
      .getCount();
    return count > 0;
  }

  async removeDuration(duration: number, schoolId: number): Promise<void> {
    if (await this.isDurationInUse(duration, schoolId)) {
      throw new BadRequestException(
        'This duration is used in the timetable and cannot be deleted',
      );
    }

    await this.classSettingsRepository.delete({
      setting_type: 'duration',
      duration_minutes: duration,
      school_id: schoolId,
    });
  }

  async addStartTime(startTime: string, schoolId: number): Promise<ClassSettings> {
    const startTimeSetting = this.classSettingsRepository.create({
      setting_type: 'start_time',
      name: `Start at ${startTime}`,
      time_value: startTime,
      is_active: true,
      order_index: 1,
      school_id: schoolId,
    });

    return this.classSettingsRepository.save(startTimeSetting);
  }

  async removeStartTime(startTime: string, schoolId: number): Promise<void> {
    await this.classSettingsRepository.delete({
      setting_type: 'start_time',
      time_value: startTime,
      school_id: schoolId,
    });
  }

  async setDefaultDuration(duration: number, schoolId: number): Promise<ClassSettings> {
    await this.classSettingsRepository.update(
      { setting_type: 'duration', school_id: schoolId },
      { is_default: false },
    );

    let durationSetting = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', duration_minutes: duration, school_id: schoolId },
    });

    if (!durationSetting) {
      durationSetting = await this.addDuration(duration, schoolId);
    }

    durationSetting.is_default = true;
    return this.classSettingsRepository.save(durationSetting);
  }

  async validateTimeSlot(startTime: string, duration: number, schoolId: number): Promise<boolean> {
    const startTimeExists = await this.classSettingsRepository.findOne({
      where: {
        setting_type: 'start_time',
        time_value: startTime,
        is_active: true,
        school_id: schoolId,
      },
    });

    const durationExists = await this.classSettingsRepository.findOne({
      where: {
        setting_type: 'duration',
        duration_minutes: duration,
        is_active: true,
        school_id: schoolId,
      },
    });

    return !!startTimeExists && !!durationExists;
  }

  async getAvailableTimeSlots(schoolId: number): Promise<{
    durations: number[];
    startTimes: string[];
    defaultDuration: number;
  }> {
    const durationSettings = await this.classSettingsRepository.find({
      where: { setting_type: 'duration', is_active: true, school_id: schoolId },
      order: { duration_minutes: 'ASC' },
    });

    const startTimeSettings = await this.classSettingsRepository.find({
      where: { setting_type: 'start_time', is_active: true, school_id: schoolId },
      order: { time_value: 'ASC' },
    });

    const defaultDurationSetting = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', is_default: true, is_active: true, school_id: schoolId },
    });

    return {
      durations: durationSettings.map((s) => s.duration_minutes).filter((d) => d !== null),
      startTimes: startTimeSettings.map((s) => s.time_value).filter((t) => t !== null),
      defaultDuration: defaultDurationSetting?.duration_minutes || 60,
    };
  }
}
