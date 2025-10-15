import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { UserModel } from "./user.model.js";

export const ProfileModel = sequelize.define("Profile", {
  first_name: {
    type: DataTypes.CHAR(50),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.CHAR(50),
    allowNull: false,
  },
});

ProfileModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
});
UserModel.hasOne(ProfileModel, {
  foreignKey: "user_id",
  as: "profile",
  onDelete: "CASCADE",
});
