import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectKnex } from '../../../database/decorators/inject-knex.decorator';
import { AUTH_ROLE } from '../constants/auth-role.constant';

@Injectable()
export class AuthPermissionRepository {
    constructor(@InjectKnex() private readonly knex: Knex) { }

    async userHasAnyPermission(
        userId: number,
        permissions: string[],
    ): Promise<boolean> {
        const superAdminRole = await this.knex('auth_user_role as aur')
            .join('auth_role as ar', 'ar.id', 'aur.role_id')
            .where('aur.user_id', userId)
            .where('ar.code', AUTH_ROLE.SUPER_ADMIN)
            .whereNull('ar.deleted_at')
            .first('ar.id');

        if (superAdminRole) {
            return true;
        }

        const permission = await this.knex('auth_user_role as aur')
            .join('auth_role as ar', 'ar.id', 'aur.role_id')
            .join('auth_role_permission as arp', 'arp.role_id', 'ar.id')
            .join('auth_permission as ap', 'ap.id', 'arp.permission_id')
            .where('aur.user_id', userId)
            .whereIn('ap.code', permissions)
            .whereNull('ar.deleted_at')
            .whereNull('ap.deleted_at')
            .first('ap.id');

        return !!permission;
    }

    async findAllPermissions() {
        return this.knex('auth_permission')
            .whereNull('deleted_at')
            .select('uuid', 'name', 'code', 'module', 'description')
            .orderBy('module', 'asc')
            .orderBy('code', 'asc');
    }

    async findAllRoles() {
        return this.knex('auth_role')
            .whereNull('deleted_at')
            .select('uuid', 'name', 'code', 'description')
            .orderBy('id', 'asc');
    }

    async findRoleByUuid(roleUuid: string) {
        return this.knex('auth_role')
            .where('uuid', roleUuid)
            .whereNull('deleted_at')
            .first();
    }

    async findPermissionByUuid(permissionUuid: string) {
        return this.knex('auth_permission')
            .where('uuid', permissionUuid)
            .whereNull('deleted_at')
            .first();
    }

    async assignPermissionToRole(
        roleId: number,
        permissionId: number,
        trx?: Knex.Transaction,
    ) {
        const db = trx || this.knex;

        await db('auth_role_permission')
            .insert({
                role_id: roleId,
                permission_id: permissionId,
            })
            .onConflict(['role_id', 'permission_id'])
            .ignore();
    }

    async removePermissionFromRole(
        roleId: number,
        permissionId: number,
        trx?: Knex.Transaction,
    ) {
        const db = trx || this.knex;

        return db('auth_role_permission')
            .where({
                role_id: roleId,
                permission_id: permissionId,
            })
            .delete();
    }

    async getRolePermissions(roleId: number) {
        return this.knex('auth_role_permission as arp')
            .join('auth_permission as ap', 'ap.id', 'arp.permission_id')
            .where('arp.role_id', roleId)
            .whereNull('ap.deleted_at')
            .select('ap.uuid', 'ap.name', 'ap.code', 'ap.module', 'ap.description')
            .orderBy('ap.module', 'asc')
            .orderBy('ap.code', 'asc');
    }
}