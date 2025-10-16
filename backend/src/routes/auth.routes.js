import { Router } from "express";
import {
  register,
  login,
  logout,
  myProfile,
  myPlots,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

router.get("/my-profile", authMiddleware, myProfile);
router.get("/my-plots", authMiddleware, myPlots);

export default router;
