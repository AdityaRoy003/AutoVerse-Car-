import { Request, Response, NextFunction } from 'express';
import { PricingEngine } from '../services/pricingEngine.js';
import { City } from '../models/City.js';
import { Pricing } from '../models/Pricing.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AuditLog } from '../models/AuditLog.js';

export const getOnRoadPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawVariant = req.params.variantId;
    const variantId = Array.isArray(rawVariant) ? rawVariant[0] : rawVariant;
    let { cityId } = req.query;

    // Default to first active city (Lucknow) if not specified
    if (!cityId) {
      const defaultCity = await City.findOne({ name: 'Lucknow', active: true });
      if (defaultCity) {
        cityId = defaultCity._id.toString();
      }
    }

    if (!cityId) {
      res.status(400).json({
        success: false,
        message: 'City identifier is required to calculate regional on-road pricing.',
      });
      return;
    }

    const result = await PricingEngine.calculateOnRoadPrice(variantId, cityId as string);

    if (!result.available) {
      res.status(200).json({
        success: false,
        available: false,
        message: result.message || 'Price currently unavailable. Contact dealership for the latest quotation.',
      });
      return;
    }

    res.json({
      success: true,
      available: true,
      pricing: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cities = await City.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      cities,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateEMI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { principal, interestRate, tenureMonths } = req.body;
    if (!principal || !interestRate || !tenureMonths) {
      throw new AppError('Principal amount, annual interest rate, and tenure months are required.', 400);
    }

    const calculation = PricingEngine.calculateEMI(
      Number(principal),
      Number(interestRate),
      Number(tenureMonths)
    );

    res.json({
      success: true,
      calculation: {
        ...calculation,
        disclaimer: 'EMI calculation is indicative and subject to final financier underwriting and processing charges.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPricing = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pricing = await Pricing.find()
      .populate('carVariantId', 'name code exShowroomPrice carModelId')
      .populate('cityId', 'name state')
      .populate('lastModifiedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      pricing,
    });
  } catch (error) {
    next(error);
  }
};

export const createPricing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = new Pricing({
      ...req.body,
      createdBy: req.user?.id,
      lastModifiedBy: req.user?.id,
    });
    await record.save();

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_PRICING_RECORD',
      entityType: 'PRICING',
      entityId: record._id.toString(),
      newValues: req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Pricing record created successfully',
      pricing: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePricing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const old = await Pricing.findById(id);
    if (!old) throw new AppError('Pricing record not found', 404);

    const updated = await Pricing.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastModifiedBy: req.user?.id,
      },
      { new: true }
    );

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE_PRICING_RECORD',
      entityType: 'PRICING',
      entityId: id,
      oldValues: old.toObject(),
      newValues: req.body,
    });

    res.json({
      success: true,
      message: 'Pricing record updated successfully',
      pricing: updated,
    });
  } catch (error) {
    next(error);
  }
};
