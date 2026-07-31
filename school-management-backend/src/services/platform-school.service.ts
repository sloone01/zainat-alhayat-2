import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Student } from '../entities/student.entity';
import { PlatformBillingService } from '../platform-billing/platform-billing.service';

export interface RegisteredSchoolRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logo_url: string | null;
  owner_legal_name: string | null;
  cr_document_url: string | null;
  owner_id_document_url: string | null;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  created_at: Date;
  updated_at: Date;
  studentCount: number;
  groupCount: number;
  planCode: string | null;
  billingPeriod: string | null;
  subscriptionStatus: string | null;
  invoiceStatus: string | null;
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isActive: boolean;
  } | null;
}

@Injectable()
export class PlatformSchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly platformBilling: PlatformBillingService,
  ) {}

  private assertPlatformAccess(actor: User) {
    if (actor.isSuperAdmin || actor.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  private async ownerForSchool(schoolId: number) {
    const [user] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      isActive: !!user.isActive,
    };
  }

  async listRegisteredSchools(actor: User): Promise<RegisteredSchoolRow[]> {
    this.assertPlatformAccess(actor);

    const schools = await this.schoolRepo.find({
      order: { created_at: 'DESC' },
    });

    const billingMap = await this.platformBilling.getSubscriptionSummaryBySchoolIds(
      schools.map((s) => s.id),
    );

    const rows: RegisteredSchoolRow[] = [];
    for (const school of schools) {
      const [studentCount, groupCount, owner] = await Promise.all([
        this.studentRepo.count({ where: { school_id: school.id } }),
        this.groupRepo.count({ where: { school_id: school.id } }),
        this.ownerForSchool(school.id),
      ]);

      const status = (school.status || 'active') as RegisteredSchoolRow['status'];
      const billing = billingMap.get(school.id);

      rows.push({
        id: school.id,
        name: school.name,
        email: school.email ?? null,
        phone: school.phone ?? null,
        address: school.address ?? null,
        website: school.website ?? null,
        logo_url: school.logo_url ?? null,
        owner_legal_name: school.owner_legal_name ?? null,
        cr_document_url: school.cr_document_url ?? null,
        owner_id_document_url: school.owner_id_document_url ?? null,
        status,
        created_at: school.created_at,
        updated_at: school.updated_at,
        studentCount,
        groupCount,
        planCode: billing?.planCode ?? null,
        billingPeriod: billing?.billingPeriod ?? null,
        subscriptionStatus: billing?.subscriptionStatus ?? null,
        invoiceStatus: billing?.invoiceStatus ?? null,
        owner,
      });
    }

    return rows;
  }

  async getRegisteredSchool(actor: User, id: number): Promise<RegisteredSchoolRow> {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school) throw new NotFoundException('School not found');
    const list = await this.listRegisteredSchools(actor);
    const row = list.find((s) => s.id === id);
    if (!row) throw new NotFoundException('School not found');
    return row;
  }

  /**
   * Approve a pending school registration: activate school and enable the owner as school admin.
   */
  async approveSchool(
    actor: User,
    schoolId: number,
  ): Promise<{ school: RegisteredSchoolRow; admin_user_id: string }> {
    this.assertPlatformAccess(actor);

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');
    if (school.status === 'active') {
      throw new BadRequestException('School is already active');
    }
    if (school.status === 'rejected') {
      throw new BadRequestException('Rejected schools cannot be approved. Contact support to reopen.');
    }

    school.status = 'active';
    await this.schoolRepo.save(school);

    let [admin] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });

    if (!admin) {
      throw new BadRequestException(
        'No owner account found for this school. Cannot activate without an admin user.',
      );
    }

    admin.role = 'admin';
    admin.isActive = true;
    admin = await this.userRepo.save(admin);

    const row = await this.getRegisteredSchool(actor, schoolId);
    return { school: row, admin_user_id: admin.id };
  }
}
