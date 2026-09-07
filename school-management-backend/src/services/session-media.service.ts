import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionMedia } from '../entities/session-media.entity';
import { WeeklySessionPlan } from '../entities/weekly-session-plan.entity';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

export interface CreateSessionMediaDto {
  session_plan_id: string;
  file_name: string;
  file_path: string;
  file_type: 'photo' | 'video';
  file_size: number;
  mime_type: string;
  uploaded_by: string;
}

export interface UpdateSessionMediaDto {
  file_name?: string;
  file_path?: string;
  file_type?: 'photo' | 'video';
  file_size?: number;
  mime_type?: string;
}

@Injectable()
export class SessionMediaService {
  constructor(
    @InjectRepository(SessionMedia)
    private sessionMediaRepository: Repository<SessionMedia>,
    @InjectRepository(WeeklySessionPlan)
    private readonly planRepo: Repository<WeeklySessionPlan>,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  async create(createDto: CreateSessionMediaDto): Promise<SessionMedia> {
    const media = this.sessionMediaRepository.create({
      ...createDto,
      uploaded_at: new Date(),
    });
    
    const saved = await this.sessionMediaRepository.save(media);
    void this.notifySessionMedia(saved);
    return saved;
  }

  async createMultiple(mediaList: CreateSessionMediaDto[]): Promise<SessionMedia[]> {
    const mediaEntities = mediaList.map(dto => 
      this.sessionMediaRepository.create({
        ...dto,
        uploaded_at: new Date(),
      })
    );
    
    const saved = await this.sessionMediaRepository.save(mediaEntities);
    if (saved[0]) void this.notifySessionMedia(saved[0]);
    return saved;
  }

  private async notifySessionMedia(media: SessionMedia): Promise<void> {
    const plan = await this.planRepo.findOne({
      where: { id: media.session_plan_id },
      relations: ['schedule', 'schedule.course', 'schedule.group'],
    });
    if (!plan?.schedule?.group_id) return;
    if (plan.schedule.course && plan.schedule.course.send_notifications === false) return;
    const { schoolId, recipients } = await this.audience.parentsOfGroup(plan.schedule.group_id);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.SESSION_MEDIA_UPLOADED,
      locale: 'ar',
      variables: {
        title: media.file_type || media.file_name || 'media',
        courseName: plan.schedule.course?.title || plan.schedule.course?.name || '',
        recipientName: recipients[0]?.name || 'ولي الأمر',
      },
      recipients,
    });
  }

  async findBySessionPlanId(sessionPlanId: string): Promise<SessionMedia[]> {
    return await this.sessionMediaRepository.find({
      where: { session_plan_id: sessionPlanId },
      order: { uploaded_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<SessionMedia> {
    const media = await this.sessionMediaRepository.findOne({
      where: { id },
      relations: ['sessionPlan', 'uploadedByUser'],
    });

    if (!media) {
      throw new NotFoundException(`Session media with ID ${id} not found`);
    }

    return media;
  }

  async update(id: number, updateDto: UpdateSessionMediaDto): Promise<SessionMedia> {
    const media = await this.findById(id);
    
    Object.assign(media, updateDto);
    
    return await this.sessionMediaRepository.save(media);
  }

  async delete(id: number): Promise<void> {
    const media = await this.findById(id);
    await this.sessionMediaRepository.remove(media);
  }

  async deleteBySessionPlanId(sessionPlanId: string): Promise<void> {
    await this.sessionMediaRepository.delete({ session_plan_id: sessionPlanId });
  }

  async findAll(): Promise<SessionMedia[]> {
    return await this.sessionMediaRepository.find({
      relations: ['sessionPlan', 'uploadedByUser'],
      order: { uploaded_at: 'DESC' },
    });
  }

  async findByUploadedBy(uploadedBy: string): Promise<SessionMedia[]> {
    return await this.sessionMediaRepository.find({
      where: { uploaded_by: uploadedBy },
      relations: ['sessionPlan'],
      order: { uploaded_at: 'DESC' },
    });
  }

  async getMediaStats(sessionPlanId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    photoCount: number;
    videoCount: number;
  }> {
    const queryBuilder = this.sessionMediaRepository.createQueryBuilder('media');
    
    if (sessionPlanId) {
      queryBuilder.where('media.session_plan_id = :sessionPlanId', { sessionPlanId });
    }
    
    const media = await queryBuilder.getMany();
    
    return {
      totalFiles: media.length,
      totalSize: media.reduce((sum, m) => sum + m.file_size, 0),
      photoCount: media.filter(m => m.file_type === 'photo').length,
      videoCount: media.filter(m => m.file_type === 'video').length,
    };
  }
}
