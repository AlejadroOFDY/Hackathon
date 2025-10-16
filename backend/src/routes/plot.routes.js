import { Router } from "express";
import {
  getAllPlots,
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

// Public endpoints for map consumption
router.get("/", getAllPlots);
router.get("/:id", getPlotByIdValidation, validator, getPlotById);
router.post("/", createPlotValidation, validator, createPlot);
router.put("/:id", updatePlotValidation, validator, updatePlot);
router.delete("/:id", deletePlotValidation, validator, deletePlot);

export default router;
