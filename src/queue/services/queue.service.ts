import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { QUEUE_NAME } from '../constants/queue-name.constant';
import { WorkerJob } from '../../workers/constants/worker-job.constant';
import { WorkerJobPayload } from '../../workers/types/worker-job-payload.type';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue(QUEUE_NAME.DEFAULT)
        private readonly defaultQueue: Queue,
    ) { }

    async addDefaultJob<T = Record<string, any>>(
        jobName: WorkerJob,
        payload: WorkerJobPayload<T>,
    ) {
        return this.defaultQueue.add(jobName, payload, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
            removeOnComplete: {
                age: 60 * 60 * 24,
                count: 1000,
            },
            removeOnFail: {
                age: 60 * 60 * 24 * 7,
                count: 1000,
            },
        });
    }
}