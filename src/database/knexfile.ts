import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../..');

const envFile =
    process.env.APP_ENV === 'production' ? '.env' : '.env.development';

dotenv.config({
    path: path.join(rootDir, envFile),
    override: true,
});

const config: Knex.Config = {
    client: 'pg',

    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'bumdes_backend',
    },

    migrations: {
        directory: path.join(rootDir, 'src/database/migrations'),
        extension: 'ts',
    },

    seeds: {
        directory: path.join(rootDir, 'src/database/seeds'),
        extension: 'ts',
    },
};

export default config;