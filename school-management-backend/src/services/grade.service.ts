import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(schoolId: string, createGradeDto: CreateGradeDto): Promise<Grade> {
    const code = createGradeDto.code.trim();
    await this.assertCodeAvailable(schoolId, code);
    const grade = this.gradeRepository.create({
      ...createGradeDto,
      code,
      school_id: schoolId,
    });
    return this.gradeRepository.save(grade);
  }

  async findAll(schoolId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { school_id: schoolId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findActive(schoolId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { school_id: schoolId, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, schoolId?: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: schoolId ? { id, school_id: schoolId } : { id },
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async update(
    id: string,
    schoolId: string,
    updateGradeDto: UpdateGradeDto,
  ): Promise<Grade> {
    const grade = await this.findOne(id, schoolId);
    if (updateGradeDto.code != null) {
      const code = updateGradeDto.code.trim();
      await this.assertCodeAvailable(schoolId, code, id);
      updateGradeDto = { ...updateGradeDto, code };
    }
    Object.assign(grade, updateGradeDto);
    return this.gradeRepository.save(grade);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const grade = await this.findOne(id, schoolId);
    await this.gradeRepository.remove(grade);
  }

  async reorder(schoolId: string, gradeIds: string[]): Promise<Grade[]> {
    if (!Array.isArray(gradeIds) || gradeIds.length === 0) {
      throw new BadRequestException('gradeIds is required');
    }
    const grades: Grade[] = [];

    for (let i = 0; i < gradeIds.length; i++) {
      const grade = await this.findOne(gradeIds[i], schoolId);
      grade.displayOrder = i + 1;
      grades.push(await this.gradeRepository.save(grade));
    }

    return grades;
  }

  async initializeDefaultGrades(schoolId: string): Promise<void> {
    const existingGrades = await this.gradeRepository.count({
      where: { school_id: schoolId },
    });

    if (existingGrades > 0) {
      return;
    }

    const defaultGrades = [
      {
        nameEn: 'Nursery',
        nameAr: 'الحضانة',
        code: 'nursery',
        displayOrder: 1,
        description: 'For children aged 2-3 years',
      },
      {
        nameEn: 'KG1',
        nameAr: 'الروضة الأولى',
        code: 'kg1',
        displayOrder: 2,
        description: 'For children aged 3-4 years',
      },
      {
        nameEn: 'KG2',
        nameAr: 'الروضة الثانية',
        code: 'kg2',
        displayOrder: 3,
        description: 'For children aged 4-5 years',
      },
      {
        nameEn: 'Preschool',
        nameAr: 'التمهيدي',
        code: 'preschool',
        displayOrder: 4,
        description: 'For children aged 5-6 years',
      },
    ];

    for (const gradeData of defaultGrades) {
      const grade = this.gradeRepository.create({
        ...gradeData,
        school_id: schoolId,
      });
      await this.gradeRepository.save(grade);
    }
  }

  private async assertCodeAvailable(
    schoolId: string,
    code: string,
    exceptId?: string,
  ): Promise<void> {
    const existing = await this.gradeRepository
      .createQueryBuilder('g')
      .where('g.school_id = :schoolId', { schoolId })
      .andWhere('LOWER(g.code) = LOWER(:code)', { code })
      .getOne();
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Grade code "${code}" already exists for this school`);
    }
  }
}
