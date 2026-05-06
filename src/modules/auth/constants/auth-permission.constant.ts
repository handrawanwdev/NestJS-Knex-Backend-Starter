export const AUTH_PERMISSION = {
    DASHBOARD_READ: 'dashboard:read',

    VILLAGE_CREATE: 'village:create',
    VILLAGE_READ: 'village:read',
    VILLAGE_UPDATE: 'village:update',
    VILLAGE_DELETE: 'village:delete',

    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',

    ROLE_READ: 'role:read',
    ROLE_ASSIGN: 'role:assign',

    PERMISSION_READ: 'permission:read',

    REPORT_READ: 'report:read',
} as const;

export type AuthPermission = (typeof AUTH_PERMISSION)[keyof typeof AUTH_PERMISSION];