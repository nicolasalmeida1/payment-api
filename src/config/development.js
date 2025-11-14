export default {
  dbHost: process.env.DATABASE_HOST,
  dbPort: Number(process.env.DATABASE_PORT),
  dbUser: process.env.DATABASE_USER,
  dbPassword: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,
};
