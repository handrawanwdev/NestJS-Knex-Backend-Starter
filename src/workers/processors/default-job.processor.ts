import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_NAME } from '../../queue/constants/queue-name.constant';
import { WORKER_JOB } from '../constants/worker-job.constant';
import { WorkerJobPayload } from '../types/worker-job-payload.type';

@Injectable()
@Processor(QUEUE_NAME.DEFAULT)
export class DefaultJobProcessor extends WorkerHost {
    private readonly logger = new Logger(DefaultJobProcessor.name);

    async process(job: Job<WorkerJobPayload>): Promise<any> {
        this.logger.log(`Processing job: ${job.name} | ID: ${job.id}`);

        switch (job.name) {
            case WORKER_JOB.DEFAULT_TEST:
                return this.handleDefaultTest(job);

            case WORKER_JOB.REPORT_EXPORT:
                return this.handleReportExport(job);

            case WORKER_JOB.DATA_IMPORT:
                return this.handleDataImport(job);

            case WORKER_JOB.CLEANUP_EXPIRED_DATA:
                return this.handleCleanupExpiredData(job);

            case WORKER_JOB.AUDIT_LOG_ASYNC:
                return this.handleAuditLogAsync(job);

            default:
                this.logger.warn(`Unhandled job name: ${job.name}`);

                return {
                    status: 'skipped',
                    message: `Unhandled job name: ${job.name}`,
                };
        }
    }

    private async handleDefaultTest(job: Job<WorkerJobPayload>) {
        this.logger.log(`Default test payload: ${JSON.stringify(job.data)}`);

        return {
            status: 'success',
            message: 'Default test job processed successfully',
            data: job.data,
        };
    }

    private async handleReportExport(job: Job<WorkerJobPayload>) {
        return {
            status: 'success',
            message: 'Report export processed successfully',
            data: job.data,
        };
    }

    private async handleDataImport(job: Job<WorkerJobPayload>) {
        return {
            status: 'success',
            message: 'Data import processed successfully',
            data: job.data,
        };
    }

    private async handleCleanupExpiredData(job: Job<WorkerJobPayload>) {
        return {
            status: 'success',
            message: 'Cleanup expired data processed successfully',
            data: job.data,
        };
    }

    private async handleAuditLogAsync(job: Job<WorkerJobPayload>) {
        return {
            status: 'success',
            message: 'Audit log async processed successfully',
            data: job.data,
        };
    }
}