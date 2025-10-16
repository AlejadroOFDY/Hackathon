import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const UserModel = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.CHAR(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.CHAR(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    establishmentLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    establishmentLat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    establishmentLng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { paranoid: true }
);
