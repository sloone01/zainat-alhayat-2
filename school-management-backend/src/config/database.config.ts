import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // Check if DATABASE_URL is provided (Render style)
  const databaseUrl = configService.get<string>('DATABASE_URL');
  
  if (databaseUrl) {
    // Parse DATABASE_URL for Render deployment
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // Always false in production
      logging: process.env.NODE_ENV === 'development',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: true, // Auto-run migrations on startup
      migrationsTableName: 'migrations',
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
    };
  }

  // Fallback to individual environment variables (development)
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USERNAME', 'school_admin'),
    password: configService.get<string>('DATABASE_PASSWORD', 'school_password_2024'),
    database: configService.get<string>('DATABASE_NAME', 'school_management'),
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
