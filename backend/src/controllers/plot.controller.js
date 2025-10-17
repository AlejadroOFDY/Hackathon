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

// Get plots for authenticated user
export const getMyPlots = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const plots = await PlotModel.findAll({
      where: { user_id: userId, deleted: false },
    });
    return res.status(200).json(plots);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Could not fetch user plots' });
  }
};

// Create plot
export const createPlot = async (req, res) => {
  try {
    // Ensure the plot is always associated with the authenticated user
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      name,
      establishmentLocation,
      establishmentLat,
      establishmentLng,
      cropType,
      lotCost,
      area,
      status,
      sowingDate,
      expectedHarvestDate,
      actualHarvestDate,
      damageDescription,
      pests,
      humidity,
    } = req.body;

    const newPlot = await PlotModel.create({
      name,
      establishmentLocation,
      establishmentLat,
      establishmentLng,
      cropType,
      lotCost,
      area,
      user_id: userId,
      status,
      sowingDate,
      expectedHarvestDate,
      actualHarvestDate,
      damageDescription,
      pests,
      humidity,
    });
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
    // Only the owner or admin can update the plot
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    if (!requesterId) return res.status(401).json({ message: 'Unauthorized' });
    if (plot.user_id !== requesterId && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const {
      name,
      establishmentLocation,
      establishmentLat,
      establishmentLng,
      cropType,
      lotCost,
      area,
      // ignore user_id from client
      status,
      sowingDate,
      expectedHarvestDate,
      actualHarvestDate,
      damageDescription,
      pests,
      humidity,
    } = req.body;
    await plot.update({
      name: name || plot.name,
      establishmentLocation:
        establishmentLocation || plot.establishmentLocation,
      establishmentLat:
        establishmentLat !== undefined
          ? establishmentLat
          : plot.establishmentLat,
      establishmentLng:
        establishmentLng !== undefined
          ? establishmentLng
          : plot.establishmentLng,
      cropType: cropType || plot.cropType,
      lotCost: lotCost !== undefined ? lotCost : plot.lotCost,
      area: area || plot.area,
    // do not allow changing ownership through this endpoint
    user_id: plot.user_id,
    status: status || plot.status,
      sowingDate: sowingDate || plot.sowingDate,
      expectedHarvestDate: expectedHarvestDate || plot.expectedHarvestDate,
      actualHarvestDate: actualHarvestDate || plot.actualHarvestDate,
      damageDescription: damageDescription || plot.damageDescription,
      pests: pests || plot.pests,
      humidity: humidity !== undefined ? humidity : plot.humidity,
    });
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
    // Only the owner or admin can delete the plot
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    if (!requesterId) return res.status(401).json({ message: 'Unauthorized' });
    if (plot.user_id !== requesterId && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await plot.update({ deleted: true });
    return res.status(200).json({ message: "Plot deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Could not delete plot" });
  }
};
