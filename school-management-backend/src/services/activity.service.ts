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
  /** Parents who approved / parents in the activity audience. Null when approval is off. */
  approval_approved: number | null;
  approval_total: number | null;
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
    const [row] = await this.attachLetters([activity]);
    return row;
  }

  private async attachLetters(activities: Activity[]): Promise<ActivityWithLetter[]> {
    if (!activities.length) return [];
    const ids = activities.map((a) => a.id);
    const letters = await this.letterRepo
      .createQueryBuilder('ml')
      .where('ml.activity_id IN (:...ids)', { ids })
      .getMany();
    const byActivity = new Map(letters.map((l) => [l.activity_id, l]));
    const progress = await this.approvalProgress(activities);
    return activities.map((activity) => {
      const letter = byActivity.get(activity.id);
      const counts = activity.requires_parent_approval ? progress.get(activity.id) : undefined;
      return {
        ...activity,
        approval_letter_id: letter?.id ?? null,
        parent_approval_letter:
          activity.requires_parent_approval && letter ? letterBundleFromEntity(letter) : null,
        approval_approved: counts?.approved ?? null,
        approval_total: counts?.total ?? null,
      };
    });
  }

  /** Approved parents vs audience size for activities that require parent approval. */
  private async approvalProgress(
    activities: Activity[],
  ): Promise<Map<string, { approved: number; total: number }>> {
    const needing = activities.filter((a) => a.requires_parent_approval);
    const out = new Map<string, { approved: number; total: number }>();
    if (!needing.length) return out;

    const groupIds = [...new Set(needing.map((a) => a.group_id).filter((id): id is string => !!id))];
    const schoolIds = [
      ...new Set(needing.filter((a) => !a.group_id).map((a) => a.school_id).filter(Boolean)),
    ];
    const activityIds = needing.map((a) => a.id);

    const [groupTotals, schoolTotals, approvedRows] = await Promise.all([
      groupIds.length
        ? this.activityRepository.manager.query(
            `SELECT sg.group_id::text AS key, COUNT(DISTINCT sp.parent_id)::int AS total
             FROM student_groups sg
             INNER JOIN student_parents sp ON sp.student_id = sg.student_id
             WHERE sg.group_id = ANY($1::uuid[])
             GROUP BY sg.group_id`,
            [groupIds],
          )
        : Promise.resolve([]),
      schoolIds.length
        ? this.activityRepository.manager.query(
            `SELECT s.school_id::text AS key, COUNT(DISTINCT sp.parent_id)::int AS total
             FROM students s
             INNER JOIN student_parents sp ON sp.student_id = s.id
             WHERE s.school_id = ANY($1::uuid[])
             GROUP BY s.school_id`,
            [schoolIds],
          )
        : Promise.resolve([]),
      this.activityRepository.manager.query(
        `SELECT activity_id::text AS activity_id, COUNT(DISTINCT recipient)::int AS approved
         FROM (
           SELECT ml.activity_id,
                  NULLIF(m.metadata->>'targetUserId', '') AS recipient,
                  m.metadata->'approval'->>'status' AS status
           FROM adhoc_chat_messages m
           INNER JOIN school_message_letters ml ON ml.id::text = m.metadata->>'letterId'
           WHERE ml.activity_id = ANY($1::uuid[])
             AND m.metadata->>'kind' = 'message_letter'
           UNION
           SELECT ml.activity_id,
                  CASE
                    WHEN m.user_id = t.user_low_id THEN t.user_high_id::text
                    ELSE t.user_low_id::text
                  END AS recipient,
                  m.metadata->'approval'->>'status' AS status
           FROM direct_chat_messages m
           INNER JOIN direct_chat_threads t ON t.id = m.thread_id
           INNER JOIN school_message_letters ml ON ml.id::text = m.metadata->>'letterId'
           WHERE ml.activity_id = ANY($1::uuid[])
             AND m.metadata->>'kind' = 'message_letter'
         ) rows
         WHERE status = 'approved' AND recipient IS NOT NULL
         GROUP BY activity_id`,
        [activityIds],
      ),
    ]);

    const groupTotal = new Map<string, number>(
      (groupTotals as { key: string; total: number }[]).map((r) => [r.key, Number(r.total) || 0]),
    );
    const schoolTotal = new Map<string, number>(
      (schoolTotals as { key: string; total: number }[]).map((r) => [r.key, Number(r.total) || 0]),
    );
    const approved = new Map<string, number>(
      (approvedRows as { activity_id: string; approved: number }[]).map((r) => [
        r.activity_id,
        Number(r.approved) || 0,
      ]),
    );

    for (const activity of needing) {
      const total = activity.group_id
        ? groupTotal.get(activity.group_id) ?? 0
        : schoolTotal.get(activity.school_id) ?? 0;
      const rawApproved = approved.get(activity.id) ?? 0;
      out.set(activity.id, { approved: Math.min(rawApproved, total), total });
    }
    return out;
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
    activity.school_id = createActivityDto.school_id as string;
    activity.group_id = createActivityDto.group_id;
    activity.created_by = createActivityDto.created_by;
    activity.requires_parent_approval = createActivityDto.requires_parent_approval ?? false;

    const saved = await this.activityRepository.save(activity);
    await this.syncApprovalLetter(saved, createActivityDto.parent_approval_letter);
    void this.notifyActivityScheduled(saved);
    return this.attachLetter(await this.findOneEntity(saved.id));
  }

  private async findOneEntity(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['group', 'createdByUser'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async findAll(query: ActivityQueryDto): Promise<ActivityWithLetter[]> {
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

    const activities = await qb.getMany();
    return this.attachLetters(activities);
  }

  async findOne(id: string): Promise<ActivityWithLetter> {
    return this.attachLetter(await this.findOneEntity(id));
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<ActivityWithLetter> {
    const activity = await this.findOneEntity(id);
    const prevDate =
      activity.activity_date instanceof Date
        ? activity.activity_date.toISOString().slice(0, 10)
        : String(activity.activity_date || '').slice(0, 10);
    const prevLocation = activity.location || '';
    const { requires_parent_approval: dtoRequiresApproval, parent_approval_letter: dtoLetter, image_url: dtoImage, ...patch } =
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

    if (dtoImage === null) {
      activity.image_url = null;
    }

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

  async setImage(id: string, filename: string): Promise<ActivityWithLetter> {
    const activity = await this.findOneEntity(id);
    activity.image_url = `/api/files/activities/${filename}`;
    await this.activityRepository.save(activity);
    return this.attachLetter(await this.findOneEntity(id));
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOneEntity(id);
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
