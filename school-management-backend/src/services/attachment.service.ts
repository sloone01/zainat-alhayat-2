import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { createReadStream, existsSync, promises as fsp } from 'fs';
import { join } from 'path';
import {
  ATTACHMENT_ENTITY_TYPES,
  Attachment,
  AttachmentEntityType,
  AttachmentLink,
} from '../entities/attachment.entity';
import { uploadsRoot } from '../common/security/runtime-secrets';

export const ATTACHMENTS_DIR = 'attachments';

function isEntityType(value: string): value is AttachmentEntityType {
  return (ATTACHMENT_ENTITY_TYPES as readonly string[]).includes(value);
}

/**
 * Self-contained attachment storage: saves file metadata, links attachments to
 * any entity (entity_type + entity_id), lists per entity, streams downloads and
 * deletes both row and file. No other service is required — controllers pass in
 * the multer file and this service does the rest.
 */
@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    @InjectRepository(Attachment) private readonly attachments: Repository<Attachment>,
    @InjectRepository(AttachmentLink) private readonly links: Repository<AttachmentLink>,
  ) {}

  assertEntityType(value: string): AttachmentEntityType {
    if (!isEntityType(value)) {
      throw new BadRequestException(
        `Unknown entity_type "${value}". Allowed: ${ATTACHMENT_ENTITY_TYPES.join(', ')}`,
      );
    }
    return value;
  }

  /** Absolute path of a stored attachment file. */
  private pathOf(storedName: string): string {
    // stored_name is server-generated, but never trust it blindly.
    if (storedName.includes('..') || storedName.includes('/') || storedName.includes('\\')) {
      throw new BadRequestException('Invalid file path');
    }
    return join(uploadsRoot(), ATTACHMENTS_DIR, storedName);
  }

  /**
   * Register an uploaded file (already written to disk by multer) and
   * optionally link it to an entity in the same call.
   */
  async register(input: {
    file: Express.Multer.File;
    uploadedBy?: string | null;
    schoolId?: string | null;
    link?: { entityType: string; entityId: string } | null;
  }): Promise<Attachment> {
    const { file } = input;
    let checksum: string | null = null;
    try {
      const buf = await fsp.readFile(this.pathOf(file.filename));
      checksum = createHash('sha256').update(buf).digest('hex');
    } catch {
      /* checksum is best-effort */
    }
    const row = this.attachments.create({
      file_name: (file.originalname || file.filename).slice(0, 255),
      stored_name: file.filename,
      mime_type: file.mimetype || 'application/octet-stream',
      size_bytes: file.size,
      url: '', // set below once the id exists
      checksum,
      uploaded_by: input.uploadedBy ?? null,
      school_id: input.schoolId ?? null,
    });
    const saved = await this.attachments.save(row);
    saved.url = `/api/attachments/${saved.id}/download`;
    await this.attachments.update(saved.id, { url: saved.url });

    if (input.link) {
      await this.addLink(saved.id, input.link.entityType, input.link.entityId);
    }
    this.logger.log(`attachment ${saved.id} stored (${saved.file_name}, ${saved.size_bytes}B)`);
    return saved;
  }

  /** Link an existing attachment to an entity (idempotent). */
  async addLink(attachmentId: string, entityType: string, entityId: string): Promise<AttachmentLink> {
    const type = this.assertEntityType(entityType);
    await this.findOne(attachmentId); // 404 if unknown
    const existing = await this.links.findOne({
      where: { attachment_id: attachmentId, entity_type: type, entity_id: entityId },
    });
    if (existing) return existing;
    return this.links.save(
      this.links.create({ attachment_id: attachmentId, entity_type: type, entity_id: entityId }),
    );
  }

  async removeLink(linkId: string): Promise<void> {
    const res = await this.links.delete({ id: linkId });
    if (!res.affected) throw new NotFoundException('Attachment link not found');
  }

  /** All attachments linked to one entity, newest first. */
  async listForEntity(entityType: string, entityId: string): Promise<Attachment[]> {
    const type = this.assertEntityType(entityType);
    const rows = await this.links.find({
      where: { entity_type: type, entity_id: entityId },
      relations: { attachment: true },
      order: { created_at: 'DESC' },
    });
    return rows.map((l) => l.attachment!).filter(Boolean);
  }

  async findOne(id: string): Promise<Attachment> {
    const row = await this.attachments.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Attachment not found');
    return row;
  }

  /** Row + a readable stream of the file, for the download endpoint. */
  async openStream(id: string): Promise<{ row: Attachment; stream: NodeJS.ReadableStream }> {
    const row = await this.findOne(id);
    const path = this.pathOf(row.stored_name);
    if (!existsSync(path)) {
      // Metadata survived but the binary is gone (e.g. redeploy without a volume).
      throw new NotFoundException('Attachment file is missing from storage');
    }
    return { row, stream: createReadStream(path) };
  }

  /** Delete the attachment row (links cascade) and its file on disk. */
  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.attachments.delete({ id });
    try {
      await fsp.unlink(this.pathOf(row.stored_name));
    } catch {
      this.logger.warn(`attachment ${id}: row deleted but file removal failed`);
    }
  }

  /** House-keeping for entity deletion: drop every link of that entity. */
  async removeAllLinksFor(entityType: string, entityId: string): Promise<number> {
    const type = this.assertEntityType(entityType);
    const res = await this.links.delete({ entity_type: type, entity_id: entityId });
    return res.affected ?? 0;
  }
}
