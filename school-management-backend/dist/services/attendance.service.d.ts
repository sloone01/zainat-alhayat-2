import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
export interface CreateAttendanceDto {
    attendance_date: Date;
    status: string;
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
    reason?: string;
    is_excused?: boolean;
    student_id: string;
    group_id: string;
    recorded_by?: number;
}
export interface UpdateAttendanceDto {
    status?: string;
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
    reason?: string;
    is_excused?: boolean;
}
export interface BulkAttendanceDto {
    attendance_date: Date;
    group_id: string;
    recorded_by?: number;
    attendances: {
        student_id: string;
        status: string;
        check_in_time?: string;
        check_out_time?: string;
        notes?: string;
        reason?: string;
        is_excused?: boolean;
    }[];
}
export declare class AttendanceService {
    private attendanceRepository;
    constructor(attendanceRepository: Repository<Attendance>);
    create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance>;
    bulkCreate(bulkAttendanceDto: BulkAttendanceDto): Promise<Attendance[]>;
    findAll(): Promise<Attendance[]>;
    findByGroup(groupId: string, date?: Date): Promise<Attendance[]>;
    findByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
    findByDate(date: Date): Promise<Attendance[]>;
    findOne(id: number): Promise<Attendance>;
    update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance>;
    remove(id: number): Promise<void>;
    getAttendanceStatistics(groupId: string, startDate: Date, endDate: Date): Promise<any>;
    getStudentAttendanceRate(studentId: string, startDate: Date, endDate: Date): Promise<any>;
    getDailyAttendanceReport(date: Date): Promise<any>;
    checkExistingAttendance(studentId: string, date: Date): Promise<Attendance | null>;
}
