import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CarModel } from '../models/CarModel.js';
import { CarVariant } from '../models/CarVariant.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      fuelType,
      transmission,
      bodyType,
      minPrice,
      maxPrice,
      sortBy = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
      ];
    }

    if (bodyType && bodyType !== 'all') {
      query.bodyType = bodyType;
    }

    if (fuelType && fuelType !== 'all') {
      query['specifications.fuelTypes'] = fuelType;
    }

    if (transmission && transmission !== 'all') {
      query['specifications.transmissions'] = transmission;
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    let sortOption: any = { featured: -1, createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { startingPrice: 1 };
    if (sortBy === 'price_desc') sortOption = { startingPrice: -1 };
    if (sortBy === 'name_asc') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [models, total] = await Promise.all([
      CarModel.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      CarModel.countDocuments(query),
    ]);

    // Attach variant count to each model
    const modelIds = models.map((m) => m._id);
    const variants = await CarVariant.find({ carModelId: { $in: modelIds }, isAvailable: true });

    const modelsWithVariants = models.map((m) => {
      const modelVariants = variants.filter((v) => v.carModelId.toString() === m._id.toString());
      return {
        ...m.toObject(),
        variantCount: modelVariants.length,
        variants: modelVariants,
      };
    });

    res.json({
      success: true,
      cars: modelsWithVariants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarBySlugOrId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawParam = req.params.slugOrId;
    const slugOrId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    let query: any = { active: true };

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      query = { _id: slugOrId };
    } else {
      query = { slug: slugOrId.toLowerCase() };
    }

    const model = await CarModel.findOne(query);
    if (!model) {
      throw new AppError('Vehicle model not found in dealership catalog.', 404);
    }

    const variants = await CarVariant.find({ carModelId: model._id, isAvailable: true }).sort({ exShowroomPrice: 1 });

    res.json({
      success: true,
      car: {
        ...model.toObject(),
        variants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCarModel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newModel = new CarModel(req.body);
    await newModel.save();

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_CAR_MODEL',
      entityType: 'CAR_MODEL',
      entityId: newModel._id.toString(),
      newValues: req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle model created successfully',
      car: newModel,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCarModel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const oldModel = await CarModel.findById(id);
    if (!oldModel) throw new AppError('Vehicle model not found.', 404);

    const updated = await CarModel.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE_CAR_MODEL',
      entityType: 'CAR_MODEL',
      entityId: id,
      oldValues: oldModel.toObject(),
      newValues: req.body,
    });

    res.json({
      success: true,
      message: 'Vehicle model updated successfully',
      car: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCarModel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await CarModel.findByIdAndUpdate(id, { active: false });

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'ARCHIVE_CAR_MODEL',
      entityType: 'CAR_MODEL',
      entityId: id,
    });

    res.json({
      success: true,
      message: 'Vehicle model archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const addVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const model = await CarModel.findById(id);
    if (!model) throw new AppError('Car model not found', 404);

    const variant = new CarVariant({
      ...req.body,
      carModelId: model._id,
    });
    await variant.save();

    res.status(201).json({
      success: true,
      message: 'Variant created successfully',
      variant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { variantId } = req.params;
    const updated = await CarVariant.findByIdAndUpdate(variantId, req.body, { new: true });
    if (!updated) throw new AppError('Variant not found', 404);

    res.json({
      success: true,
      message: 'Variant updated successfully',
      variant: updated,
    });
  } catch (error) {
    next(error);
  }
};
