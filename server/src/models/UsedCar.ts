import mongoose, { Document, Schema } from 'mongoose';
import { FuelType, TransmissionType, UsedCarStatus } from '../types/index.js';

export interface IUsedCar extends Document {
  stockId: string; // e.g. "UC-1182"
  modelName: string;
  variantName: string;
  bodyType: string;
  manufacturingYear: number;
  kilometres: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  ownershipCount: number; // e.g. 1st Owner
  askingPrice: number;
  registrationNumber: string; // Unmasked for internal admin
  maskedRegistration: string; // "UP32AB****" for public display
  city: string;
  showroomId?: mongoose.Types.ObjectId;
  images: string[];
  status: UsedCarStatus;
  certifiedByDealership: boolean;
  inspectionReportId?: mongoose.Types.ObjectId;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UsedCarSchema = new Schema<IUsedCar>(
  {
    stockId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    modelName: { type: String, required: true, trim: true, index: true },
    variantName: { type: String, required: true, trim: true },
    bodyType: { type: String, default: 'Sedan', index: true },
    manufacturingYear: { type: Number, required: true, min: 2000, max: 2030, index: true },
    kilometres: { type: Number, required: true, min: 0, index: true },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'], required: true, index: true },
    transmission: { type: String, enum: ['Manual', 'Automatic', 'CVT', 'DCT'], required: true, index: true },
    ownershipCount: { type: Number, required: true, default: 1, min: 1 },
    askingPrice: { type: Number, required: true, min: 0, index: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true },
    maskedRegistration: { type: String, required: true, uppercase: true, trim: true },
    city: { type: String, default: 'Lucknow', index: true },
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom' },
    images: [{ type: String }],
    status: { type: String, enum: ['Available', 'Booked', 'Sold'], default: 'Available', index: true },
    certifiedByDealership: { type: Boolean, default: true, index: true },
    inspectionReportId: { type: Schema.Types.ObjectId, ref: 'InspectionReport' },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export const UsedCar = mongoose.model<IUsedCar>('UsedCar', UsedCarSchema);

