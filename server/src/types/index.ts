import { Request } from 'express';

export type UserRole = 'BUYER' | 'SALES_CONSULTANT' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  assignedShowroom?: string;
  supportedModels?: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'CNG';
export type TransmissionType = 'Manual' | 'Automatic' | 'CVT' | 'DCT';
export type UsedCarStatus = 'Available' | 'Booked' | 'Sold';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type LeadStatus = 'NEW' | 'ASSIGNED' | 'CONTACTED' | 'QUALIFIED' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST';
export type LeadSource = 'Website' | 'Used-car enquiry' | 'Test-drive request' | 'Portal CSV import' | 'Walk-in';

export interface PricingBreakdown {
  cityId: string;
  cityName: string;
  carVariantId: string;
  variantName: string;
  modelName: string;
  exShowroomPrice: number;
  roadTaxRatePercent: number;
  roadTaxAmount: number;
  insuranceAmount: number;
  accessoriesAmount: number;
  registrationCharges: number;
  otherCharges: number;
  totalOnRoadPrice: number;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  disclaimer: string;
  lastUpdated: string;
}

export interface AIAnalysisResult {
  summary: string;
  budget: string | null;
  preferredModel: string | null;
  fuelPreference: string | null;
  transmission: string | null;
  purchaseTimeline: string | null;
  intent: 'High' | 'Medium' | 'Low' | 'Unknown';
  confidence: number;
  needsReview: boolean;
  provider: string;
}

export interface AIDraftReplyResult {
  draft: string;
  confidence: number;
  needsReview: boolean;
  provider: string;
  disclaimer: string;
}

export interface AIUsedCarPriceContext {
  modelName: string;
  manufacturingYear: number;
  kilometres: number;
  fuelType?: FuelType | string;
  transmission?: TransmissionType | string;
  ownershipCount?: number;
  conditionScore?: number; // 0-100 from inspection
  historicalSales?: Array<{
    price: number;
    year: number;
    kilometres: number;
  }>;
}

export interface AIUsedCarPriceResult {
  suggestedMinPrice: number;
  suggestedIdealPrice: number;
  suggestedMaxPrice: number;
  confidence: number;
  marketDemandIndex: 'High' | 'Moderate' | 'Soft';
  historicalDataPoints: number;
  rationale: string;
  provider: string;
  disclaimer: string;
}

