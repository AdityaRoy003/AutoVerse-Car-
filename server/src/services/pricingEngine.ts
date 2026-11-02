import mongoose from 'mongoose';
import { Pricing, IPricing } from '../models/Pricing.js';
import { CarVariant } from '../models/CarVariant.js';
import { City } from '../models/City.js';
import { PricingBreakdown } from '../types/index.js';

export interface OnRoadPriceResult {
  available: boolean;
  message?: string;
  data?: PricingBreakdown;
}

export class PricingEngine {
  /**
   * Calculates the exact city-wise on-road price from admin-managed pricing records.
   * NEVER generates prices through AI or hardcoded frontend logic.
   */
  static async calculateOnRoadPrice(
    variantId: string | mongoose.Types.ObjectId,
    cityId: string | mongoose.Types.ObjectId,
    currentDate: Date = new Date()
  ): Promise<OnRoadPriceResult> {
    if (!mongoose.Types.ObjectId.isValid(variantId) || !mongoose.Types.ObjectId.isValid(cityId)) {
      return {
        available: false,
        message: 'Invalid variant or city identifier provided.',
      };
    }

    const [variant, city] = await Promise.all([
      CarVariant.findById(variantId).populate<{ carModelId: { name: string } }>('carModelId', 'name'),
      City.findById(cityId),
    ]);

    if (!variant) {
      return {
        available: false,
        message: 'Car variant not found in dealership catalog.',
      };
    }

    if (!city || !city.active) {
      return {
        available: false,
        message: 'City pricing region is inactive or not serviced.',
      };
    }

    // Retrieve active pricing rule
    const pricingRecord = await Pricing.findOne({
      carVariantId: variant._id,
      cityId: city._id,
      isActive: true,
    }).sort({ validUntil: -1 });

    if (!pricingRecord) {
      return {
        available: false,
        message: 'Price currently unavailable. Contact dealership for the latest quotation.',
      };
    }

    // Check validity dates
    const validFrom = new Date(pricingRecord.validFrom);
    const validUntil = new Date(pricingRecord.validUntil);

    if (currentDate < validFrom || currentDate > validUntil) {
      return {
        available: false,
        message: 'Price currently unavailable (Pricing table has expired or is not yet effective). Contact dealership for the latest quotation.',
      };
    }

    // Official Formula:
    // Road Tax = (ExShowroom * roadTaxRatePercent / 100) + roadTaxFixed
    const exShowroom = pricingRecord.exShowroomPrice;
    const roadTax = Math.round((exShowroom * pricingRecord.roadTaxRatePercent) / 100 + (pricingRecord.roadTaxFixed || 0));
    const insurance = pricingRecord.insuranceAmount;
    const accessories = pricingRecord.accessoriesAmount || 0;
    const registration = pricingRecord.registrationCharges || 0;
    const otherCharges = pricingRecord.otherCharges || 0;

    const totalOnRoadPrice = exShowroom + roadTax + insurance + accessories + registration + otherCharges;

    const modelName = typeof variant.carModelId === 'object' && variant.carModelId !== null
      ? (variant.carModelId as any).name
      : 'Autoverse Model';

    return {
      available: true,
      data: {
        cityId: city._id.toString(),
        cityName: city.name,
        carVariantId: variant._id.toString(),
        variantName: variant.name,
        modelName,
        exShowroomPrice: exShowroom,
        roadTaxRatePercent: pricingRecord.roadTaxRatePercent,
        roadTaxAmount: roadTax,
        insuranceAmount: insurance,
        accessoriesAmount: accessories,
        registrationCharges: registration,
        otherCharges,
        totalOnRoadPrice,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        isExpired: false,
        disclaimer: 'Prices are indicative and subject to change. Please confirm the final quotation with the dealership.',
        lastUpdated: (pricingRecord.updatedAt || pricingRecord.createdAt || new Date()).toISOString(),
      },
    };
  }

  /**
   * Standard Equated Monthly Instalment (EMI) Formula:
   * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
   */
  static calculateEMI(
    principal: number,
    annualInterestRatePercent: number,
    tenureMonths: number
  ) {
    if (principal <= 0 || annualInterestRatePercent <= 0 || tenureMonths <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalRepayment: 0,
        principal: 0,
      };
    }

    const r = annualInterestRatePercent / 12 / 100;
    const n = tenureMonths;
    const factor = Math.pow(1 + r, n);
    const monthlyEmi = Math.round((principal * r * factor) / (factor - 1));
    const totalRepayment = monthlyEmi * n;
    const totalInterest = totalRepayment - principal;

    return {
      monthlyEmi,
      totalInterest,
      totalRepayment,
      principal,
    };
  }
}

