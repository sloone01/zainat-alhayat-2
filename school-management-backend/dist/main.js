"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./crypto-polyfill");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const isProd = process.env.NODE_ENV === 'production';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: isProd
            ? ['error', 'warn', 'log']
            : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.enableCors({
        origin: true,
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
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/api/files/',
    });
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