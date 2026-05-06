import { VillageController } from './modules/village/controllers/village.controller';
import { VillageService } from './modules/village/services/village.service';
import { VillageRepository } from './modules/village/repositories/village.repository';
import { RolesController } from './modules/roles/controllers/roles.controller';
import { RolesService } from './modules/roles/services/roles.service';
import { RolesRepository } from './modules/roles/repositories/roles.repository';
import { AuthController } from './modules/auth/controllers/auth.controller';
import { AuthService } from './modules/auth/services/auth.service';
import { AuthRepository } from './modules/auth/repositories/auth.repository';
import { AuthPermissionRepository } from './modules/auth/repositories/auth-permission.repository';
import { UserController } from './modules/user/controllers/user.controller';
import { UserService } from './modules/user/services/user.service';
import { UserRepository } from './modules/user/repositories/user.repository';
import { VillageProfileController } from './modules/village-profile/controllers/village-profile.controller';
import { VillageProfileService } from './modules/village-profile/services/village-profile.service';
import { VillageProfileRepository } from './modules/village-profile/repositories/village-profile.repository';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

import { DatabaseModule } from './database/database.module';
// import { QueueModule } from './queue/queue.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.APP_ENV === 'production'
          ? '.env'
          : '.env.development',
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change_this_secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
      },
    }),

    DatabaseModule,
    // QueueModule,
    WorkersModule,

  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    VillageProfileController,
    RolesController,
    VillageController
  ],
  providers: [
    AppService,
    AuthService,
    AuthRepository,
    AuthPermissionRepository,
    UserService,
    UserRepository,
    VillageProfileService,
    VillageProfileRepository,
    RolesService,
    RolesRepository,
    VillageService,
    VillageRepository
  ],
})
export class AppModule { }