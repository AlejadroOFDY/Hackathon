import { body, param } from "express-validator";
import { PlotModel } from "../../models/plot.model.js";
import { UserModel } from "../../models/user.model.js";

export const getPlotByIdValidation = [
  param("id")
    .isInt()
    .withMessage("Id must be an integer")
    .custom(async (value) => {
      const plot = await PlotModel.findByPk(value);
      if (!plot || plot.deleted) {
        throw new Error("Plot not found");
      }
    }),
];

export const createPlotValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 }),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 255 }),
  body("cropType")
    .notEmpty()
    .withMessage("Crop type is required")
    .isLength({ max: 50 }),
  body("area")
    .notEmpty()
    .withMessage("Area is required")
    .isFloat({ min: 0.01 }),
  body("ownerId")
    .notEmpty()
    .withMessage("Owner is required")
    .isInt()
    .withMessage("Owner id must be an integer")
    .custom(async (value) => {
      const user = await UserModel.findByPk(value);
      if (!user || user.deleted) {
        throw new Error("Owner not found");
      }
    }),
  body("status")
    .optional()
    .isIn(["blue", "yellow", "green", "red", "black"])
    .withMessage("Invalid status value"),
  body("sowingDate")
    .notEmpty()
    .withMessage("Sowing date is required")
    .isISO8601(),
  body("expectedHarvestDate")
    .notEmpty()
    .withMessage("Expected harvest date is required")
    .isISO8601(),
  body("actualHarvestDate").optional().isISO8601(),
  body("lotCost").optional().isFloat({ min: 0 }),
  body("damageDescription").optional().isLength({ max: 255 }),
  body("pests").optional().isLength({ max: 255 }),
  body("humidity").optional().isFloat(),
];

export const updatePlotValidation = [
  param("id")
    .isInt()
    .withMessage("Id must be an integer")
    .custom(async (value) => {
      const plot = await PlotModel.findByPk(value);
      if (!plot || plot.deleted) {
        throw new Error("Plot not found");
      }
    }),
  body("name").optional().isLength({ max: 100 }),
  body("location").optional().isLength({ max: 255 }),
  body("cropType").optional().isLength({ max: 50 }),
  body("area").optional().isFloat({ min: 0.01 }),
  body("ownerId")
    .optional()
    .isInt()
    .withMessage("Owner id must be an integer")
    .custom(async (value) => {
      const user = await UserModel.findByPk(value);
      if (!user || user.deleted) {
        throw new Error("Owner not found");
      }
    }),
  body("status")
    .optional()
    .isIn(["blue", "yellow", "green", "red", "black"])
    .withMessage("Invalid status value"),
  body("sowingDate").optional().isISO8601(),
  body("expectedHarvestDate").optional().isISO8601(),
  body("actualHarvestDate").optional().isISO8601(),
  body("lotCost").optional().isFloat({ min: 0 }),
  body("damageDescription").optional().isLength({ max: 255 }),
  body("pests").optional().isLength({ max: 255 }),
  body("humidity").optional().isFloat(),
];

export const deletePlotValidation = [
  param("id")
    .isInt()
    .withMessage("Id must be an integer")
    .custom(async (value) => {
      const plot = await PlotModel.findByPk(value);
      if (!plot || plot.deleted) {
        throw new Error("Plot not found");
      }
    }),
];
