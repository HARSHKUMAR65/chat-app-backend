import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config(
  {
    path: './.env'
  }
);
const sequelize = new Sequelize(process.env.MYSQL_DATA, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
});
export { sequelize }