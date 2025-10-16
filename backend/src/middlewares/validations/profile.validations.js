import { body, param } from "express-validator";
import { ProfileModel } from "../../models/profile.model.js";
import { UserModel } from "../../models/user.model.js";

// Obtener por id
export const getProfileByIdValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const profile = await ProfileModel.findByPk(value);
      if (!profile || profile.deleted) {
        throw new Error("No se encontró el perfil");
      }
    }),
];

// Crear
export const createProfileValidation = [
  body("first_name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("last_name")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),
  body("user_id")
    .notEmpty()
    .withMessage("El user_id es obligatorio")
    .isInt()
    .withMessage("El user_id debe ser un número entero")
    .custom(async (value) => {
      const user = await UserModel.findByPk(value);
      if (!user || user.deleted) {
        throw new Error("No se encontró el usuario asociado");
      }
      const existingProfile = await ProfileModel.findOne({
        where: { user_id: value, deleted: false },
      });
      if (existingProfile) {
        throw new Error("El usuario ya tiene un perfil");
      }
    }),
];

// Actualizar
export const updateProfileValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const profile = await ProfileModel.findByPk(value);
      if (!profile || profile.deleted) {
        throw new Error("No se encontró el perfil");
      }
    }),
  body("first_name")
    .optional()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("last_name")
    .optional()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),
];

// Eliminar
export const deleteProfileValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const profile = await ProfileModel.findByPk(value);
      if (!profile || profile.deleted) {
        throw new Error("No se encontró el perfil");
      }
    }),
];
