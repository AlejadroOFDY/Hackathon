import { body, param } from "express-validator";
import { UserModel } from "../../models/user.model.js";
import { Op } from "sequelize";

// Obtener por id
export const getUserByIdValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const user = await UserModel.findByPk(value);
      if (!user || user.deleted) {
        throw new Error("No se encontró al usuario");
      }
    }),
];

// Crear
export const createUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El nombre de usuario debe contener entre 3 y 20 caracteres")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({
        where: { username: value },
      });
      if (existingUser) {
        throw new Error("El nombre de usuario ya está en uso");
      }
    }),
  body("email")
    .notEmpty()
    .withMessage("El email es un campo obligatorio")
    .isEmail()
    .withMessage("El email debe ser uno válido")
    .isLength({ max: 100 })
    .withMessage("El email solo puede tener una longitud de 100 caracteres")
    .custom(async (value) => {
      const existingEmail = await UserModel.findOne({
        where: { email: value },
      });
      if (existingEmail) {
        throw new Error("El email ya se encuentra registrado");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es un campo obligatorio")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("role")
    .optional()
    .notEmpty()
    .withMessage("El rol no puede estar vacío")
    .isIn(["user", "admin"])
    .withMessage("los roles solo pueden ser user o admin"),
  body("establishmentLocation")
    .optional()
    .isLength({ max: 255 })
    .withMessage("La localización no puede superar los 255 caracteres"),
  body("establishmentCoordinates")
    .optional()
    .isString()
    .withMessage("Las coordenadas deben ser un string"),
];

// Actualizar
export const updateUserValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingUser = await UserModel.findByPk(value);
      if (!existingUser) {
        throw new Error("No se encontró al usuario");
      }
    }),
  body("username")
    .optional()
    .notEmpty()
    .withMessage("El nombre de usuario es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El nombre de usuario debe contener entre 3 y 20 caracteres")
    .custom(async (value, { req }) => {
      const existingUser = await UserModel.findOne({
        where: { username: value, id: { [Op.ne]: req.params.id } },
      });
      if (existingUser) {
        throw new Error("El nombre de usuario ya está en uso");
      }
    }),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("El email es un campo obligatorio")
    .isEmail()
    .withMessage("El email debe ser uno válido")
    .isLength({ max: 100 })
    .withMessage("El email solo puede tener una longitud de 100 caracteres")
    .custom(async (value, { req }) => {
      const existingEmail = await UserModel.findOne({
        where: { email: value, id: { [Op.ne]: req.params.id } },
      });
      if (existingEmail) {
        throw new Error("El email ya se encuentra registrado");
      }
    }),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("La contraseña es un campo obligatorio")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("role")
    .optional()
    .notEmpty()
    .withMessage("El rol no puede estar vacío")
    .isIn(["user", "admin"])
    .withMessage("los roles solo pueden ser user o admin"),
  body("establishmentLocation")
    .optional()
    .isLength({ max: 255 })
    .withMessage("La localización no puede superar los 255 caracteres"),
  body("establishmentCoordinates")
    .optional()
    .isString()
    .withMessage("Las coordenadas deben ser un string"),
];

// Eliminar
export const deleteUserValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingUser = await UserModel.findByPk(value);
      if (!existingUser) {
        throw new Error("No se encontró al usuario");
      }
    }),
];
