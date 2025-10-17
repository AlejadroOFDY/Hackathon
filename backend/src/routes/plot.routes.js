import { Router } from "express";
import {
  getAllPlots,
  getMyPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot,
} from "../controllers/plot.controller.js";
import {
  getPlotByIdValidation,
  createPlotValidation,
  updatePlotValidation,
  deletePlotValidation,
} from "../middlewares/validations/plot.validations.js";
import { validator } from "../middlewares/validator.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/me", authMiddleware, getMyPlots);
router.get("/", authMiddleware, adminMiddleware, getAllPlots);
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getPlotByIdValidation,
  validator,
  getPlotById
);
router.post("/", authMiddleware, createPlotValidation, validator, createPlot);
// Allow creation also via PUT / for clients that use PUT to create resources
router.put("/", authMiddleware, createPlotValidation, validator, createPlot);
router.put("/:id", authMiddleware, updatePlotValidation, validator, updatePlot);
router.delete("/:id", authMiddleware, deletePlotValidation, validator, deletePlot);

export default router;
