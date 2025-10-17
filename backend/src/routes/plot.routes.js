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

router.get("/plot", authMiddleware, adminMiddleware, getAllPlots);
router.get(
  "/plot/:id",
  authMiddleware,
  adminMiddleware,
  getPlotByIdValidation,
  validator,
  getPlotById
);
router.post("/plot", createPlotValidation, validator, createPlot);
router.put("/plot/:id", updatePlotValidation, validator, updatePlot);
router.delete("/plot/:id", deletePlotValidation, validator, deletePlot);

export default router;
