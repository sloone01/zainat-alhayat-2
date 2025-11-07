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
exports.ParentController = void 0;
const common_1 = require("@nestjs/common");
const parent_service_1 = require("../services/parent.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ParentController = class ParentController {
    constructor(parentService) {
        this.parentService = parentService;
    }
    async create(createParentDto) {
        try {
            const parent = await this.parentService.create(createParentDto);
            return {
                success: true,
                data: parent,
                message: 'Parent created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findAll() {
        try {
            const parents = await this.parentService.findAll();
            return {
                success: true,
                data: parents,
                count: parents.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async search(query) {
        try {
            if (!query) {
                return {
                    success: false,
                    message: 'Search query is required'
                };
            }
            const parents = await this.parentService.searchParents(query);
            return {
                success: true,
                data: parents,
                count: parents.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findOne(id) {
        try {
            const parent = await this.parentService.findOne(id);
            return {
                success: true,
                data: parent
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async update(id, updateParentDto) {
        try {
            const parent = await this.parentService.update(id, updateParentDto);
            return {
                success: true,
                data: parent,
                message: 'Parent updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async assignToStudent(id, studentId) {
        try {
            const parent = await this.parentService.assignToStudent(id, studentId);
            return {
                success: true,
                data: parent,
                message: 'Parent assigned to student successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async remove(id) {
        try {
            await this.parentService.remove(id);
            return {
                success: true,
                message: 'Parent deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
};
exports.ParentController = ParentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign-student'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "assignToStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "remove", null);
exports.ParentController = ParentController = __decorate([
    (0, common_1.Controller)('parents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [parent_service_1.ParentService])
], ParentController);
