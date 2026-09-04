import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const grade = this.gradeRepository.create(createGradeDto);
    return this.gradeRepository.save(grade);
  }

  async findAll(): Promise<Grade[]> {
    return this.gradeRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async findActive(): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id }
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, updateGradeDto);
    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradeRepository.remove(grade);
  }

  async reorder(gradeIds: string[]): Promise<Grade[]> {
    const grades: Grade[] = [];

    for (let i = 0; i < gradeIds.length; i++) {
      const grade = await this.findOne(gradeIds[i]);
      grade.displayOrder = i + 1;
      grades.push(await this.gradeRepository.save(grade));
    }

    return grades;
  }

  async initializeDefaultGrades(): Promise<void> {
    const existingGrades = await this.gradeRepository.count();

    if (existingGrades === 0) {
      const defaultGrades = [
        {
          nameEn: 'Nursery',
          nameAr: 'الحضانة',
          code: 'nursery',
          displayOrder: 1,
          description: 'For children aged 2-3 years'
        },
        {
          nameEn: 'KG1',
          nameAr: 'الروضة الأولى',
          code: 'kg1',
          displayOrder: 2,
          description: 'For children aged 3-4 years'
        },
        {
          nameEn: 'KG2',
          nameAr: 'الروضة الثانية',
          code: 'kg2',
          displayOrder: 3,
          description: 'For children aged 4-5 years'
        },
        {
          nameEn: 'Preschool',
          nameAr: 'التمهيدي',
          code: 'preschool',
          displayOrder: 4,
          description: 'For children aged 5-6 years'
        }
      ];

      for (const gradeData of defaultGrades) {
        const grade = this.gradeRepository.create(gradeData);
        await this.gradeRepository.save(grade);
      }
    }
  }
}