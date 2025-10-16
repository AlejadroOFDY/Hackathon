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

router.get("/", authMiddleware, adminMiddleware, getAllProfiles);
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getProfileByIdValidation,
  validator,
  getProfileById
);
router.post(
  "/",
  authMiddleware,
  createProfileValidation,
  validator,
  createProfile
);
router.put(
  "/:id",
  authMiddleware,
  updateProfileValidation,
  validator,
  updateProfile
);
router.delete(
  "/:id",
  authMiddleware,
  deleteProfileValidation,
  validator,
  deleteProfile
);

export default router;
