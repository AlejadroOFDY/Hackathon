import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import {
  getUserByIdValidation,
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
} from "../middlewares/validations/user.validations.js";
import { validator } from "../middlewares/validator.js";

export const router = Router();

router.get("/user", authMiddleware, adminMiddleware, getAllUsers);
router.get(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  getUserByIdValidation,
  validator,
  getUserById
);
router.post("/user", createUserValidation, validator, createUser);
router.put(
  "/user/:id",
  authMiddleware,
  updateUserValidation,
  validator,
  updateUser
);
router.delete(
  "/user/:id",
  authMiddleware,
  deleteUserValidation,
  validator,
  deleteUser
);

export default router;
