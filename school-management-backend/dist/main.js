"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./crypto-polyfill");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
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
    console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
    console.log(`📋 API endpoints available at: http://0.0.0.0:${port}/api`);
    console.log(`🔍 Health check at: http://0.0.0.0:${port}/api/health`);
    console.log(`🔧 Debug endpoints at: http://0.0.0.0:${port}/api/debug`);
}
bootstrap();
//# sourceMappingURL=main.js.map