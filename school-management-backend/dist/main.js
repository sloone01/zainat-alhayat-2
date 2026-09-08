"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./load-env");
require("./crypto-polyfill");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const runtime_secrets_1 = require("./common/security/runtime-secrets");
async function bootstrap() {
    const isProd = process.env.NODE_ENV === 'production';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: isProd
            ? ['error', 'warn', 'log']
            : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    const corsOrigin = (0, runtime_secrets_1.resolveCorsOrigins)();
    if (isProd && (corsOrigin === true || (Array.isArray(corsOrigin) && corsOrigin.length === 0))) {
        throw new Error('CORS_ORIGIN must be set to an explicit allowlist in production (comma-separated origins).');
    }
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'thawani-signature',
            'thawani-timestamp',
            'x-request-id',
        ],
        exposedHeaders: ['X-Request-Id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3002;
    await app.listen(port, '0.0.0.0');
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`Application is running on: http://0.0.0.0:${port}`);
    logger.log(`API endpoints available at: http://0.0.0.0:${port}/api`);
    logger.log(`Health check at: http://0.0.0.0:${port}/api/health`);
    if (process.env.ENABLE_DEBUG_ENDPOINTS === 'true') {
        logger.warn(`Debug endpoints enabled at: http://0.0.0.0:${port}/api/debug`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map