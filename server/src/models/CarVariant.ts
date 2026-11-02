import mongoose, { Document, Schema } from 'mongoose';
import { FuelType, TransmissionType } from '../types/index.js';

export interface ICarVariant extends Document {
  carModelId: mongoose.Types.ObjectId;
  name: string;
  code: string; // e.g. "NEW-H-02"
  fuelType: FuelType;
  transmission: TransmissionType;
  exShowroomPrice: number;
  keyFeatures: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarVariantSchema = new Schema<ICarVariant>(
  {
    carModelId: { type: Schema.Types.ObjectId, ref: 'CarModel', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'], required: true, index: true },
    transmission: { type: String, enum: ['Manual', 'Automatic', 'CVT', 'DCT'], required: true, index: true },
    exShowroomPrice: { type: Number, required: true, min: 0 },
    keyFeatures: [{ type: String }],
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CarVariantSchema.index({ carModelId: 1, fuelType: 1, transmission: 1 });

export const CarVariant = mongoose.model<ICarVariant>('CarVariant', CarVariantSchema);

