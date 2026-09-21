import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { extname } from 'path';
import {
  ATTACHMENT_ENTITY_TYPES,
  Attachment,
  AttachmentEntityType,
  AttachmentLink,
} from '../entities/attachment.entity';
import { AttachmentStorage } from './attachment-storage';

export { ATTACHMENTS_DIR } from './attachment-storage';

function isEntityType(value: string): value is AttachmentEntityType {
  return (ATTACHMENT_ENTITY_TYPES as readonly string[]).includes(value);
}

/**
 * Self-contained attachment handling: stores the binary through
 * AttachmentStorage (local disk or GCS), keeps metadata in Postgres, links
 * attachments to any entity (entity_type + entity_id), lists per entity,
 * streams downloads and deletes both row and binary.
 */
@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    @InjectRepository(Attachment) private readonly attachments: Repository<Attachment>,
    @InjectRepository(AttachmentLink) private readonly links: Repository<AttachmentLink>,
    private readonly storage: AttachmentStorage,
  ) {}

  assertEntityType(value: string): AttachmentEntityType {
    if (!isEntityType(value)) {
      throw new BadRequestException(
        `Unknown entity_type "${value}". Allowed: ${ATTACHMENT_ENTITY_TYPES.join(', ')}`,
      );
    }
    return value;
  }

  /** Store an uploaded file (multer memory buffer) and optionally link it. */
  async register(input: {
    file: Express.Multer.File;
    uploadedBy?: string | null;
    schoolId?: string | null;
    link?: { entityType: string; entityId: string } | null;
  }): Promise<Attachment> {
    const { file } = input;
    if (!file.buffer?.length) throw new BadRequestException('Uploaded file is empty');
    if (input.link) this.assertEntityType(input.link.entityType); // validate before writing anything

    const ext = extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
    const storedName = `att_${Date.now()}_${randomUUID()}${ext.startsWith('.') ? ext : ext ? `.${ext}` : ''}`;
    await this.storage.put(storedName, file.buffer, file.mimetype || 'application/octet-stream');

    const row = this.attachments.create({
      file_name: (file.originalname || storedName).slice(0, 255),
      stored_name: storedName,
      mime_type: file.mimetype || 'application/octet-stream',
      size_bytes: file.buffer.length,
      url: '', // set below once the id exists
      checksum: createHash('sha256').update(file.buffer).digest('hex'),
      uploaded_by: input.uploadedBy ?? null,
      school_id: input.schoolId ?? null,
    });
    const saved = await this.attachments.save(row);
    saved.url = `/api/attachments/${saved.id}/download`;
    await this.attachments.update(saved.id, { url: saved.url });

    if (input.link) {
      await this.addLink(saved.id, input.link.entityType, input.link.entityId);
    }
    this.logger.log(
      `attachment ${saved.id} stored via ${this.storage.driver} (${saved.file_name}, ${saved.size_bytes}B)`,
    );
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

  /** Row + a readable stream of the binary, for the download endpoint. */
  async openStream(id: string): Promise<{ row: Attachment; stream: NodeJS.ReadableStream }> {
    const row = await this.findOne(id);
    if (!(await this.storage.exists(row.stored_name))) {
      // Metadata survived but the binary is gone (e.g. redeploy without a volume on the local driver).
      throw new NotFoundException('Attachment file is missing from storage');
    }
    return { row, stream: this.storage.openStream(row.stored_name) };
  }

  /** Delete the attachment row (links cascade) and its binary. */
  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.attachments.delete({ id });
    await this.storage.delete(row.stored_name);
  }

  /** House-keeping for entity deletion: drop every link of that entity. */
  async removeAllLinksFor(entityType: string, entityId: string): Promise<number> {
    const type = this.assertEntityType(entityType);
    const res = await this.links.delete({ entity_type: type, entity_id: entityId });
    return res.affected ?? 0;
  }
}
