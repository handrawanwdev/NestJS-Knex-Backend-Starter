import { IsUUID } from 'class-validator';

export class AssignRolePermissionDto {
    @IsUUID()
    permission_uuid: string;
}