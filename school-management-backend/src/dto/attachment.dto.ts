import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ATTACHMENT_ENTITY_TYPES, type AttachmentEntityType } from '../entities/attachment.entity';

/** Optional link sent together with the upload (multipart form fields). */
export class UploadAttachmentDto {
  @IsOptional()
  @IsIn([...ATTACHMENT_ENTITY_TYPES])
  entity_type?: AttachmentEntityType;

  @IsOptional()
  @IsUUID()
  entity_id?: string;
}

export class CreateAttachmentLinkDto {
  @IsIn([...ATTACHMENT_ENTITY_TYPES])
  entity_type: AttachmentEntityType;

  @IsUUID()
  entity_id: string;
}
