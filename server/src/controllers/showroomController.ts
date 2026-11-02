import { Request, Response, NextFunction } from 'express';
import { Showroom } from '../models/Showroom.js';
import { Workshop } from '../models/Workshop.js';
import { DemoVehicle } from '../models/DemoVehicle.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getShowrooms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const showrooms = await Showroom.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      showrooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getDemoVehiclesByShowroom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { showroomId } = req.params;
    const { carModelId } = req.query;

    const query: any = { showroomId, isActive: true };
    if (carModelId) {
      query.carModelId = carModelId;
    }

    const demoVehicles = await DemoVehicle.find(query)
      .populate('carModelId', 'name heroImage bodyType')
      .populate('carVariantId', 'name fuelType transmission exShowroomPrice');

    res.json({
      success: true,
      demoVehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkshops = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workshops = await Workshop.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      workshops,
    });
  } catch (error) {
    next(error);
  }
};

export const createShowroom = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const showroom = new Showroom(req.body);
    await showroom.save();

    res.status(201).json({
      success: true,
      message: 'Showroom registered successfully',
      showroom,
    });
  } catch (error) {
    next(error);
  }
};

export const createDemoVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const demo = new DemoVehicle(req.body);
    await demo.save();

    res.status(201).json({
      success: true,
      message: 'Demo vehicle registered successfully',
      demoVehicle: demo,
    });
  } catch (error) {
    next(error);
  }
};

