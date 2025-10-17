import { Router } from "express";
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import {
  getProfileByIdValidation,
  createProfileValidation,
  updateProfileValidation,
  deleteProfileValidation,
} from "../middlewares/validations/profile.validations.js";
import { validator } from "../middlewares/validator.js";

export const router = Router();

router.get("/profile", authMiddleware, adminMiddleware, getAllProfiles);
router.get(
  "/profile/:id",
  authMiddleware,
  adminMiddleware,
  getProfileByIdValidation,
  validator,
  getProfileById
);
router.post(
  "/profile",
  authMiddleware,
  createProfileValidation,
  validator,
  createProfile
);
router.put(
  "/profile/:id",
  authMiddleware,
  updateProfileValidation,
  validator,
  updateProfile
);
router.delete(
  "/profile/:id",
  authMiddleware,
  deleteProfileValidation,
  validator,
  deleteProfile
);

export default router;
