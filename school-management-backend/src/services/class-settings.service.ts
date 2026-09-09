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

  async create(createClassSettingsDto: CreateClassSettingsDto): Promise<ClassSettings> {
    const classSettings = this.classSettingsRepository.create(createClassSettingsDto);
    return this.classSettingsRepository.save(classSettings);
  }

  async findAll(schoolId?: number | null): Promise<(ClassSettings & { in_use?: boolean })[]> {
    const settings = await this.classSettingsRepository.find({
      where: schoolId == null ? {} : { school_id: schoolId },
      order: { created_at: 'DESC' }
    });
    const usedMinutes = await this.getUsedDurationMinutes();

    return settings.map((setting) => ({
      ...setting,
      in_use:
        setting.setting_type === 'duration' &&
        setting.duration_minutes != null &&
        usedMinutes.has(setting.duration_minutes),
    }));
  }

  async findOne(id: string): Promise<ClassSettings> {
    const classSettings = await this.classSettingsRepository.findOne({
      where: { id }
    });

    if (!classSettings) {
      throw new NotFoundException(`Class settings with ID ${id} not found`);
    }

    return classSettings;
  }

  async findActive(): Promise<ClassSettings | null> {
    return this.classSettingsRepository.findOne({
      where: { is_active: true }
    });
  }

  async update(id: string, updateClassSettingsDto: UpdateClassSettingsDto): Promise<ClassSettings> {
    const classSettings = await this.findOne(id);

    Object.assign(classSettings, updateClassSettingsDto);
    return this.classSettingsRepository.save(classSettings);
  }

  async remove(id: string): Promise<void> {
    const classSettings = await this.findOne(id);
    await this.classSettingsRepository.remove(classSettings);
  }

  async setActive(id: string): Promise<ClassSettings> {
    // First, deactivate all existing settings
    await this.classSettingsRepository.update({}, { is_active: false });

    // Then activate the specified one
    const classSettings = await this.findOne(id);
    classSettings.is_active = true;
    return this.classSettingsRepository.save(classSettings);
  }

  async getOrCreateDefault(): Promise<ClassSettings> {
    let activeSettings = await this.findActive();

    if (!activeSettings) {
      // Create a basic default setting
      activeSettings = this.classSettingsRepository.create({
        setting_type: 'duration',
        name: 'Default Duration',
        duration_minutes: 60,
        is_default: true,
        is_active: true,
        order_index: 1,
        school_id: 1 // This should be passed as parameter
      });
      activeSettings = await this.classSettingsRepository.save(activeSettings);
    }

    return activeSettings;
  }

  async addDuration(duration: number, name?: string): Promise<ClassSettings> {
    const durationSetting = this.classSettingsRepository.create({
      setting_type: 'duration',
      name: name?.trim() || `${duration} minutes`,
      duration_minutes: duration,
      is_active: true,
      order_index: duration,
      school_id: 1
    });

    return this.classSettingsRepository.save(durationSetting);
  }

  async updateDuration(
    id: string,
    data: { duration: number; name?: string },
  ): Promise<ClassSettings> {
    const setting = await this.findOne(id);
    if (setting.setting_type !== 'duration') {
      throw new BadRequestException('Setting is not a duration');
    }

    setting.name = data.name?.trim() || setting.name;
    setting.duration_minutes = data.duration;
    setting.order_index = data.duration;
    return this.classSettingsRepository.save(setting);
  }

  async getUsedDurationMinutes(): Promise<Set<number>> {
    const rows = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('DISTINCT schedule.duration_minutes', 'minutes')
      .where('schedule.duration_minutes IS NOT NULL')
      .getRawMany<{ minutes: number | string }>();

    return new Set(
      rows
        .map((row) => Number(row.minutes))
        .filter((minutes) => Number.isFinite(minutes)),
    );
  }

  async isDurationInUse(duration: number): Promise<boolean> {
    const count = await this.scheduleRepository.count({
      where: { duration_minutes: duration },
    });
    return count > 0;
  }

  async removeDuration(duration: number): Promise<void> {
    if (await this.isDurationInUse(duration)) {
      throw new BadRequestException(
        'This duration is used in the timetable and cannot be deleted',
      );
    }

    await this.classSettingsRepository.delete({
      setting_type: 'duration',
      duration_minutes: duration
    });
  }

  async addStartTime(startTime: string): Promise<ClassSettings> {
    // Create a new start time setting
    const startTimeSetting = this.classSettingsRepository.create({
      setting_type: 'start_time',
      name: `Start at ${startTime}`,
      time_value: startTime,
      is_active: true,
      order_index: 1,
      school_id: 1 // This should be passed as parameter
    });

    return this.classSettingsRepository.save(startTimeSetting);
  }

  async removeStartTime(startTime: string): Promise<void> {
    // Find and remove start time settings with this value
    await this.classSettingsRepository.delete({
      setting_type: 'start_time',
      time_value: startTime
    });
  }

  async setDefaultDuration(duration: number): Promise<ClassSettings> {
    // Set all duration settings to non-default first
    await this.classSettingsRepository.update(
      { setting_type: 'duration' },
      { is_default: false }
    );

    // Find or create the duration setting and set as default
    let durationSetting = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', duration_minutes: duration }
    });

    if (!durationSetting) {
      durationSetting = await this.addDuration(duration);
    }

    durationSetting.is_default = true;
    return this.classSettingsRepository.save(durationSetting);
  }

  async validateTimeSlot(startTime: string, duration: number): Promise<boolean> {
    // Check if both start time and duration settings exist
    const startTimeExists = await this.classSettingsRepository.findOne({
      where: { setting_type: 'start_time', time_value: startTime, is_active: true }
    });

    const durationExists = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', duration_minutes: duration, is_active: true }
    });

    return !!startTimeExists && !!durationExists;
  }

  async getAvailableTimeSlots(): Promise<{
    durations: number[];
    startTimes: string[];
    defaultDuration: number;
  }> {
    // Get all duration settings
    const durationSettings = await this.classSettingsRepository.find({
      where: { setting_type: 'duration', is_active: true },
      order: { duration_minutes: 'ASC' }
    });

    // Get all start time settings
    const startTimeSettings = await this.classSettingsRepository.find({
      where: { setting_type: 'start_time', is_active: true },
      order: { time_value: 'ASC' }
    });

    // Get default duration
    const defaultDurationSetting = await this.classSettingsRepository.findOne({
      where: { setting_type: 'duration', is_default: true, is_active: true }
    });

    return {
      durations: durationSettings.map(s => s.duration_minutes).filter(d => d !== null),
      startTimes: startTimeSettings.map(s => s.time_value).filter(t => t !== null),
      defaultDuration: defaultDurationSetting?.duration_minutes || 60
    };
  }
}

