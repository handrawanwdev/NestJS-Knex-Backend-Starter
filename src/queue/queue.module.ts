import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QueueService } from './services/queue.service';
import { QUEUE_NAME } from './constants/queue-name.constant';

@Module({
    imports: [
        ConfigModule,

        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST', 'localhost'),
                    port: Number(configService.get<string>('REDIS_PORT', '6379')),
                    password: configService.get<string>('REDIS_PASSWORD') || undefined,
                },
                prefix: configService.get<string>('QUEUE_PREFIX', 'boomdest'),
            }),
        }),

        BullModule.registerQueue({
            name: QUEUE_NAME.DEFAULT,
        }),
    ],
    providers: [QueueService],
    exports: [QueueService, BullModule],
})
export class QueueModule { }