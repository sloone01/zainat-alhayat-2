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
exports.StudentProgressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_progress_entity_1 = require("../entities/student-progress.entity");
let StudentProgressService = class StudentProgressService {
    progressRepository;
    constructor(progressRepository) {
        this.progressRepository = progressRepository;
    }
    async create(createProgressDto) {
        const progress = this.progressRepository.create(createProgressDto);
        return await this.progressRepository.save(progress);
    }
    async bulkUpdate(bulkUpdateDto) {
        const results = [];
        for (const update of bulkUpdateDto.updates) {
            let progress = await this.findByStudentAndMilestone(update.student_id, bulkUpdateDto.milestone_id);
            if (!progress) {
                progress = await this.create({
                    ...update,
                    course_id: bulkUpdateDto.course_id,
                    milestone_id: bulkUpdateDto.milestone_id,
                    updated_by: bulkUpdateDto.updated_by,
                });
            }
            else {
                progress = await this.update(progress.id, {
                    ...update,
                    updated_by: bulkUpdateDto.updated_by,
                });
            }
            results.push(progress);
        }
        return results;
    }
    async findAll() {
        return await this.progressRepository.find({
            relations: ['student', 'course', 'milestone', 'updater'],
            order: { updated_at: 'DESC' },
        });
    }
    async findByStudent(studentId) {
        return await this.progressRepository.find({
            where: { student_id: studentId },
            relations: ['course', 'milestone', 'milestone.phase', 'updater'],
            order: { course: { name: 'ASC' }, milestone: { order: 'ASC' } },
        });
    }
    async findByCourse(courseId) {
        return await this.progressRepository.find({
            where: { course_id: courseId },
            relations: ['student', 'milestone', 'milestone.phase', 'updater'],
            order: { student: { first_name: 'ASC' }, milestone: { order: 'ASC' } },
        });
    }
    async findByMilestone(milestoneId) {
        return await this.progressRepository.find({
            where: { milestone_id: milestoneId },
            relations: ['student', 'course', 'updater'],
            order: { student: { first_name: 'ASC' } },
        });
    }
    async findByStudentAndCourse(studentId, courseId) {
        return await this.progressRepository.find({
            where: {
                student_id: studentId,
                course_id: courseId
            },
            relations: ['milestone', 'milestone.phase', 'updater'],
            order: { milestone: { order: 'ASC' } },
        });
    }
    async findByStudentAndMilestone(studentId, milestoneId) {
        return await this.progressRepository.findOne({
            where: {
                student_id: studentId,
                milestone_id: milestoneId
            },
            relations: ['course', 'milestone', 'updater'],
        });
    }
    async findOne(id) {
        const progress = await this.progressRepository.findOne({
            where: { id },
            relations: ['student', 'course', 'milestone', 'milestone.phase', 'updater'],
        });
        if (!progress) {
            throw new common_1.NotFoundException(`Progress record with ID ${id} not found`);
        }
        return progress;
    }
    async update(id, updateProgressDto) {
        const progress = await this.findOne(id);
        if (updateProgressDto.status === 'completed' && !updateProgressDto.completed_date) {
            updateProgressDto.completed_date = new Date();
        }
        if (updateProgressDto.status === 'in_progress' && !progress.started_date && !updateProgressDto.started_date) {
            updateProgressDto.started_date = new Date();
        }
        Object.assign(progress, updateProgressDto);
        return await this.progressRepository.save(progress);
    }
    async remove(id) {
        const progress = await this.findOne(id);
        await this.progressRepository.remove(progress);
    }
    async getStudentCourseProgress(studentId, courseId) {
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
    async getCourseProgressSummary(courseId) {
        const progressRecords = await this.findByCourse(courseId);
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
        const students = Object.values(studentProgress).map((student) => ({
            ...student,
            completion_rate: student.milestones.length > 0
                ? (student.completed / student.milestones.length) * 100
                : 0,
        }));
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
    async getMilestoneProgressSummary(milestoneId) {
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
};
exports.StudentProgressService = StudentProgressService;
exports.StudentProgressService = StudentProgressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_progress_entity_1.StudentProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StudentProgressService);
//# sourceMappingURL=student-progress.service.js.map