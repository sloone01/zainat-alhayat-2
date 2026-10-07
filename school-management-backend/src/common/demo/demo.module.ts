import { Global, Module } from '@nestjs/common';
import { DemoAccountsService } from './demo-accounts.service';

@Global()
@Module({
  providers: [DemoAccountsService],
  exports: [DemoAccountsService],
})
export class DemoModule {}
