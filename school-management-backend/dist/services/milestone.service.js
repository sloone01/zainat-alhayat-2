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
exports.MilestoneService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const milestone_entity_1 = require("../entities/milestone.entity");
const phase_entity_1 = require("../entities/phase.entity");
let MilestoneService = class MilestoneService {
    milestoneRepository;
    phaseRepository;
    constructor(milestoneRepository, phaseRepository) {
        this.milestoneRepository = milestoneRepository;
        this.phaseRepository = phaseRepository;
    }
    async create(createMilestoneDto) {
        const phase = await this.phaseRepository.findOne({
            where: { id: createMilestoneDto.phaseId }
        });
        if (!phase) {
            throw new common_1.NotFoundException(`Phase with ID ${createMilestoneDto.phaseId} not found`);
        }
        const milestone = this.milestoneRepository.create({
            ...createMilestoneDto,
            phase
        });
        return this.milestoneRepository.save(milestone);
    }
    async findAll() {
        return this.milestoneRepository.find({
            relations: ['phase', 'phase.course', 'progress'],
            order: { order: 'ASC' }
        });
    }
    async findOne(id) {
        const milestone = await this.milestoneRepository.findOne({
            where: { id },
            relations: ['phase', 'phase.course', 'progress']
        });
        if (!milestone) {
            throw new common_1.NotFoundException(`Milestone with ID ${id} not found`);
        }
        return milestone;
    }
    async findByPhase(phaseId) {
        return this.milestoneRepository.find({
            where: { phase: { id: phaseId } },
            relations: ['progress'],
            order: { order: 'ASC' }
        });
    }
    async findByCourse(courseId) {
        return this.milestoneRepository.find({
            where: { phase: { course: { id: courseId } } },
            relations: ['phase', 'progress'],
            order: { phase: { order: 'ASC' }, order: 'ASC' }
        });
    }
    async update(id, updateMilestoneDto) {
        const milestone = await this.findOne(id);
        if (updateMilestoneDto.phaseId) {
            const phase = await this.phaseRepository.findOne({
                where: { id: updateMilestoneDto.phaseId }
            });
            if (!phase) {
                throw new common_1.NotFoundException(`Phase with ID ${updateMilestoneDto.phaseId} not found`);
            }
            milestone.phase = phase;
        }
        Object.assign(milestone, updateMilestoneDto);
        return this.milestoneRepository.save(milestone);
    }
    async remove(id) {
        const milestone = await this.findOne(id);
        await this.milestoneRepository.remove(milestone);
    }
    async reorderMilestones(phaseId, milestoneOrders) {
        const milestones = await this.findByPhase(phaseId);
        for (const milestoneOrder of milestoneOrders) {
            const milestone = milestones.find(m => m.id === milestoneOrder.id);
            if (milestone) {
                milestone.order = milestoneOrder.order;
                await this.milestoneRepository.save(milestone);
            }
        }
        return this.findByPhase(phaseId);
    }
    async getNextOrder(phaseId) {
        const lastMilestone = await this.milestoneRepository.findOne({
            where: { phase: { id: phaseId } },
            order: { order: 'DESC' }
        });
        return lastMilestone ? lastMilestone.order + 1 : 1;
    }
    async duplicateMilestone(id, newName) {
        const originalMilestone = await this.findOne(id);
        const newOrder = await this.getNextOrder(originalMilestone.phase.id);
        const duplicatedMilestone = this.milestoneRepository.create({
            name: newName || `${originalMilestone.name} (Copy)`,
            description: originalMilestone.description,
            order: newOrder,
            isRequired: originalMilestone.isRequired,
            points: originalMilestone.points,
            phase: originalMilestone.phase
        });
        return this.milestoneRepository.save(duplicatedMilestone);
    }
    async getRequiredMilestones(phaseId) {
        return this.milestoneRepository.find({
            where: {
                phase: { id: phaseId },
                isRequired: true
            },
            order: { order: 'ASC' }
        });
    }
    async getMilestoneStats(milestoneId) {
        const milestone = await this.milestoneRepository.findOne({
            where: { id: milestoneId },
            relations: ['progress', 'progress.student']
        });
        if (!milestone) {
            throw new common_1.NotFoundException(`Milestone with ID ${milestoneId} not found`);
        }
        const totalStudents = milestone.progress.length;
        const completedStudents = milestone.progress.filter(p => p.status === 'completed').length;
        const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
        return {
            totalStudents,
            completedStudents,
            completionRate: Math.round(completionRate * 100) / 100
        };
    }
};
exports.MilestoneService = MilestoneService;
exports.MilestoneService = MilestoneService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(milestone_entity_1.Milestone)),
    __param(1, (0, typeorm_1.InjectRepository)(phase_entity_1.Phase)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MilestoneService);
//# sourceMappingURL=milestone.service.js.map