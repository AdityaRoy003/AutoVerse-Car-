import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiProvider.js';
import { UsedCar } from '../models/UsedCar.js';
import { AppError } from '../middleware/errorHandler.js';

export const summariseLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName, message, interestedModelName, budgetRange, preferredShowroomName } = req.body;
    if (!customerName) {
      throw new AppError('customerName is required for AI lead intelligence analysis.', 400);
    }

    const aiProvider = AIService.getProvider();
    const result = await aiProvider.summariseLead({
      customerName,
      message,
      interestedModelName,
      budgetRange,
      preferredShowroomName,
    });

    res.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    next(error);
  }
};

export const draftReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName, message, interestedModelName, preferredShowroomName, consultantName } = req.body;
    if (!customerName) {
      throw new AppError('customerName is required to compose personalized draft response.', 400);
    }

    const aiProvider = AIService.getProvider();
    const result = await aiProvider.draftReply(
      {
        customerName,
        message,
        interestedModelName,
        preferredShowroomName,
      },
      consultantName || 'Autoverse Consultant'
    );

    res.json({
      success: true,
      reply: result,
    });
  } catch (error) {
    next(error);
  }
};

export const suggestUsedCarPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { modelName, manufacturingYear, kilometres, fuelType, transmission, ownershipCount, conditionScore } = req.body;
    if (!modelName || !manufacturingYear || kilometres === undefined) {
      throw new AppError('modelName, manufacturingYear, and kilometres are required for price suggestion.', 400);
    }

    // Query comparable records from certified UsedCar inventory & transactions
    const comps = await UsedCar.find({
      modelName: { $regex: new RegExp(modelName.trim(), 'i') },
    })
      .select('askingPrice manufacturingYear kilometres status')
      .limit(10);

    const historicalSales = comps.map((c) => ({
      price: c.askingPrice,
      year: c.manufacturingYear,
      kilometres: c.kilometres,
    }));

    const aiProvider = AIService.getProvider();
    const priceBand = await aiProvider.suggestUsedCarPrice({
      modelName,
      manufacturingYear: Number(manufacturingYear),
      kilometres: Number(kilometres),
      fuelType,
      transmission,
      ownershipCount: ownershipCount ? Number(ownershipCount) : 1,
      conditionScore: conditionScore ? Number(conditionScore) : undefined,
      historicalSales,
    });

    res.json({
      success: true,
      priceBand,
    });
  } catch (error) {
    next(error);
  }
};

