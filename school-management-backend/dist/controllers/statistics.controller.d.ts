import { StatisticsService } from '../services/statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboardStats(): Promise<{
        success: boolean;
        data: {
            totalStudents: number;
            totalCourses: number;
            totalGroups: number;
            totalTeachers: number;
            activeStudents: number;
            completedMilestones: number;
            attendanceRate: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getStudentProgressStats(courseId?: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getAttendanceStats(groupId?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getCourseStats(): Promise<{
        success: boolean;
        data: {
            courseId: string;
            courseName: string;
            totalStudents: number;
            totalPhases: number;
            totalMilestones: number;
            averageProgress: number;
            completionRate: number;
        }[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
}
