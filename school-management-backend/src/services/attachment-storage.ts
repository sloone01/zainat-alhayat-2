import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { createReadStream, existsSync, mkdirSync, promises as fsp } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { uploadsRoot } from '../common/security/runtime-secrets';

export const ATTACHMENTS_DIR = 'attachments';

/**
 * Where attachment binaries live, switched by STORAGE_DRIVER:
 *  - "local" (default): uploads/attachments on the service's own disk.
 *    Works everywhere, but on Railway WITHOUT a volume it is wiped per deploy.
 *  - "gcs": Google Cloud Storage bucket GCS_BUCKET (default
 *    fikr-platform-attachments), authenticated with the same
 *    FIREBASE_SERVICE_ACCOUNT_JSON already used for push notifications.
 * Metadata stays in Postgres either way; only the bytes move.
 */
@Injectable()
export class AttachmentStorage {
  private readonly logger = new Logger(AttachmentStorage.name);
  readonly driver: 'local' | 'gcs' =
    process.env.STORAGE_DRIVER?.trim().toLowerCase() === 'gcs' ? 'gcs' : 'local';
  private readonly bucketName =
    process.env.GCS_BUCKET?.trim() || 'fikr-platform-attachments';

  private localPath(storedName: string): string {
    const dir = join(uploadsRoot(), ATTACHMENTS_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return join(dir, storedName);
  }

  private bucket() {
    if (!admin.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
      if (!raw) {
        throw new InternalServerErrorException(
          'STORAGE_DRIVER=gcs but FIREBASE_SERVICE_ACCOUNT_JSON is not set',
        );
      }
      const sa = JSON.parse(raw) as { project_id: string; client_email: string; private_key: string };
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: sa.project_id,
          clientEmail: sa.client_email,
          privateKey: sa.private_key.replace(/\\n/g, '\n'),
        }),
      });
    }
    return admin.storage().bucket(this.bucketName);
  }

  private key(storedName: string): string {
    return `${ATTACHMENTS_DIR}/${storedName}`;
  }

  async put(storedName: string, buffer: Buffer, mimeType: string): Promise<void> {
    if (this.driver === 'gcs') {
      await this.bucket().file(this.key(storedName)).save(buffer, {
        contentType: mimeType,
        resumable: false,
      });
      return;
    }
    await fsp.writeFile(this.localPath(storedName), buffer);
  }

  async exists(storedName: string): Promise<boolean> {
    if (this.driver === 'gcs') {
      const [ok] = await this.bucket().file(this.key(storedName)).exists();
      return ok;
    }
    return existsSync(this.localPath(storedName));
  }

  openStream(storedName: string): NodeJS.ReadableStream {
    if (this.driver === 'gcs') {
      return this.bucket().file(this.key(storedName)).createReadStream() as unknown as Readable;
    }
    return createReadStream(this.localPath(storedName));
  }

  async delete(storedName: string): Promise<void> {
    try {
      if (this.driver === 'gcs') {
        await this.bucket().file(this.key(storedName)).delete({ ignoreNotFound: true });
      } else {
        await fsp.unlink(this.localPath(storedName));
      }
    } catch (e) {
      this.logger.warn(`delete ${storedName} failed: ${(e as Error).message}`);
    }
  }
}
