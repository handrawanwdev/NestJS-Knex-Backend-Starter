import { WorkerJob } from '../constants/worker-job.constant';

export type WorkerJobPayload<T = Record<string, any>> = {
    job_id?: string;
    job_name: WorkerJob;
    requested_by?: number;
    payload: T;
};