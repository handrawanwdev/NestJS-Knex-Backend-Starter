import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthPermissionRepository } from '../../auth/repositories/auth-permission.repository';
import { AssignRolePermissionDto } from '../dto/assign-role-permission.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly authPermissionRepository: AuthPermissionRepository,
  ) { }

  async findAll() {
    const data = await this.authPermissionRepository.findAllRoles();

    return {
      status: 200,
      message: 'Role list retrieved successfully',
      data,
    };
  }

  async getRolePermissions(roleUuid: string) {
    const role = await this.authPermissionRepository.findRoleByUuid(roleUuid);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions =
      await this.authPermissionRepository.getRolePermissions(role.id);

    return {
      status: 200,
      message: 'Role permissions retrieved successfully',
      data: {
        role: {
          uuid: role.uuid,
          name: role.name,
          code: role.code,
        },
        permissions,
      },
    };
  }

  async assignPermission(roleUuid: string, payload: AssignRolePermissionDto) {
    const role = await this.authPermissionRepository.findRoleByUuid(roleUuid);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission =
      await this.authPermissionRepository.findPermissionByUuid(
        payload.permission_uuid,
      );

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.authPermissionRepository.assignPermissionToRole(
      role.id,
      permission.id,
    );

    return {
      status: 200,
      message: 'Permission assigned to role successfully',
      data: null,
    };
  }

  async removePermission(roleUuid: string, permissionUuid: string) {
    const role = await this.authPermissionRepository.findRoleByUuid(roleUuid);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission =
      await this.authPermissionRepository.findPermissionByUuid(permissionUuid);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.authPermissionRepository.removePermissionFromRole(
      role.id,
      permission.id,
    );

    return {
      status: 200,
      message: 'Permission removed from role successfully',
      data: null,
    };
  }
}