import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ClientErrorController } from './client-error.controller';
import { ErrorAlertService } from './error-alert.service';

@Global()
@Module({
  controllers: [ClientErrorController],
  providers: [
    ErrorAlertService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [ErrorAlertService],
})
export class ErrorsModule {}
