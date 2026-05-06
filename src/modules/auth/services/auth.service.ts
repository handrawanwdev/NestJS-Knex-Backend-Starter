import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginDto } from '../dto/login.dto';
import { RegisterFirstAccountDto } from '../dto/register-first-account.dto';
import { RegisterVillageUserDto } from '../dto/register-village-user.dto';
import {
  AUTH_ROLE,
  REGISTER_ALLOWED_VILLAGE_ROLES,
} from '../constants/auth-role.constant';
import { CurrentAuthUser } from '../types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) { }

  async registerFirstAccount(payload: RegisterFirstAccountDto) {
    const data = await this.authRepository.transaction(async (trx) => {
      await this.authRepository.acquireRegisterFirstAccountLock(trx);

      const userCount = await this.authRepository.countActiveUsers(trx);

      if (userCount > 0) {
        throw new BadRequestException('Register first account already closed');
      }

      const existingUser = await this.authRepository.findUserByEmail(
        payload.email,
        trx,
      );

      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      const superAdminRole = await this.authRepository.findRoleByName(
        AUTH_ROLE.SUPER_ADMIN,
        trx,
      );

      if (!superAdminRole) {
        throw new BadRequestException('Super admin role not found');
      }

      const passwordHash = await bcrypt.hash(payload.password, 12);

      const user = await this.authRepository.createUser(
        {
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone || null,
          password_hash: passwordHash,
          village_id: null,
          status: 'active',
          is_first_account: true,
          created_by: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        trx,
      );

      await this.authRepository.assignUserRole(
        {
          user_id: user.id,
          role_id: superAdminRole.id,
          created_by: null,
        },
        trx,
      );

      return user;
    });

    return {
      status: 201,
      message: 'First account registered successfully',
      data,
    };
  }

  async registerVillageUser(
    payload: RegisterVillageUserDto,
    currentUser: CurrentAuthUser,
  ) {
    const data = await this.authRepository.transaction(async (trx) => {
      const existingUser = await this.authRepository.findUserByEmail(
        payload.email,
        trx,
      );

      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      const village = await this.authRepository.findVillageByUuid(
        payload.villageUuid,
        trx,
      );

      if (!village) {
        throw new BadRequestException('Village not found');
      }

      const role = await this.authRepository.findRoleByUuid(
        payload.roleUuid,
        trx,
      );

      if (!role) {
        throw new BadRequestException('Role not found');
      }

      if (role.name === AUTH_ROLE.SUPER_ADMIN) {
        throw new BadRequestException(
          'Super admin cannot be created from regular register',
        );
      }

      if (!REGISTER_ALLOWED_VILLAGE_ROLES.includes(role.name)) {
        throw new BadRequestException('Role is not allowed for village user');
      }

      const currentUserRoles =
        currentUser.roles ||
        (await this.authRepository.getUserRoles(currentUser.id, trx));

      const isSuperAdmin = currentUserRoles.includes(AUTH_ROLE.SUPER_ADMIN);

      if (!isSuperAdmin && currentUser.village_id !== village.id) {
        throw new BadRequestException(
          'You can only register users for your own village',
        );
      }

      const passwordHash = await bcrypt.hash(payload.password, 12);

      const user = await this.authRepository.createUser(
        {
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone || null,
          password_hash: passwordHash,
          village_id: village.id,
          status: 'active',
          is_first_account: false,
          created_by: currentUser.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        trx,
      );

      await this.authRepository.assignUserRole(
        {
          user_id: user.id,
          role_id: role.id,
          created_by: currentUser.id,
        },
        trx,
      );

      return user;
    });

    return {
      status: 201,
      message: 'Village user registered successfully',
      data,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.authRepository.findUserByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = await this.authRepository.getUserRoles(user.id);
    const permissions = await this.authRepository.getUserPermissions(user.id);

    await this.authRepository.updateLastLoginAt(user.id);

    const tokenPayload = {
      sub: user.uuid,
      userId: user.id,
      userUuid: user.uuid,
      email: user.email,
      villageId: user.village_id,
      roles,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      status: 200,
      message: 'Login successfully',
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        user: {
          uuid: user.uuid,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          village_id: user.village_id,
          status: user.status,
          roles,
          permissions,
        },
      },
    };
  }
}