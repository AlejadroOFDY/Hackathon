import { PlotModel } from "../models/plot.model.js";
import { UserModel } from "../models/user.model.js";

// Get all plots
export const getAllPlots = async (req, res) => {
  try {
    const plots = await PlotModel.findAll({
      where: { deleted: false },
      include: [
        {
          model: UserModel,
          as: "owner",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    return res.status(200).json(plots);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not fetch plots" });
  }
};

// Get plot by id
export const getPlotById = async (req, res) => {
  try {
    const plot = await PlotModel.findOne({
      where: { id: req.params.id, deleted: false },
      include: [
        {
          model: UserModel,
          as: "owner",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    if (!plot) return res.status(404).json({ message: "Plot not found" });
    return res.status(200).json(plot);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not fetch plot" });
  }
};

// Create plot
export const createPlot = async (req, res) => {
  try {
    const newPlot = await PlotModel.create(req.body);
    return res.status(201).json(newPlot);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not create plot" });
  }
};

// Update plot
export const updatePlot = async (req, res) => {
  try {
    const plot = await PlotModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    if (!plot) return res.status(404).json({ message: "Plot not found" });
    await plot.update(req.body);
    return res.status(200).json(plot);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not update plot" });
  }
};

// Logical delete plot
export const deletePlot = async (req, res) => {
  try {
    const plot = await PlotModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    if (!plot) return res.status(404).json({ message: "Plot not found" });
    await plot.update({ deleted: true });
    return res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not delete plot" });
  }
};
