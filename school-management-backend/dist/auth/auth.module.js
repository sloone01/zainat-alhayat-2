"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const user_type_guard_1 = require("./user-type.guard");
const user_entity_1 = require("../entities/user.entity");
const school_entity_1 = require("../entities/school.entity");
const rbac_module_1 = require("../rbac/rbac.module");
const notifications_module_1 = require("../notifications/notifications.module");
const runtime_secrets_1 = require("../common/security/runtime-secrets");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: (0, runtime_secrets_1.requireJwtSecret)(),
                signOptions: {
                    expiresIn: (process.env.JWT_EXPIRES_IN || '24h'),
                },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, school_entity_1.School]),
            (0, common_1.forwardRef)(() => rbac_module_1.RbacModule),
            notifications_module_1.NotificationsModule,
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard, user_type_guard_1.UserTypeGuard],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, jwt_1.JwtModule, user_type_guard_1.UserTypeGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map