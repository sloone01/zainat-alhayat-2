import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { execFile } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { School } from '../entities/school.entity';
import { SchoolLandingPage } from '../entities/school-landing-page.entity';
import {
  DUE_INSTALLMENTS_TEMPLATE_ID,
  defaultCourseListTemplate,
  defaultDueInstallmentsTemplate,
  docxIncludesSchoolMarks,
  renderReportDocx,
  type ReportDocxData,
} from '../reports/report-docx';
import { AttachmentService } from './attachment.service';

const execFileAsync = promisify(execFile);

export type DueDocumentRow = ReportDocxData['rows'][number];

export type CourseListDocumentRow = {
  title: string;
  category: string;
  status: string;
  phases: string;
  milestones: string;
};

@Injectable()
export class ReportDocxService {
  constructor(
    @InjectRepository(School) private readonly schools: Repository<School>,
    @InjectRepository(SchoolLandingPage) private readonly landings: Repository<SchoolLandingPage>,
    private readonly attachments: AttachmentService,
  ) {}

  async templateFile(): Promise<{ buffer: Buffer; fileName: string; customized: boolean }> {
    const uploaded = await this.uploadedTemplate();
    if (uploaded) return { buffer: uploaded.buffer, fileName: uploaded.fileName, customized: true };
    return { buffer: defaultDueInstallmentsTemplate(), fileName: 'due-installments.docx', customized: false };
  }

  async saveTemplate(file: Express.Multer.File, userId: string): Promise<void> {
    const name = (file.originalname || '').toLowerCase();
    if (!name.endsWith('.docx') && file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      throw new BadRequestException('Upload a Word .docx file');
    }
    const marks = docxIncludesSchoolMarks(file.buffer);
    if (!marks.schoolName || !marks.schoolLogo) {
      throw new BadRequestException('The Word file must include {{schoolName}} and {{schoolLogo}}');
    }
    await this.attachments.register({
      file,
      uploadedBy: userId,
      schoolId: null,
      link: {
        entityType: 'report_template',
        entityId: DUE_INSTALLMENTS_TEMPLATE_ID,
        purpose: 'due-installments',
      },
    });
  }

  async renderDueInstallments(input: {
    schoolId: string;
    locale: 'en' | 'ar';
    title: string;
    subtitle: string;
    labels: Omit<ReportDocxData, 'schoolName' | 'title' | 'subtitle' | 'date' | 'rtl' | 'rows'>;
    rows: DueDocumentRow[];
    format: 'docx' | 'pdf';
  }): Promise<{ buffer: Buffer; mime: string; filename: string }> {
    const template = (await this.templateFile()).buffer;
    const [school, landing] = await Promise.all([
      this.schools.findOne({ where: { id: input.schoolId } }),
      this.landings.findOne({ where: { school_id: input.schoolId } }),
    ]);
    const schoolName = displaySchoolName(school, input.locale);
    const logo = await this.logoBytes(school?.logo_url || landing?.logo_url || '');
    const docx = renderReportDocx(
      template,
      {
        schoolName,
        title: input.title,
        subtitle: input.subtitle,
        date: new Date().toLocaleDateString(input.locale === 'ar' ? 'ar' : 'en', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        rtl: input.locale === 'ar',
        ...input.labels,
        rows: input.rows,
      },
      logo,
    );
    if (input.format === 'pdf') {
      const pdf = await docxToPdf(docx);
      return { buffer: pdf, mime: 'application/pdf', filename: 'due-installments.pdf' };
    }
    return {
      buffer: docx,
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: 'due-installments.docx',
    };
  }

  async renderCourseList(input: {
    schoolId: string;
    locale: 'en' | 'ar';
    title: string;
    subtitle: string;
    labels: {
      labelTitle: string;
      labelCategory: string;
      labelStatus: string;
      labelPhases: string;
      labelMilestones: string;
    };
    rows: CourseListDocumentRow[];
    format: 'docx' | 'pdf';
  }): Promise<{ buffer: Buffer; mime: string; filename: string }> {
    const [school, landing] = await Promise.all([
      this.schools.findOne({ where: { id: input.schoolId } }),
      this.landings.findOne({ where: { school_id: input.schoolId } }),
    ]);
    const schoolName = displaySchoolName(school, input.locale);
    const logo = await this.logoBytes(school?.logo_url || landing?.logo_url || '');
    const docx = renderReportDocx(
      defaultCourseListTemplate(),
      {
        schoolName,
        title: input.title,
        subtitle: input.subtitle,
        date: new Date().toLocaleDateString(input.locale === 'ar' ? 'ar' : 'en', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        rtl: input.locale === 'ar',
        ...input.labels,
        rows: input.rows,
      },
      logo,
    );
    if (input.format === 'pdf') {
      const pdf = await docxToPdf(docx);
      return { buffer: pdf, mime: 'application/pdf', filename: 'courses.pdf' };
    }
    return {
      buffer: docx,
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: 'courses.docx',
    };
  }

  private async uploadedTemplate(): Promise<{ buffer: Buffer; fileName: string } | null> {
    const rows = await this.attachments.listForEntity(
      'report_template',
      DUE_INSTALLMENTS_TEMPLATE_ID,
      'due-installments',
    );
    const latest = rows[0];
    if (!latest) return null;
    const { stream } = await this.attachments.openStream(latest.id);
    return { buffer: await streamToBuffer(stream), fileName: latest.file_name || 'due-installments.docx' };
  }

  private async logoBytes(rawUrl: string): Promise<Buffer | null> {
    const match = rawUrl.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (!match) return null;
    try {
      const { stream } = await this.attachments.openSchoolLogoStream(match[1]);
      return await streamToBuffer(stream);
    } catch {
      return null;
    }
  }
}

function displaySchoolName(
  school: { name?: string | null; name_ar?: string | null; name_en?: string | null } | null,
  locale: 'en' | 'ar',
): string {
  const ar = school?.name_ar?.trim() || school?.name?.trim() || '';
  const en = school?.name_en?.trim() || school?.name?.trim() || '';
  return (locale === 'ar' ? ar || en : en || ar) || 'School';
}

function streamToBuffer(stream: Readable | NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function docxToPdf(docx: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'fikr-report-'));
  try {
    const input = join(dir, 'report.docx');
    await writeFile(input, docx);
    await execFileAsync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', dir, input], {
      timeout: 60_000,
    });
    return await readFile(join(dir, 'report.pdf'));
  } catch {
    throw new ServiceUnavailableException('PDF conversion is unavailable');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
