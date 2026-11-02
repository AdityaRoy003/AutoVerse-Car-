import mongoose, { Document, Schema } from 'mongoose';
import { FuelType, TransmissionType } from '../types/index.js';

export interface IDemoVehicle extends Document {
  showroomId: mongoose.Types.ObjectId;
  carModelId: mongoose.Types.ObjectId;
  carVariantId: mongoose.Types.ObjectId;
  registrationNumber: string;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoVehicleSchema = new Schema<IDemoVehicle>(
  {
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    carModelId: { type: Schema.Types.ObjectId, ref: 'CarModel', required: true, index: true },
    carVariantId: { type: Schema.Types.ObjectId, ref: 'CarVariant', required: true, index: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true, unique: true },
    color: { type: String, default: 'Alpine White' },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'], required: true },
    transmission: { type: String, enum: ['Manual', 'Automatic', 'CVT', 'DCT'], required: true },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

DemoVehicleSchema.index({ showroomId: 1, carModelId: 1, isActive: 1 });

export const DemoVehicle = mongoose.model<IDemoVehicle>('DemoVehicle', DemoVehicleSchema);

