import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
export interface CreateScheduleDto {
    day_of_week: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    notes?: string;
    is_recurring?: boolean;
    specific_date?: Date;
    group_id: string;
    course_id?: string;
    teacher_id?: string;
    room_id?: number;
}
export interface UpdateScheduleDto {
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: number;
    notes?: string;
    is_recurring?: boolean;
    specific_date?: Date;
    status?: string;
    course_id?: string;
    teacher_id?: string;
    room_id?: number;
}
export declare class ScheduleService {
    private scheduleRepository;
    constructor(scheduleRepository: Repository<Schedule>);
    create(createScheduleDto: CreateScheduleDto): Promise<Schedule>;
    findAll(): Promise<Schedule[]>;
    findByGroup(groupId: string): Promise<Schedule[]>;
    findByTeacher(teacherId: string): Promise<Schedule[]>;
    findByRoom(roomId: number): Promise<Schedule[]>;
    findByDay(dayOfWeek: string): Promise<Schedule[]>;
    findTeacherCourses(teacherId: string): Promise<any[]>;
    findOne(id: string): Promise<Schedule>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule>;
    remove(id: string): Promise<void>;
    cancelSchedule(id: string): Promise<Schedule>;
    getWeeklySchedule(groupId?: string, teacherId?: string): Promise<any>;
    private checkForConflicts;
}
