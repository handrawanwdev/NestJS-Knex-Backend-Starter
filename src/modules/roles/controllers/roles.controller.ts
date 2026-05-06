import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from '../services/roles.service';
import { AssignRolePermissionDto } from '../dto/assign-role-permission.dto';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AUTH_PERMISSION } from '../../auth/constants/auth-permission.constant';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @Permissions(AUTH_PERMISSION.ROLE_READ)
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':roleUuid/permissions')
  @Permissions(AUTH_PERMISSION.ROLE_READ)
  async getRolePermissions(@Param('roleUuid') roleUuid: string) {
    return this.rolesService.getRolePermissions(roleUuid);
  }

  @Post(':roleUuid/permissions')
  @Permissions(AUTH_PERMISSION.ROLE_ASSIGN)
  async assignPermission(
    @Param('roleUuid') roleUuid: string,
    @Body() payload: AssignRolePermissionDto,
  ) {
    return this.rolesService.assignPermission(roleUuid, payload);
  }

  @Delete(':roleUuid/permissions/:permissionUuid')
  @Permissions(AUTH_PERMISSION.ROLE_ASSIGN)
  async removePermission(
    @Param('roleUuid') roleUuid: string,
    @Param('permissionUuid') permissionUuid: string,
  ) {
    return this.rolesService.removePermission(roleUuid, permissionUuid);
  }
}