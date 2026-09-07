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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleHealthController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/public.decorator");
let SimpleHealthController = class SimpleHealthController {
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    simpleCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SimpleHealthController = SimpleHealthController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimpleHealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('simple'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimpleHealthController.prototype, "simpleCheck", null);
exports.SimpleHealthController = SimpleHealthController = __decorate([
    (0, common_1.Controller)('health')
], SimpleHealthController);
//# sourceMappingURL=simple-health.controller.js.map