import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { KNEX_CONNECTION } from './constants/database.constant';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: KNEX_CONNECTION,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): Knex => {
                return knex({
                    client: 'pg',
                    connection: {
                        host: configService.get<string>('DB_HOST', 'localhost'),
                        port: Number(configService.get<string>('DB_PORT', '5432')),
                        user: configService.get<string>('DB_USER', 'postgres'),
                        password: configService.get<string>('DB_PASSWORD', 'postgres'),
                        database: configService.get<string>('DB_NAME', 'bumdes_backend'),
                    },
                    pool: {
                        min: 2,
                        max: 10,
                    },
                });
            },
        },
    ],
    exports: [KNEX_CONNECTION],
})
export class DatabaseModule { }