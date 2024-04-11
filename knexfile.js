import dotenv from 'dotenv';
dotenv.config();

export default {
    client: 'pg',
    connection: {
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: 5432,
    },
    pool: {
        min: 0,
        max: 10,
    },
    migrations: {
        directory: './migrations'
    },
};