import { LoginLogProcessor } from './processors/login-log.processor';
import { Module } from '@nestjs/common';

// import { QueueModule } from '../queue/queue.module';
import { DefaultJobProcessor } from './processors/default-job.processor';

@Module({
  imports: [
    // QueueModule
  ],
  providers: [
    DefaultJobProcessor,
    LoginLogProcessor,
  ],
})
export class WorkersModule { }