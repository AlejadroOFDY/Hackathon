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
      type: DataTypes.GEOMETRY,
      allowNull: false,
      // Accepts Point, Polygon, MultiPolygon
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
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("blue", "yellow", "green", "red", "black"),
      allowNull: false,
      defaultValue: "blue",
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
  foreignKey: "ownerId",
  as: "owner",
  onDelete: "CASCADE",
});
