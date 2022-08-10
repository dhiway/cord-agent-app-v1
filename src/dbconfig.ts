import { ConnectionOptions } from 'typeorm';

const {
    TYPEORM_HOST,
    TYPEORM_PORT,
    TYPEORM_USERNAME,
    TYPEORM_PASSWORD,
    TYPEORM_DATABASE,
    TYPEORM_AUTO_SCHEMA_SYNC,
    TYPEORM_LOGGING,
    TYPEORM_ENTITIES,
    TYPEORM_MIGRATIONS,
    TYPEORM_SUBSCRIBERS,
    TYPEORM_ENTITIES_DIR,
    TYPEORM_MIGRATIONS_DIR,
    TYPEORM_SUBSCRIBERS_DIR,
} = process.env;

export const dbConfig: ConnectionOptions = {
    type: 'postgres',
    host: TYPEORM_HOST,
    port: parseInt(TYPEORM_PORT as string),
    username: TYPEORM_USERNAME,
    password: TYPEORM_PASSWORD,
    database: TYPEORM_DATABASE,
    synchronize: JSON.parse(TYPEORM_AUTO_SCHEMA_SYNC as string),
    logging: JSON.parse(TYPEORM_LOGGING as string),
    entities: [TYPEORM_ENTITIES as string],
    migrations: [TYPEORM_MIGRATIONS as string],
    subscribers: [TYPEORM_SUBSCRIBERS as string],
    cli: {
        entitiesDir: TYPEORM_ENTITIES_DIR as string,
        migrationsDir: TYPEORM_MIGRATIONS_DIR as string,
        subscribersDir: TYPEORM_SUBSCRIBERS_DIR as string,
    },
};
