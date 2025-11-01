import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Course } from '../entities/course.entity';
import { Group } from '../entities/group.entity';
import { Attendance } from '../entities/attendance.entity';
import { StudentProgress } from '../entities/student-progress.entity';
import { User } from '../entities/user.entity';
export declare class StatisticsService {
    private studentRepository;
    private courseRepository;
    private groupRepository;
    private attendanceRepository;
    private studentProgressRepository;
    private userRepository;
    constructor(studentRepository: Repository<Student>, courseRepository: Repository<Course>, groupRepository: Repository<Group>, attendanceRepository: Repository<Attendance>, studentProgressRepository: Repository<StudentProgress>, userRepository: Repository<User>);
    getDashboardStats(): Promise<{
        totalStudents: number;
        totalCourses: number;
        totalGroups: number;
        totalTeachers: number;
        activeStudents: number;
        completedMilestones: number;
        attendanceRate: number;
    }>;
    getStudentProgressStats(courseId?: string): Promise<{
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
    }>;
    getAttendanceStats(groupId?: string, startDate?: Date, endDate?: Date): Promise<{
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
    }>;
    getCourseStats(): Promise<Array<{
        courseId: string;
        courseName: string;
        totalStudents: number;
        totalPhases: number;
        totalMilestones: number;
        averageProgress: number;
        completionRate: number;
    }>>;
}
