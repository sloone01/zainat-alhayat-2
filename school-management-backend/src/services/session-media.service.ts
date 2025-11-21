import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionMedia } from '../entities/session-media.entity';

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
  ) {}

  async create(createDto: CreateSessionMediaDto): Promise<SessionMedia> {
    const media = this.sessionMediaRepository.create({
      ...createDto,
      uploaded_at: new Date(),
    });
    
    return await this.sessionMediaRepository.save(media);
  }

  async createMultiple(mediaList: CreateSessionMediaDto[]): Promise<SessionMedia[]> {
    const mediaEntities = mediaList.map(dto => 
      this.sessionMediaRepository.create({
        ...dto,
        uploaded_at: new Date(),
      })
    );
    
    return await this.sessionMediaRepository.save(mediaEntities);
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
