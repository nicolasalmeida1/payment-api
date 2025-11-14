import { env } from '../config/env.js';
console.warn('ENV', env);
export default {
  development: {
    client: 'pg',
    connection: {
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
    },
    migrations: {
      directory: './migrations',
    },
    pool: { max: 10, min: 2 },
  },
};
