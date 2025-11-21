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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../entities/student.entity");
const course_entity_1 = require("../entities/course.entity");
const group_entity_1 = require("../entities/group.entity");
const attendance_entity_1 = require("../entities/attendance.entity");
const student_progress_entity_1 = require("../entities/student-progress.entity");
const user_entity_1 = require("../entities/user.entity");
let StatisticsService = class StatisticsService {
    studentRepository;
    courseRepository;
    groupRepository;
    attendanceRepository;
    studentProgressRepository;
    userRepository;
    constructor(studentRepository, courseRepository, groupRepository, attendanceRepository, studentProgressRepository, userRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.groupRepository = groupRepository;
        this.attendanceRepository = attendanceRepository;
        this.studentProgressRepository = studentProgressRepository;
        this.userRepository = userRepository;
    }
    async getDashboardStats() {
        const [totalStudents, totalCourses, totalGroups, totalTeachers, completedMilestones,] = await Promise.all([
            this.studentRepository.count(),
            this.courseRepository.count(),
            this.groupRepository.count(),
            this.userRepository.count({ where: { role: 'teacher' } }),
            this.studentProgressRepository.count({ where: { status: 'completed' } }),
        ]);
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
    async getStudentProgressStats(courseId) {
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
        const completedProgress = progressData.filter(p => p.status === 'completed').length;
        const averageProgress = progressData.length > 0
            ? (completedProgress / progressData.length) * 100
            : 0;
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
        const milestoneStats = Object.values(milestoneGroups).map((milestone) => ({
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
    async getAttendanceStats(groupId, startDate, endDate) {
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
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const averageAttendance = attendanceData.length > 0
            ? (presentCount / attendanceData.length) * 100
            : 0;
        const dateGroups = attendanceData.reduce((acc, attendance) => {
            const dateKey = attendance.attendance_date.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = { present: 0, absent: 0, total: 0 };
            }
            acc[dateKey].total++;
            if (attendance.status === 'present') {
                acc[dateKey].present++;
            }
            else {
                acc[dateKey].absent++;
            }
            return acc;
        }, {});
        const attendanceByDate = Object.entries(dateGroups).map(([date, stats]) => ({
            date,
            present: stats.present,
            absent: stats.absent,
            total: stats.total,
            rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100 * 100) / 100 : 0,
        }));
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
            }
            else {
                acc[studentId].absent++;
            }
            return acc;
        }, {});
        const studentAttendance = Object.values(studentGroups).map((student) => ({
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
    async getCourseStats() {
        const courses = await this.courseRepository.find({
            relations: ['phases', 'phases.milestones', 'phases.milestones.progress', 'phases.milestones.progress.student']
        });
        return courses.map(course => {
            const totalPhases = course.phases.length;
            const totalMilestones = course.phases.reduce((sum, phase) => sum + phase.milestones.length, 0);
            const allProgress = course.phases.flatMap(phase => phase.milestones.flatMap(milestone => milestone.progress || []));
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
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(2, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(4, (0, typeorm_1.InjectRepository)(student_progress_entity_1.StudentProgress)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map