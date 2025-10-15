import { ProfileModel } from "../models/profile.model.js";
import { UserModel } from "../models/user.model.js";

// Obtener todo
export const getAllProfiles = async (req, res) => {
  try {
    const profile = await ProfileModel.findAll({
      include: [{ model: UserModel, as: "user" }],
    });
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudieron obtener los perfiles",
    });
  }
};

// Obtener por id
export const getProfileById = async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      where: { id: req.params.id },
      include: [{ model: UserModel, as: "user" }],
    });
    return res.status(200).json(profile);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo obtener el perfil" });
  }
};

// Crear
export const createProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      biography,
      avatar_url,
      birth_date,
      user_id,
    } = req.body;
    const newProfile = await ProfileModel.create({
      first_name,
      last_name,
      biography,
      avatar_url,
      birth_date,
      user_id,
    });
    return res.status(201).json(newProfile);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo crear el perfil" });
  }
};

// Modificar
export const updateProfile = async (req, res) => {
  try {
    const profile = await ProfileModel.findByPk(req.params.id);
    const { first_name, last_name, biography, avatar_url, birth_date } =
      req.body;
    await profile.update({
      first_name: first_name || profile.first_name,
      last_name: last_name || profile.last_name,
      biography: biography || profile.biography,
      avatar_url: avatar_url || profile.avatar_url,
      birth_date: birth_date || profile.birth_date,
    });
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo actualizar el perfil",
    });
  }
};

// Eliminar
export const deleteProfile = async (req, res) => {
  try {
    const profile = await ProfileModel.findByPk(req.params.id);
    await profile.destroy();
    return res.status(200).json("El perfil se eliminó exitosamente");
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "No se pudo eliminar el perfil" });
  }
};
