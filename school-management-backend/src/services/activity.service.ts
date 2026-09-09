import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { SchoolMessageLetter } from '../entities/school-message-letter.entity';
import {
  ActivityQueryDto,
  CreateActivityDto,
  ParentApprovalLetterBundleDto,
  UpdateActivityDto,
} from '../dto/activity.dto';
import {
  applyLetterBundleToEntity,
  audienceFromActivity,
  letterBundleFromEntity,
} from './activity-message-letter.helper';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

export type ActivityWithLetter = Activity & {
  parent_approval_letter: ParentApprovalLetterBundleDto | null;
  approval_letter_id: string | null;
};

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(SchoolMessageLetter)
    private readonly letterRepo: Repository<SchoolMessageLetter>,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  private async findLetterForActivity(activityId: string): Promise<SchoolMessageLetter | null> {
    return this.letterRepo.findOne({ where: { activity_id: activityId } });
  }

  private async attachLetter(activity: Activity): Promise<ActivityWithLetter> {
    const letter = await this.findLetterForActivity(activity.id);
    return {
      ...activity,
      approval_letter_id: letter?.id ?? null,
      parent_approval_letter:
        activity.requires_parent_approval && letter ? letterBundleFromEntity(letter) : null,
    };
  }

  private async attachLetters(activities: Activity[]): Promise<ActivityWithLetter[]> {
    if (!activities.length) return [];
    const ids = activities.map((a) => a.id);
    const letters = await this.letterRepo
      .createQueryBuilder('ml')
      .where('ml.activity_id IN (:...ids)', { ids })
      .getMany();
    const byActivity = new Map(letters.map((l) => [l.activity_id, l]));
    return activities.map((activity) => {
      const letter = byActivity.get(activity.id);
      return {
        ...activity,
        approval_letter_id: letter?.id ?? null,
        parent_approval_letter:
          activity.requires_parent_approval && letter ? letterBundleFromEntity(letter) : null,
      };
    });
  }

  private async syncApprovalLetter(
    activity: Activity,
    bundle: ParentApprovalLetterBundleDto | null | undefined,
  ): Promise<void> {
    const existing = await this.findLetterForActivity(activity.id);

    if (!activity.requires_parent_approval) {
      if (existing) {
        await this.letterRepo.delete({ id: existing.id });
      }
      return;
    }

    if (!bundle) {
      return;
    }

    const letter = existing ?? this.letterRepo.create();
    applyLetterBundleToEntity(letter, activity, bundle);
    await this.letterRepo.save(letter);
  }

  async create(createActivityDto: CreateActivityDto): Promise<ActivityWithLetter> {
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
    activity.requires_parent_approval = createActivityDto.requires_parent_approval ?? false;

    const saved = await this.activityRepository.save(activity);
    await this.syncApprovalLetter(saved, createActivityDto.parent_approval_letter);
    void this.notifyActivityScheduled(saved);
    return this.attachLetter(await this.findOneEntity(saved.id));
  }

  private async findOneEntity(id: string, schoolId?: number | null): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: schoolId == null ? { id } : { id, school_id: schoolId },
      relations: ['group', 'createdByUser'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async findAll(query: ActivityQueryDto, schoolId?: number | null): Promise<ActivityWithLetter[]> {
    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.group', 'group')
      .leftJoinAndSelect('activity.createdByUser', 'createdByUser')
      .orderBy('activity.activity_date', 'DESC')
      .addOrderBy('activity.created_at', 'DESC');

    // Derived from the token: without this every school saw every school's activities.
    const effectiveSchoolId = schoolId ?? query.school_id;
    if (effectiveSchoolId !== undefined && effectiveSchoolId !== null) {
      qb.andWhere('activity.school_id = :schoolId', { schoolId: effectiveSchoolId });
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

    const activities = await qb.getMany();
    return this.attachLetters(activities);
  }

  async findOne(id: string, schoolId?: number | null): Promise<ActivityWithLetter> {
    return this.attachLetter(await this.findOneEntity(id, schoolId));
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, schoolId?: number | null): Promise<ActivityWithLetter> {
    const activity = await this.findOneEntity(id, schoolId);
    const prevDate =
      activity.activity_date instanceof Date
        ? activity.activity_date.toISOString().slice(0, 10)
        : String(activity.activity_date || '').slice(0, 10);
    const prevLocation = activity.location || '';
    const { requires_parent_approval: dtoRequiresApproval, parent_approval_letter: dtoLetter, ...patch } =
      updateActivityDto;

    Object.assign(activity, {
      ...patch,
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

    if (dtoRequiresApproval !== undefined) {
      activity.requires_parent_approval = dtoRequiresApproval;
    }

    const saved = await this.activityRepository.save(activity);
    const nextDate =
      saved.activity_date instanceof Date
        ? saved.activity_date.toISOString().slice(0, 10)
        : String(saved.activity_date || '').slice(0, 10);
    if (nextDate !== prevDate || (saved.location || '') !== prevLocation) {
      void this.notifyActivityUpdated(saved);
    }

    if (dtoLetter !== undefined) {
      await this.syncApprovalLetter(saved, dtoLetter ?? null);
    } else if (saved.requires_parent_approval) {
      const existing = await this.findLetterForActivity(saved.id);
      if (existing) {
        existing.title = saved.title.trim();
        existing.audience = audienceFromActivity(saved) as unknown as Record<string, unknown>;
        await this.letterRepo.save(existing);
      }
    } else {
      await this.syncApprovalLetter(saved, null);
    }

    return this.attachLetter(await this.findOneEntity(saved.id));
  }

  async remove(id: string, schoolId?: number | null): Promise<void> {
    const activity = await this.findOneEntity(id, schoolId);
    await this.activityRepository.remove(activity);
  }

  private async notifyActivityScheduled(activity: Activity): Promise<void> {
    if (!activity.group_id) return;
    const { schoolId, recipients } = await this.audience.parentsOfGroup(activity.group_id);
    if (!recipients.length) return;
    const date =
      activity.activity_date instanceof Date
        ? activity.activity_date.toISOString().slice(0, 10)
        : String(activity.activity_date).slice(0, 10);
    const location = activity.location ? ` — ${activity.location}` : '';
    await this.notifications.notifySafe({
      schoolId: schoolId ?? activity.school_id ?? null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.ACTIVITY_SCHEDULED,
      locale: 'ar',
      variables: {
        title: activity.title,
        date,
        location,
        recipientName: recipients[0]?.name || 'ولي الأمر',
      },
      recipients,
    });
  }

  private async notifyActivityUpdated(activity: Activity): Promise<void> {
    if (!activity.group_id) return;
    const { schoolId, recipients } = await this.audience.parentsOfGroup(activity.group_id);
    if (!recipients.length) return;
    const date =
      activity.activity_date instanceof Date
        ? activity.activity_date.toISOString().slice(0, 10)
        : String(activity.activity_date).slice(0, 10);
    const location = activity.location ? ` — ${activity.location}` : '';
    await this.notifications.notifySafe({
      schoolId: schoolId ?? activity.school_id ?? null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.ACTIVITY_UPDATED,
      locale: 'ar',
      variables: {
        title: activity.title,
        date,
        location,
        recipientName: recipients[0]?.name || 'ولي الأمر',
      },
      recipients,
    });
  }
}
