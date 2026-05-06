import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthPermissionRepository } from '../../modules/auth/repositories/auth-permission.repository';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authPermissionRepository: AuthPermissionRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions =
            this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || [];

        if (!requiredPermissions.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.id) {
            throw new ForbiddenException('User is not authenticated');
        }

        const hasPermission =
            await this.authPermissionRepository.userHasAnyPermission(
                user.id,
                requiredPermissions,
            );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission');
        }

        return true;
    }
}