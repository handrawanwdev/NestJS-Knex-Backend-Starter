import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    const rolePermissions: Record<string, string[]> = {
        super_admin: [
            'dashboard:read',

            'village:create',
            'village:read',
            'village:update',
            'village:delete',

            'user:create',
            'user:read',
            'user:update',
            'user:delete',

            'role:read',
            'role:assign',

            'permission:read',
            'permission:assign',

            'report:read',
        ],

        village_admin: [
            'dashboard:read',

            'village:read',
            'village:update',

            'user:create',
            'user:read',
            'user:update',

            'role:read',
            'role:assign',

            'permission:read',

            'report:read',
        ],

        village_staff: [
            'dashboard:read',

            'village:read',

            'user:read',

            'role:read',
            'permission:read',

            'report:read',
        ],
    };

    const roles = await knex('auth_role')
        .whereIn('name', Object.keys(rolePermissions))
        .whereNull('deleted_at')
        .select('id', 'name');

    const permissionNames = Array.from(
        new Set(Object.values(rolePermissions).flat()),
    );

    const permissions = await knex('auth_permission')
        .whereIn('name', permissionNames)
        .whereNull('deleted_at')
        .select('id', 'name');

    const roleMap = new Map(roles.map((role) => [role.name, role.id]));
    const permissionMap = new Map(
        permissions.map((permission) => [permission.name, permission.id]),
    );

    const rows: Array<{
        role_id: number;
        permission_id: number;
        created_by: null;
        created_at: Knex.Raw;
    }> = [];

    for (const [roleName, permissionList] of Object.entries(rolePermissions)) {
        const roleId = roleMap.get(roleName);

        if (!roleId) {
            throw new Error(`Role ${roleName} belum tersedia.`);
        }

        for (const permissionName of permissionList) {
            const permissionId = permissionMap.get(permissionName);

            if (!permissionId) {
                throw new Error(`Permission ${permissionName} belum tersedia.`);
            }

            rows.push({
                role_id: roleId,
                permission_id: permissionId,
                created_by: null,
                created_at: knex.fn.now(),
            });
        }
    }

    if (rows.length === 0) {
        return;
    }

    await knex('auth_role_permission')
        .insert(rows)
        .onConflict(['role_id', 'permission_id'])
        .ignore();
}