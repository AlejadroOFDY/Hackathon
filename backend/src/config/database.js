import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);
export const start_DB = async () => {
  try {
    await sequelize.authenticate();
    console.log("La conexión fue exitosa");
    await sequelize.sync({
      // alter: true,
      /* force: true, */
    });
  } catch (error) {
    console.error("No se pudo conectar la BD: ", error);
  }
};
