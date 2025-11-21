import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProgress } from '../entities/student-progress.entity';

export interface CreateProgressDto {
  status: string;
  score?: number;
  points_earned?: number;
  teacher_notes?: string;
  student_notes?: string;
  started_date?: Date;
  completed_date?: Date;
  due_date?: Date;
  is_late_submission?: boolean;
  feedback?: string;
  attachments?: any;
  student_id: string;
  course_id: string;
  milestone_id: string;
  updated_by: number;
}

export interface UpdateProgressDto {
  status?: string;
  score?: number;
  points_earned?: number;
  teacher_notes?: string;
  student_notes?: string;
  started_date?: Date;
  completed_date?: Date;
  due_date?: Date;
  is_late_submission?: boolean;
  feedback?: string;
  attachments?: any;
  updated_by?: number;
}

export interface BulkProgressUpdateDto {
  milestone_id: string;
  course_id: string;
  updated_by: number;
  updates: {
    student_id: string;
    status: string;
    teacher_notes?: string;
    score?: number;
    points_earned?: number;
  }[];
}

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(StudentProgress)
    private progressRepository: Repository<StudentProgress>,
  ) {}

  async create(createProgressDto: CreateProgressDto): Promise<StudentProgress> {
    const progress = this.progressRepository.create(createProgressDto);
    return await this.progressRepository.save(progress);
  }

  async bulkUpdate(bulkUpdateDto: BulkProgressUpdateDto): Promise<StudentProgress[]> {
    const results: StudentProgress[] = [];

    for (const update of bulkUpdateDto.updates) {
      let progress = await this.findByStudentAndMilestone(
        update.student_id,
        bulkUpdateDto.milestone_id
      );

      if (!progress) {
        // Create new progress record
        progress = await this.create({
          ...update,
          course_id: bulkUpdateDto.course_id,
          milestone_id: bulkUpdateDto.milestone_id,
          updated_by: bulkUpdateDto.updated_by,
        });
      } else {
        // Update existing progress
        progress = await this.update(progress.id, {
          ...update,
          updated_by: bulkUpdateDto.updated_by,
        });
      }

      results.push(progress);
    }

    return results;
  }

  async findAll(): Promise<StudentProgress[]> {
    return await this.progressRepository.find({
      relations: ['student', 'course', 'milestone', 'updater'],
      order: { updated_at: 'DESC' },
    });
  }

  async findByStudent(studentId: string): Promise<StudentProgress[]> {
    return await this.progressRepository.find({
      where: { student_id: studentId },
      relations: ['course', 'milestone', 'milestone.phase', 'updater'],
      order: { course: { name: 'ASC' }, milestone: { order: 'ASC' } },
    });
  }

  async findByCourse(courseId: string): Promise<StudentProgress[]> {
    return await this.progressRepository.find({
      where: { course_id: courseId },
      relations: ['student', 'milestone', 'milestone.phase', 'updater'],
      order: { student: { first_name: 'ASC' }, milestone: { order: 'ASC' } },
    });
  }

  async findByMilestone(milestoneId: string): Promise<StudentProgress[]> {
    return await this.progressRepository.find({
      where: { milestone_id: milestoneId },
      relations: ['student', 'course', 'updater'],
      order: { student: { first_name: 'ASC' } },
    });
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<StudentProgress[]> {
    return await this.progressRepository.find({
      where: {
        student_id: studentId,
        course_id: courseId
      },
      relations: ['milestone', 'milestone.phase', 'updater'],
      order: { milestone: { order: 'ASC' } },
    });
  }

  async findByStudentAndMilestone(studentId: string, milestoneId: string): Promise<StudentProgress | null> {
    return await this.progressRepository.findOne({
      where: {
        student_id: studentId,
        milestone_id: milestoneId
      },
      relations: ['course', 'milestone', 'updater'],
    });
  }

  async findOne(id: number): Promise<StudentProgress> {
    const progress = await this.progressRepository.findOne({
      where: { id },
      relations: ['student', 'course', 'milestone', 'milestone.phase', 'updater'],
    });

    if (!progress) {
      throw new NotFoundException(`Progress record with ID ${id} not found`);
    }

    return progress;
  }

  async update(id: number, updateProgressDto: UpdateProgressDto): Promise<StudentProgress> {
    const progress = await this.findOne(id);
    
    // Set completion date if status is completed
    if (updateProgressDto.status === 'completed' && !updateProgressDto.completed_date) {
      updateProgressDto.completed_date = new Date();
    }

    // Set started date if status is in_progress and not already set
    if (updateProgressDto.status === 'in_progress' && !progress.started_date && !updateProgressDto.started_date) {
      updateProgressDto.started_date = new Date();
    }

    Object.assign(progress, updateProgressDto);
    return await this.progressRepository.save(progress);
  }

  async remove(id: number): Promise<void> {
    const progress = await this.findOne(id);
    await this.progressRepository.remove(progress);
  }

  async getStudentCourseProgress(studentId: string, courseId: string): Promise<any> {
    const progressRecords = await this.findByStudentAndCourse(studentId, courseId);

    const totalMilestones = progressRecords.length;
    const completedMilestones = progressRecords.filter(p => p.status === 'completed').length;
    const inProgressMilestones = progressRecords.filter(p => p.status === 'in_progress').length;
    const postponedMilestones = progressRecords.filter(p => p.status === 'postponed').length;
    const notStartedMilestones = progressRecords.filter(p => p.status === 'not_started').length;

    const totalPoints = progressRecords.reduce((sum, p) => sum + (p.points_earned || 0), 0);
    const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return {
      student_id: studentId,
      course_id: courseId,
      total_milestones: totalMilestones,
      completed_milestones: completedMilestones,
      in_progress_milestones: inProgressMilestones,
      postponed_milestones: postponedMilestones,
      not_started_milestones: notStartedMilestones,
      total_points: totalPoints,
      completion_rate: completionRate,
      progress_records: progressRecords,
    };
  }

  async getCourseProgressSummary(courseId: string): Promise<any> {
    const progressRecords = await this.findByCourse(courseId);
    
    // Group by student
    const studentProgress = progressRecords.reduce((acc, record) => {
      if (!acc[record.student_id]) {
        acc[record.student_id] = {
          student: record.student,
          milestones: [],
          completed: 0,
          in_progress: 0,
          postponed: 0,
          not_started: 0,
          total_points: 0,
        };
      }

      acc[record.student_id].milestones.push(record);
      acc[record.student_id][record.status]++;
      acc[record.student_id].total_points += record.points_earned || 0;

      return acc;
    }, {});

    const students = Object.values(studentProgress).map((student: any) => ({
      ...student,
      completion_rate: student.milestones.length > 0 
        ? (student.completed / student.milestones.length) * 100 
        : 0,
    }));

    // Overall course statistics
    const totalStudents = students.length;
    const totalMilestones = progressRecords.length;
    const completedMilestones = progressRecords.filter(p => p.status === 'completed').length;
    const overallCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return {
      course_id: courseId,
      total_students: totalStudents,
      total_milestones: totalMilestones,
      completed_milestones: completedMilestones,
      overall_completion_rate: overallCompletionRate,
      students: students,
    };
  }

  async getMilestoneProgressSummary(milestoneId: string): Promise<any> {
    const progressRecords = await this.findByMilestone(milestoneId);
    
    const totalStudents = progressRecords.length;
    const completed = progressRecords.filter(p => p.status === 'completed').length;
    const inProgress = progressRecords.filter(p => p.status === 'in_progress').length;
    const postponed = progressRecords.filter(p => p.status === 'postponed').length;
    const notStarted = progressRecords.filter(p => p.status === 'not_started').length;

    const averageScore = progressRecords.length > 0 
      ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
      : 0;

    return {
      milestone_id: milestoneId,
      total_students: totalStudents,
      completed: completed,
      in_progress: inProgress,
      postponed: postponed,
      not_started: notStarted,
      completion_rate: totalStudents > 0 ? (completed / totalStudents) * 100 : 0,
      average_score: averageScore,
      progress_records: progressRecords,
    };
  }
}

