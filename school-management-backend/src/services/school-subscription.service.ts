import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { School } from '../entities/school.entity';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { SchoolSubscriptionRegisterDto } from '../dto/school-subscription.dto';
import type { JwtPayload } from '../auth/auth.service';

export type SchoolSubscriptionResult = {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    school_id: number;
    isActive: boolean;
  };
  school_id: number;
  group_id: string;
};

@Injectable()
export class SchoolSubscriptionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerWithDocuments(
    dto: SchoolSubscriptionRegisterDto,
    crRelativeUrl: string,
    idRelativeUrl: string,
  ): Promise<SchoolSubscriptionResult> {
    const email = dto.owner_email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists. Sign in instead.');
    }

    const ownerLegal =
      dto.owner_legal_name?.trim() ||
      `${dto.owner_first_name.trim()} ${dto.owner_last_name.trim()}`.trim();

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const { schoolId, groupId, userId } = await this.dataSource.transaction(
      async (manager) => {
        const schoolRepo = manager.getRepository(School);
        const groupRepo = manager.getRepository(Group);
        const userRepo = manager.getRepository(User);

        const school = schoolRepo.create({
          name: dto.school_name.trim(),
          address: dto.school_address?.trim(),
          phone: dto.school_phone?.trim(),
          email: dto.school_email?.trim(),
          cr_document_url: crRelativeUrl,
          owner_id_document_url: idRelativeUrl,
          owner_legal_name: ownerLegal,
        });
        await schoolRepo.save(school);

        const group = groupRepo.create({
          name: dto.group_name.trim(),
          school_id: school.id,
          is_active: true,
          status: 'active',
          capacity: 20,
          studentCount: 0,
          teacherCount: 0,
        });
        await groupRepo.save(group);

        const user = userRepo.create({
          email,
          password: hashedPassword,
          firstName: dto.owner_first_name.trim(),
          lastName: dto.owner_last_name.trim(),
          role: 'admin',
          phone: dto.owner_phone?.trim() || undefined,
          school_id: school.id,
          isActive: true,
        });
        await userRepo.save(user);

        return { schoolId: school.id, groupId: group.id, userId: user.id };
      },
    );

    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id ?? schoolId,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school_id: user.school_id ?? schoolId,
        isActive: user.isActive,
      },
      school_id: schoolId,
      group_id: groupId,
    };
  }
}
