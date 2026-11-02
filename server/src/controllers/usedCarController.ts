import { Request, Response, NextFunction } from 'express';
import { UsedCar } from '../models/UsedCar.js';
import { InspectionReport } from '../models/InspectionReport.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AuditLog } from '../models/AuditLog.js';

export const getUsedCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxKm,
      ownershipCount,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { variantName: { $regex: search, $options: 'i' } },
        { stockId: { $regex: search, $options: 'i' } },
      ];
    }

    if (fuelType && fuelType !== 'all') query.fuelType = fuelType;
    if (transmission && transmission !== 'all') query.transmission = transmission;
    if (ownershipCount && ownershipCount !== 'all') query.ownershipCount = Number(ownershipCount);

    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = Number(minPrice);
      if (maxPrice) query.askingPrice.$lte = Number(maxPrice);
    }

    if (minYear || maxYear) {
      query.manufacturingYear = {};
      if (minYear) query.manufacturingYear.$gte = Number(minYear);
      if (maxYear) query.manufacturingYear.$lte = Number(maxYear);
    }

    if (maxKm) {
      query.kilometres = { $lte: Number(maxKm) };
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { askingPrice: 1 };
    if (sortBy === 'price_desc') sortOption = { askingPrice: -1 };
    if (sortBy === 'km_asc') sortOption = { kilometres: 1 };
    if (sortBy === 'year_desc') sortOption = { manufacturingYear: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [usedCars, total] = await Promise.all([
      UsedCar.find(query)
        .select('-registrationNumber') // Omit raw registration number publicly
        .populate('inspectionReportId')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      UsedCar.countDocuments(query),
    ]);

    res.json({
      success: true,
      usedCars,
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

export const getUsedCarByStockId = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawStock = req.params.stockId;
    const stockId = (Array.isArray(rawStock) ? rawStock[0] : rawStock).toUpperCase();
    const usedCar = await UsedCar.findOne({ stockId })
      .populate('showroomId', 'name address phone')
      .populate('inspectionReportId');

    if (!usedCar) {
      throw new AppError(`Certified used vehicle ${stockId} not found.`, 404);
    }

    // If not admin, hide raw unmasked registration number
    const result = usedCar.toObject();
    if (!req.user || req.user.role !== 'ADMIN') {
      delete (result as any).registrationNumber;
    }

    res.json({
      success: true,
      usedCar: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createUsedCar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawReg = (req.body.registrationNumber || 'UP32AB1234').toUpperCase();
    const masked = rawReg.length > 4 ? `${rawReg.slice(0, 6)}****` : 'UP32AB****';

    const usedCar = new UsedCar({
      ...req.body,
      stockId: req.body.stockId.toUpperCase(),
      registrationNumber: rawReg,
      maskedRegistration: masked,
    });

    await usedCar.save();

    // If inspection report data provided in payload, create and link it
    if (req.body.inspection) {
      const inspection = new InspectionReport({
        ...req.body.inspection,
        usedCarStockId: usedCar.stockId,
      });
      await inspection.save();
      usedCar.inspectionReportId = inspection._id as any;
      await usedCar.save();
    }

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_USED_CAR',
      entityType: 'USED_CAR',
      entityId: usedCar.stockId,
      newValues: req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Used car listed successfully',
      usedCar,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUsedCar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawStock = req.params.stockId;
    const stockId = (Array.isArray(rawStock) ? rawStock[0] : rawStock).toUpperCase();
    const car = await UsedCar.findOne({ stockId });
    if (!car) throw new AppError('Used car not found', 404);

    if (req.body.registrationNumber) {
      const rawReg = req.body.registrationNumber.toUpperCase();
      req.body.registrationNumber = rawReg;
      req.body.maskedRegistration = rawReg.length > 4 ? `${rawReg.slice(0, 6)}****` : 'UP32AB****';
    }

    const updated = await UsedCar.findOneAndUpdate(
      { stockId },
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Used car updated successfully',
      usedCar: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInspectionReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawStock = req.params.stockId;
    const stockId = (Array.isArray(rawStock) ? rawStock[0] : rawStock).toUpperCase();
    const car = await UsedCar.findOne({ stockId });
    if (!car) throw new AppError('Used car not found', 404);

    let inspection: any;
    if (car.inspectionReportId) {
      inspection = await InspectionReport.findByIdAndUpdate(car.inspectionReportId, req.body, { new: true });
    } else {
      inspection = new InspectionReport({
        ...req.body,
        usedCarStockId: car.stockId,
      });
      await inspection.save();
      car.inspectionReportId = inspection._id;
      await car.save();
    }

    res.json({
      success: true,
      message: 'Inspection report updated successfully',
      inspection,
    });
  } catch (error) {
    next(error);
  }
};
