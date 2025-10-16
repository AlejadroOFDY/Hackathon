import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { UserModel } from "./user.model.js";

export const PlotModel = sequelize.define(
  "Plot",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255), // Address or coordinates
      allowNull: false,
    },
    cropType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lotCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "white", // sin sembrar
        "violet", // sembrado
        "blue", // en crecimiento
        "yellow", // falta madurar
        "green", // listo para cosechar
        "gray", // cosechado
        "red" // dañado
      ),
      allowNull: false,
      defaultValue: "white",
    },
    sowingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expectedHarvestDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    actualHarvestDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    damageDescription: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pests: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { paranoid: true }
);

PlotModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "owner",
  onDelete: "CASCADE",
});

UserModel.hasMany(PlotModel, {
  foreignKey: "user_id",
  as: "plots",
  onDelete: "CASCADE",
});
