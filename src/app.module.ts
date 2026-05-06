import { AuthController } from './modules/auth/controllers/auth.controller';
import { AuthService } from './modules/auth/services/auth.service';
import { AuthRepository } from './modules/auth/repositories/auth.repository';
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

    DatabaseModule,
    // QueueModule,
    WorkersModule,

  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    VillageProfileController
  ],
  providers: [
    AppService,
    AuthService,
    AuthRepository,
    UserService,
    UserRepository,
    VillageProfileService,
    VillageProfileRepository
  ],
})
export class AppModule { }