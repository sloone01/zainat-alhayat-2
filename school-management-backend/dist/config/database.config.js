"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    const databaseUrl = configService.get('DATABASE_URL');
    console.log('🔍 Database Configuration Debug:');
    console.log('DATABASE_URL exists:', !!databaseUrl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    if (databaseUrl) {
        const safeUrl = databaseUrl.replace(/:([^:@]+)@/, ':***@');
        console.log('✅ Using DATABASE_URL:', safeUrl);
        return {
            type: 'postgres',
            url: databaseUrl,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false,
            logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            migrationsRun: false,
            migrationsTableName: 'migrations',
            retryAttempts: 5,
            retryDelay: 5000,
            autoLoadEntities: true,
            connectTimeoutMS: 60000,
            acquireTimeoutMS: 60000,
            timeout: 60000,
        };
    }
    return {
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'school_admin'),
        password: configService.get('DATABASE_PASSWORD', 'school_password_2024'),
        database: configService.get('DATABASE_NAME', 'school_management'),
        schema: 'public',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: 'migrations',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map