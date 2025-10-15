import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

// import { createUserValidation } from "../middlewares/validations/user.validation.js";
// import {
//   createProfileValidation,
//   updateProfileValidation,
// } from "../middlewares/validations/profile.validation.js";
// import { validator } from "../middlewares/validator.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
