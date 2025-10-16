import { Router } from "express";
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

// import { validator } from "../middlewares/validator.js";

export const router = Router();

router.get("/", authMiddleware, getAllProfiles);
router.get("/:id", authMiddleware, getProfileById);
router.post("/", authMiddleware, createProfile);
router.put("/:id", authMiddleware, updateProfile);
router.delete("/:id", authMiddleware, deleteProfile);

export default router;
