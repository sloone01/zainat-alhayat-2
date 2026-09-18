import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from '../../entities/school.entity';
import { ActorLogLabelService } from './actor-log-label.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([School])],
  providers: [ActorLogLabelService],
  exports: [ActorLogLabelService],
})
export class BizLoggingModule {}
