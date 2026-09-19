import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sanitizeHtml = require('sanitize-html');
import { SupportRequest, type SupportRequestStatus } from '../entities/support-request.entity';

/** Only images uploaded through POST /support-requests/images may be embedded. */
const SUPPORT_IMAGE_SRC = /^\/api\/files\/support\/[A-Za-z0-9_.-]+$/;

export function sanitizeSupportHtml(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && !SUPPORT_IMAGE_SRC.test(String(frame.attribs?.src ?? '')),
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  }).trim();
}

/** True when the sanitized HTML has no visible text and no image. */
function isEmptyHtml(html: string): boolean {
  if (/<img\b/i.test(html)) return false;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/&nbsp;/g, ' ').trim() === '';
}

@Injectable()
export class SupportRequestService {
  constructor(
    @InjectRepository(SupportRequest)
    private readonly repo: Repository<SupportRequest>,
  ) {}

  async create(input: {
    userId: string;
    schoolId: string | null;
    title: string;
    descriptionHtml: string;
  }): Promise<SupportRequest> {
    const title = (input.title ?? '').trim();
    if (!title) throw new BadRequestException('Title is required');
    const description = sanitizeSupportHtml(input.descriptionHtml);
    if (isEmptyHtml(description)) throw new BadRequestException('Description is required');
    const row = this.repo.create({
      user_id: input.userId,
      school_id: input.schoolId,
      title,
      description_html: description,
      status: 'open',
    });
    return this.repo.save(row);
  }

  findForUser(userId: string): Promise<SupportRequest[]> {
    return this.repo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  findAll(status?: SupportRequestStatus): Promise<SupportRequest[]> {
    const qb = this.repo
      .createQueryBuilder('sr')
      .leftJoin('sr.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.first_name_ar',
        'user.first_name_en',
        'user.last_name_ar',
        'user.last_name_en',
        'user.role',
      ])
      .orderBy('sr.created_at', 'DESC');
    if (status) qb.where('sr.status = :status', { status });
    return qb.getMany();
  }

  async findOne(id: string): Promise<SupportRequest> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Support request not found');
    return row;
  }

  async updateStatus(id: string, status: SupportRequestStatus): Promise<SupportRequest> {
    const row = await this.findOne(id);
    row.status = status;
    return this.repo.save(row);
  }
}
