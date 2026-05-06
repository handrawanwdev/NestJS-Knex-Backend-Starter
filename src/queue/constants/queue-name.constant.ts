export const QUEUE_NAME = {
    DEFAULT: 'default',
    REPORT: 'report',
    IMPORT: 'import',
    EXPORT: 'export',
    CLEANUP: 'cleanup',
} as const;

export type QueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME];