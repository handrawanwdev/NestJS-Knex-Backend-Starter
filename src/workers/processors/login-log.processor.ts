import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_NAME } from '../../queue/constants/queue-name.constant';
import { WorkerJobPayload } from '../types/worker-job-payload.type';

@Injectable()
@Processor(QUEUE_NAME.DEFAULT)
export class LoginLogProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginLogProcessor.name);

  /**
   * Processor: login-log
   *
   * Please adjust the job handling logic based on the business requirement.
   * Keep the processor idempotent because failed jobs may be retried.
   */
  async process(job: Job<WorkerJobPayload>): Promise<any> {
    this.logger.log(`Processing job: ${job.name} | ID: ${job.id}`);

    if (job.name !== 'login_log') {
      return {
        status: 'skipped',
        message: `Skipped job: ${job.name}`,
      };
    }

    return this.handleJob(job);
  }

  private async handleJob(job: Job<WorkerJobPayload>) {
    this.logger.log(`LoginLogProcessor payload: ${JSON.stringify(job.data)}`);

    /**
     * TODO:
     * Add business logic here.
     * Example:
     * - Generate report
     * - Import data
     * - Export data
     * - Cleanup expired data
     * - Write async audit log
     */
    return {
      status: 'success',
      message: 'login-log processed successfully',
      data: job.data,
    };
  }
}
