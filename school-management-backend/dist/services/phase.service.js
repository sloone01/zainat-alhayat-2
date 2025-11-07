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
exports.PhaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const phase_entity_1 = require("../entities/phase.entity");
const course_entity_1 = require("../entities/course.entity");
let PhaseService = class PhaseService {
    constructor(phaseRepository, courseRepository) {
        this.phaseRepository = phaseRepository;
        this.courseRepository = courseRepository;
    }
    async create(createPhaseDto) {
        const course = await this.courseRepository.findOne({
            where: { id: createPhaseDto.courseId }
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${createPhaseDto.courseId} not found`);
        }
        const phase = this.phaseRepository.create({
            ...createPhaseDto,
            course
        });
        return this.phaseRepository.save(phase);
    }
    async findAll() {
        return this.phaseRepository.find({
            relations: ['course', 'milestones'],
            order: { order: 'ASC' }
        });
    }
    async findOne(id) {
        const phase = await this.phaseRepository.findOne({
            where: { id },
            relations: ['course', 'milestones']
        });
        if (!phase) {
            throw new common_1.NotFoundException(`Phase with ID ${id} not found`);
        }
        return phase;
    }
    async findByCourse(courseId) {
        return this.phaseRepository.find({
            where: { course: { id: courseId } },
            relations: ['milestones'],
            order: { order: 'ASC' }
        });
    }
    async update(id, updatePhaseDto) {
        const phase = await this.findOne(id);
        if (updatePhaseDto.courseId) {
            const course = await this.courseRepository.findOne({
                where: { id: updatePhaseDto.courseId }
            });
            if (!course) {
                throw new common_1.NotFoundException(`Course with ID ${updatePhaseDto.courseId} not found`);
            }
            phase.course = course;
        }
        Object.assign(phase, updatePhaseDto);
        return this.phaseRepository.save(phase);
    }
    async remove(id) {
        const phase = await this.findOne(id);
        await this.phaseRepository.remove(phase);
    }
    async reorderPhases(courseId, phaseOrders) {
        const phases = await this.findByCourse(courseId);
        for (const phaseOrder of phaseOrders) {
            const phase = phases.find(p => p.id === phaseOrder.id);
            if (phase) {
                phase.order = phaseOrder.order;
                await this.phaseRepository.save(phase);
            }
        }
        return this.findByCourse(courseId);
    }
    async getNextOrder(courseId) {
        const lastPhase = await this.phaseRepository.findOne({
            where: { course: { id: courseId } },
            order: { order: 'DESC' }
        });
        return lastPhase ? lastPhase.order + 1 : 1;
    }
    async duplicatePhase(id, newName) {
        const originalPhase = await this.findOne(id);
        const newOrder = await this.getNextOrder(originalPhase.course.id);
        const duplicatedPhase = this.phaseRepository.create({
            name: newName || `${originalPhase.name} (Copy)`,
            description: originalPhase.description,
            order: newOrder,
            course: originalPhase.course
        });
        return this.phaseRepository.save(duplicatedPhase);
    }
};
exports.PhaseService = PhaseService;
exports.PhaseService = PhaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(phase_entity_1.Phase)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PhaseService);
