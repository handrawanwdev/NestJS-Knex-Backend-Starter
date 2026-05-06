export const WORKER_JOB = {
  DEFAULT_TEST: 'default.test',

  REPORT_GENERATE_DAILY: 'report.generate_daily',
  REPORT_EXPORT: 'report.export',

  DATA_IMPORT: 'data.import',
  DATA_EXPORT: 'data.export',

  CLEANUP_EXPIRED_DATA: 'cleanup.expired_data',
  AUDIT_LOG_ASYNC: 'audit.log_async',
  LOGIN_LOG: 'login_log',
} as const;

export type WorkerJob = (typeof WORKER_JOB)[keyof typeof WORKER_JOB];