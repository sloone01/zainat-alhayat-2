"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../entities/attendance.entity");
const notification_dispatcher_service_1 = require("../notifications/notification-dispatcher.service");
const notification_audience_service_1 = require("../notifications/notification-audience.service");
const notification_template_keys_1 = require("../constants/notification-template-keys");
let AttendanceService = AttendanceService_1 = class AttendanceService {
    attendanceRepository;
    notifications;
    audience;
    logger = new common_1.Logger(AttendanceService_1.name);
    constructor(attendanceRepository, notifications, audience) {
        this.attendanceRepository = attendanceRepository;
        this.notifications = notifications;
        this.audience = audience;
    }
    async create(createAttendanceDto) {
        const attendance = this.attendanceRepository.create(createAttendanceDto);
        const saved = await this.attendanceRepository.save(attendance);
        void this.notifyAttendance(saved);
        return saved;
    }
    async bulkCreate(bulkAttendanceDto) {
        const results = [];
        for (const attendanceData of bulkAttendanceDto.attendances) {
            const existingAttendance = await this.attendanceRepository.findOne({
                where: {
                    student_id: attendanceData.student_id,
                    attendance_date: bulkAttendanceDto.attendance_date,
                    group_id: bulkAttendanceDto.group_id,
                },
            });
            if (existingAttendance) {
                Object.assign(existingAttendance, {
                    status: attendanceData.status,
                    check_in_time: attendanceData.check_in_time,
                    check_out_time: attendanceData.check_out_time,
                    notes: attendanceData.notes,
                    reason: attendanceData.reason,
                    is_excused: attendanceData.is_excused,
                    recorded_by: bulkAttendanceDto.recorded_by,
                });
                const updatedRecord = await this.attendanceRepository.save(existingAttendance);
                results.push(updatedRecord);
            }
            else {
                const newAttendance = this.attendanceRepository.create({
                    ...attendanceData,
                    attendance_date: bulkAttendanceDto.attendance_date,
                    group_id: bulkAttendanceDto.group_id,
                    recorded_by: bulkAttendanceDto.recorded_by,
                });
                const savedRecord = await this.attendanceRepository.save(newAttendance);
                results.push(savedRecord);
            }
        }
        for (const row of results) {
            void this.notifyAttendance(row);
        }
        return results;
    }
    async findAll(schoolId) {
        return await this.attendanceRepository.find({
            where: schoolId == null ? {} : { student: { school_id: schoolId } },
            relations: ['student', 'group', 'recorder'],
            order: { attendance_date: 'DESC', created_at: 'DESC' },
        });
    }
    async findByGroup(groupId, date) {
        const whereCondition = { group_id: groupId };
        if (date) {
            whereCondition.attendance_date = date;
        }
        return await this.attendanceRepository.find({
            where: whereCondition,
            relations: ['student', 'recorder'],
            order: { attendance_date: 'DESC', student: { first_name: 'ASC' } },
        });
    }
    async findByStudent(studentId, startDate, endDate) {
        let whereCondition = { student_id: studentId };
        if (startDate && endDate) {
            whereCondition.attendance_date = (0, typeorm_2.Between)(startDate, endDate);
        }
        return await this.attendanceRepository.find({
            where: whereCondition,
            relations: ['group', 'recorder'],
            order: { attendance_date: 'DESC' },
        });
    }
    async findByDate(date) {
        return await this.attendanceRepository.find({
            where: { attendance_date: date },
            relations: ['student', 'group', 'recorder'],
            order: { group: { name: 'ASC' }, student: { first_name: 'ASC' } },
        });
    }
    async findOne(id, schoolId) {
        const attendance = await this.attendanceRepository.findOne({
            where: schoolId == null ? { id } : { id, student: { school_id: schoolId } },
            relations: ['student', 'group', 'recorder'],
        });
        if (!attendance) {
            throw new common_1.NotFoundException(`Attendance record with ID ${id} not found`);
        }
        return attendance;
    }
    async update(id, updateAttendanceDto, schoolId) {
        const attendance = await this.findOne(id, schoolId);
        Object.assign(attendance, updateAttendanceDto);
        return await this.attendanceRepository.save(attendance);
    }
    async remove(id, schoolId) {
        const attendance = await this.findOne(id, schoolId);
        await this.attendanceRepository.remove(attendance);
    }
    async getAttendanceStatistics(groupId, startDate, endDate) {
        const attendances = await this.attendanceRepository.find({
            where: {
                group_id: groupId,
                attendance_date: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['student'],
        });
        const stats = {
            total_records: attendances.length,
            present: attendances.filter(a => a.status === 'present').length,
            absent: attendances.filter(a => a.status === 'absent').length,
            late: attendances.filter(a => a.status === 'late').length,
            excused: attendances.filter(a => a.is_excused).length,
            attendance_rate: 0,
        };
        if (stats.total_records > 0) {
            stats.attendance_rate = ((stats.present + stats.late) / stats.total_records) * 100;
        }
        return stats;
    }
    async getStudentAttendanceRate(studentId, startDate, endDate) {
        const attendances = await this.attendanceRepository.find({
            where: {
                student_id: studentId,
                attendance_date: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const totalDays = attendances.length;
        const presentDays = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
        const absentDays = attendances.filter(a => a.status === 'absent').length;
        const excusedDays = attendances.filter(a => a.is_excused).length;
        return {
            student_id: studentId,
            total_days: totalDays,
            present_days: presentDays,
            absent_days: absentDays,
            excused_days: excusedDays,
            attendance_rate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
            unexcused_absences: absentDays - excusedDays,
        };
    }
    async getDailyAttendanceReport(date) {
        const attendances = await this.attendanceRepository.find({
            where: { attendance_date: date },
            relations: ['student', 'group'],
        });
        const groupedByGroup = attendances.reduce((acc, attendance) => {
            const groupName = attendance.group.name;
            if (!acc[groupName]) {
                acc[groupName] = {
                    group_id: attendance.group_id,
                    group_name: groupName,
                    total_students: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    students: [],
                };
            }
            acc[groupName].total_students++;
            acc[groupName].students.push({
                student_id: attendance.student_id,
                student_name: `${attendance.student.first_name} ${attendance.student.family_name}`,
                status: attendance.status,
                check_in_time: attendance.check_in_time,
                is_excused: attendance.is_excused,
                notes: attendance.notes,
            });
            if (attendance.status === 'present')
                acc[groupName].present++;
            else if (attendance.status === 'absent')
                acc[groupName].absent++;
            else if (attendance.status === 'late')
                acc[groupName].late++;
            if (attendance.is_excused)
                acc[groupName].excused++;
            return acc;
        }, {});
        return {
            date: date,
            groups: Object.values(groupedByGroup),
            summary: {
                total_students: attendances.length,
                present: attendances.filter(a => a.status === 'present').length,
                absent: attendances.filter(a => a.status === 'absent').length,
                late: attendances.filter(a => a.status === 'late').length,
                excused: attendances.filter(a => a.is_excused).length,
            },
        };
    }
    async checkExistingAttendance(studentId, date) {
        return await this.attendanceRepository.findOne({
            where: {
                student_id: studentId,
                attendance_date: date,
            },
        });
    }
    async notifyAttendance(row) {
        const status = String(row.status || '').toLowerCase();
        const templateKey = status === 'absent'
            ? notification_template_keys_1.NOTIFICATION_TEMPLATE_KEYS.ATTENDANCE_ABSENT
            : status === 'late'
                ? notification_template_keys_1.NOTIFICATION_TEMPLATE_KEYS.ATTENDANCE_LATE
                : status === 'present'
                    ? notification_template_keys_1.NOTIFICATION_TEMPLATE_KEYS.ATTENDANCE_PRESENT
                    : null;
        if (!templateKey)
            return;
        try {
            const { schoolId, studentName, recipients } = await this.audience.parentsOfStudent(row.student_id);
            if (!recipients.length)
                return;
            const date = row.attendance_date instanceof Date
                ? row.attendance_date.toISOString().slice(0, 10)
                : String(row.attendance_date).slice(0, 10);
            await this.notifications.notifySafe({
                schoolId,
                templateKey,
                locale: 'ar',
                variables: {
                    studentName,
                    recipientName: recipients[0]?.name || 'ولي الأمر',
                    date,
                    notes: row.notes || row.reason || '',
                },
                recipients,
            });
        }
        catch (err) {
            this.logger.error(`Attendance notification failed for ${row.student_id}`, err);
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_dispatcher_service_1.NotificationDispatcherService,
        notification_audience_service_1.NotificationAudienceService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map