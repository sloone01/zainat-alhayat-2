import { AttendanceService } from '../services/attendance.service';
import type { CreateAttendanceDto, UpdateAttendanceDto, BulkAttendanceDto } from '../services/attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance;
        message: string;
    }>;
    bulkCreate(bulkAttendanceDto: BulkAttendanceDto): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance[];
        message: string;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance[];
        message: string;
    }>;
    findByGroup(groupId: string, date?: string): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance[];
        message: string;
    }>;
    findByStudent(studentId: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance[];
        message: string;
    }>;
    findByDate(date: string): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance[];
        message: string;
    }>;
    getGroupStatistics(groupId: string, startDate: string, endDate: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getStudentStatistics(studentId: string, startDate: string, endDate: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDailyReport(date: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    checkExisting(studentId: string, date: string): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance | null;
        message: string;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance;
        message: string;
    }>;
    update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<{
        success: boolean;
        data: import("../entities/attendance.entity").Attendance;
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
