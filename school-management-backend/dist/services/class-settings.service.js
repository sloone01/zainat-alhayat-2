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
exports.ClassSettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_settings_entity_1 = require("../entities/class-settings.entity");
let ClassSettingsService = class ClassSettingsService {
    constructor(classSettingsRepository) {
        this.classSettingsRepository = classSettingsRepository;
    }
    async create(createClassSettingsDto) {
        const classSettings = this.classSettingsRepository.create(createClassSettingsDto);
        return this.classSettingsRepository.save(classSettings);
    }
    async findAll() {
        return this.classSettingsRepository.find({
            order: { created_at: 'DESC' }
        });
    }
    async findOne(id) {
        const classSettings = await this.classSettingsRepository.findOne({
            where: { id }
        });
        if (!classSettings) {
            throw new common_1.NotFoundException(`Class settings with ID ${id} not found`);
        }
        return classSettings;
    }
    async findActive() {
        return this.classSettingsRepository.findOne({
            where: { is_active: true }
        });
    }
    async update(id, updateClassSettingsDto) {
        const classSettings = await this.findOne(id);
        Object.assign(classSettings, updateClassSettingsDto);
        return this.classSettingsRepository.save(classSettings);
    }
    async remove(id) {
        const classSettings = await this.findOne(id);
        await this.classSettingsRepository.remove(classSettings);
    }
    async setActive(id) {
        await this.classSettingsRepository.update({}, { is_active: false });
        const classSettings = await this.findOne(id);
        classSettings.is_active = true;
        return this.classSettingsRepository.save(classSettings);
    }
    async getOrCreateDefault() {
        let activeSettings = await this.findActive();
        if (!activeSettings) {
            activeSettings = this.classSettingsRepository.create({
                setting_type: 'duration',
                name: 'Default Duration',
                duration_minutes: 60,
                is_default: true,
                is_active: true,
                order_index: 1,
                school_id: 1
            });
            activeSettings = await this.classSettingsRepository.save(activeSettings);
        }
        return activeSettings;
    }
    async addDuration(duration) {
        const durationSetting = this.classSettingsRepository.create({
            setting_type: 'duration',
            name: `${duration} minutes`,
            duration_minutes: duration,
            is_active: true,
            order_index: duration,
            school_id: 1
        });
        return this.classSettingsRepository.save(durationSetting);
    }
    async removeDuration(duration) {
        await this.classSettingsRepository.delete({
            setting_type: 'duration',
            duration_minutes: duration
        });
    }
    async addStartTime(startTime) {
        const startTimeSetting = this.classSettingsRepository.create({
            setting_type: 'start_time',
            name: `Start at ${startTime}`,
            time_value: startTime,
            is_active: true,
            order_index: 1,
            school_id: 1
        });
        return this.classSettingsRepository.save(startTimeSetting);
    }
    async removeStartTime(startTime) {
        await this.classSettingsRepository.delete({
            setting_type: 'start_time',
            time_value: startTime
        });
    }
    async setDefaultDuration(duration) {
        await this.classSettingsRepository.update({ setting_type: 'duration' }, { is_default: false });
        let durationSetting = await this.classSettingsRepository.findOne({
            where: { setting_type: 'duration', duration_minutes: duration }
        });
        if (!durationSetting) {
            durationSetting = await this.addDuration(duration);
        }
        durationSetting.is_default = true;
        return this.classSettingsRepository.save(durationSetting);
    }
    async validateTimeSlot(startTime, duration) {
        const startTimeExists = await this.classSettingsRepository.findOne({
            where: { setting_type: 'start_time', time_value: startTime, is_active: true }
        });
        const durationExists = await this.classSettingsRepository.findOne({
            where: { setting_type: 'duration', duration_minutes: duration, is_active: true }
        });
        return !!startTimeExists && !!durationExists;
    }
    async getAvailableTimeSlots() {
        const durationSettings = await this.classSettingsRepository.find({
            where: { setting_type: 'duration', is_active: true },
            order: { duration_minutes: 'ASC' }
        });
        const startTimeSettings = await this.classSettingsRepository.find({
            where: { setting_type: 'start_time', is_active: true },
            order: { time_value: 'ASC' }
        });
        const defaultDurationSetting = await this.classSettingsRepository.findOne({
            where: { setting_type: 'duration', is_default: true, is_active: true }
        });
        return {
            durations: durationSettings.map(s => s.duration_minutes).filter(d => d !== null),
            startTimes: startTimeSettings.map(s => s.time_value).filter(t => t !== null),
            defaultDuration: defaultDurationSetting?.duration_minutes || 60
        };
    }
};
exports.ClassSettingsService = ClassSettingsService;
exports.ClassSettingsService = ClassSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_settings_entity_1.ClassSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClassSettingsService);
