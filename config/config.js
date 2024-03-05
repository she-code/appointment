const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_TEST,
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: process.env.PRODUCTION_USER,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DB,
    dialect: "postgres",
  },
};
