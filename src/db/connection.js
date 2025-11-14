import knex from 'knex';
import { Model } from 'objection';
import { env } from '../config/env.js';
console.warn(env);
const connection = knex({
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
});

Model.knex(connection);

export default connection;
