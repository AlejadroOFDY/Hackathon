import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";

// Obtener todo
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      where: { deleted: false },
      include: [
        {
          model: ProfileModel,
          as: "profile",
          attributes: ["first_name", "last_name", "user_id"],
        },
      ],
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudieron obtener los usuarios",
    });
  }
};

// Obtener por id
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      where: { id: req.params.id, deleted: false },
      include: [
        {
          model: ProfileModel,
          as: "profile",
          attributes: ["first_name", "last_name", "user_id"],
        },
      ],
    });
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo obtener el usuario" });
  }
};

// Crear
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    return res.status(201).json(newUser);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo crear el usuario" });
  }
};

// Modificar
export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    const { username, email, password, role } = req.body;
    await user.update({
      username: username || user.username,
      email: email || user.email,
      password: hashPassword(password) || user.password,
      role: role || user.role,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo actualizar el usuario",
    });
  }
};

// Eliminar
export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    const profile = await ProfileModel.findOne({
      where: { user_id: user.id },
    });
    await profile.update({ deleted: true });
    await user.update({ deleted: true });
    return res.status(200).json("Se eliminó el usuario exitosamente");
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo eliminar el usuario",
    });
  }
};
