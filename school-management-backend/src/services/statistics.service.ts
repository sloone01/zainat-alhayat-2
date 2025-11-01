import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Course } from '../entities/course.entity';
import { Group } from '../entities/group.entity';
import { Attendance } from '../entities/attendance.entity';
import { StudentProgress } from '../entities/student-progress.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(StudentProgress)
    private studentProgressRepository: Repository<StudentProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalCourses: number;
    totalGroups: number;
    totalTeachers: number;
    activeStudents: number;
    completedMilestones: number;
    attendanceRate: number;
  }> {
    const [
      totalStudents,
      totalCourses,
      totalGroups,
      totalTeachers,
      completedMilestones,
    ] = await Promise.all([
      this.studentRepository.count(),
      this.courseRepository.count(),
      this.groupRepository.count(),
      this.userRepository.count({ where: { role: 'teacher' } }),
      this.studentProgressRepository.count({ where: { status: 'completed' } }),
    ]);

    // Calculate attendance rate for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceStats = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN attendance.status = \'present\' THEN 1 ELSE 0 END)', 'present')
      .where('attendance.date >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getRawOne();

    const attendanceRate = attendanceStats.total > 0 
      ? (attendanceStats.present / attendanceStats.total) * 100 
      : 0;

    // Active students (students with recent activity)
    const activeStudents = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.attendances', 'attendance')
      .where('attendance.date >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    return {
      totalStudents,
      totalCourses,
      totalGroups,
      totalTeachers,
      activeStudents,
      completedMilestones,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  async getStudentProgressStats(courseId?: string): Promise<{
    totalStudents: number;
    studentsWithProgress: number;
    averageProgress: number;
    milestoneStats: Array<{
      milestoneId: string;
      milestoneName: string;
      completedCount: number;
      totalStudents: number;
      completionRate: number;
    }>;
  }> {
    let query = this.studentProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.milestone', 'milestone')
      .leftJoinAndSelect('milestone.phase', 'phase')
      .leftJoinAndSelect('phase.course', 'course')
      .leftJoinAndSelect('progress.student', 'student');

    if (courseId) {
      query = query.where('course.id = :courseId', { courseId });
    }

    const progressData = await query.getMany();

    const totalStudents = await this.studentRepository.count();
    const studentsWithProgress = new Set(progressData.map(p => p.student.id)).size;

    // Calculate average progress
    const completedProgress = progressData.filter(p => p.status === 'completed').length;
    const averageProgress = progressData.length > 0 
      ? (completedProgress / progressData.length) * 100 
      : 0;

    // Group by milestone
    const milestoneGroups = progressData.reduce((acc, progress) => {
      const milestoneId = progress.milestone.id;
      if (!acc[milestoneId]) {
        acc[milestoneId] = {
          milestoneId,
          milestoneName: progress.milestone.name,
          completed: 0,
          total: 0,
        };
      }
      acc[milestoneId].total++;
      if (progress.status === 'completed') {
        acc[milestoneId].completed++;
      }
      return acc;
    }, {});

    const milestoneStats = Object.values(milestoneGroups).map((milestone: any) => ({
      milestoneId: milestone.milestoneId,
      milestoneName: milestone.milestoneName,
      completedCount: milestone.completed,
      totalStudents: milestone.total,
      completionRate: milestone.total > 0 
        ? Math.round((milestone.completed / milestone.total) * 100 * 100) / 100 
        : 0,
    }));

    return {
      totalStudents,
      studentsWithProgress,
      averageProgress: Math.round(averageProgress * 100) / 100,
      milestoneStats,
    };
  }

  async getAttendanceStats(groupId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    averageAttendance: number;
    attendanceByDate: Array<{
      date: string;
      present: number;
      absent: number;
      total: number;
      rate: number;
    }>;
    studentAttendance: Array<{
      studentId: string;
      studentName: string;
      present: number;
      absent: number;
      total: number;
      rate: number;
    }>;
  }> {
    let query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.schedule', 'schedule')
      .leftJoinAndSelect('schedule.group', 'group');

    if (groupId) {
      query = query.where('group.id = :groupId', { groupId });
    }

    if (startDate) {
      query = query.andWhere('attendance.date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('attendance.date <= :endDate', { endDate });
    }

    const attendanceData = await query.getMany();

    const totalSessions = new Set(attendanceData.map(a => `${a.group_id}_${a.attendance_date}`)).size;

    // Calculate average attendance
    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const averageAttendance = attendanceData.length > 0 
      ? (presentCount / attendanceData.length) * 100 
      : 0;

    // Group by date
    const dateGroups = attendanceData.reduce((acc, attendance) => {
      const dateKey = attendance.attendance_date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { present: 0, absent: 0, total: 0 };
      }
      acc[dateKey].total++;
      if (attendance.status === 'present') {
        acc[dateKey].present++;
      } else {
        acc[dateKey].absent++;
      }
      return acc;
    }, {});

    const attendanceByDate = Object.entries(dateGroups).map(([date, stats]: [string, any]) => ({
      date,
      present: stats.present,
      absent: stats.absent,
      total: stats.total,
      rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100 * 100) / 100 : 0,
    }));

    // Group by student
    const studentGroups = attendanceData.reduce((acc, attendance) => {
      const studentId = attendance.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: `${attendance.student.firstName} ${attendance.student.lastName}`,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      acc[studentId].total++;
      if (attendance.status === 'present') {
        acc[studentId].present++;
      } else {
        acc[studentId].absent++;
      }
      return acc;
    }, {});

    const studentAttendance = Object.values(studentGroups).map((student: any) => ({
      ...student,
      rate: student.total > 0 ? Math.round((student.present / student.total) * 100 * 100) / 100 : 0,
    }));

    return {
      totalSessions,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      attendanceByDate,
      studentAttendance,
    };
  }

  async getCourseStats(): Promise<Array<{
    courseId: string;
    courseName: string;
    totalStudents: number;
    totalPhases: number;
    totalMilestones: number;
    averageProgress: number;
    completionRate: number;
  }>> {
    const courses = await this.courseRepository.find({
      relations: ['phases', 'phases.milestones', 'phases.milestones.progress', 'phases.milestones.progress.student']
    });

    return courses.map(course => {
      const totalPhases = course.phases.length;
      const totalMilestones = course.phases.reduce((sum, phase) => sum + phase.milestones.length, 0);
      
      const allProgress = course.phases.flatMap(phase => 
        phase.milestones.flatMap(milestone => milestone.progress || [])
      );

      const totalStudents = new Set(allProgress.map(p => p.student.id)).size;
      const completedProgress = allProgress.filter(p => p.status === 'completed').length;
      
      const averageProgress = allProgress.length > 0 
        ? (completedProgress / allProgress.length) * 100 
        : 0;

      const completionRate = totalMilestones > 0 && totalStudents > 0
        ? (completedProgress / (totalMilestones * totalStudents)) * 100
        : 0;

      return {
        courseId: course.id,
        courseName: course.name,
        totalStudents,
        totalPhases,
        totalMilestones,
        averageProgress: Math.round(averageProgress * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
      };
    });
  }
}

