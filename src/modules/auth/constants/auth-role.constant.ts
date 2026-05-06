export const AUTH_ROLE = {
    SUPER_ADMIN: 'super_admin',
    VILLAGE_ADMIN: 'village_admin',
    VILLAGE_STAFF: 'village_staff',
} as const;

export type AuthRole = (typeof AUTH_ROLE)[keyof typeof AUTH_ROLE];

export const REGISTER_ALLOWED_VILLAGE_ROLES = [
    AUTH_ROLE.VILLAGE_ADMIN,
    AUTH_ROLE.VILLAGE_STAFF,
];