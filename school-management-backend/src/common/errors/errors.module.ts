import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ClientErrorController } from './client-error.controller';
import { ErrorAlertService } from './error-alert.service';
import { ErrorTicket } from './error-ticket.entity';
import { ErrorTicketService } from './error-ticket.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ErrorTicket])],
  controllers: [ClientErrorController],
  providers: [
    ErrorAlertService,
    ErrorTicketService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [ErrorAlertService, ErrorTicketService],
})
export class ErrorsModule {}
