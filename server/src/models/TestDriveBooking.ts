import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus } from '../types/index.js';

export interface ITestDriveBooking extends Document {
  bookingReference: string;
  buyerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  carModelId: mongoose.Types.ObjectId;
  carVariantId: mongoose.Types.ObjectId;
  showroomId: mongoose.Types.ObjectId;
  demoVehicleId: mongoose.Types.ObjectId;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  status: BookingStatus;
  consentGiven: boolean;
  consentTimestamp: Date;
  policyVersion: string;
  pricingSnapshot?: {
    exShowroomPrice: number;
    onRoadPrice: number;
    cityId?: mongoose.Types.ObjectId;
    cityName?: string;
    calculatedAt: Date;
  };
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestDriveBookingSchema = new Schema<ITestDriveBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    carModelId: { type: Schema.Types.ObjectId, ref: 'CarModel', required: true, index: true },
    carVariantId: { type: Schema.Types.ObjectId, ref: 'CarVariant', required: true },
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    demoVehicleId: { type: Schema.Types.ObjectId, ref: 'DemoVehicle', required: true, index: true },
    bookingDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    consentGiven: { type: Boolean, required: true, default: true },
    consentTimestamp: { type: Date, default: Date.now },
    policyVersion: { type: String, default: '1.0' },
    pricingSnapshot: {
      exShowroomPrice: { type: Number },
      onRoadPrice: { type: Number },
      cityId: { type: Schema.Types.ObjectId, ref: 'City' },
      cityName: { type: String },
      calculatedAt: { type: Date, default: Date.now },
    },
    notes: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to ensure that for a given demo vehicle, date, and slot, only 1 active booking exists
TestDriveBookingSchema.index(
  { demoVehicleId: 1, bookingDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } },
  }
);

export const TestDriveBooking = mongoose.model<ITestDriveBooking>('TestDriveBooking', TestDriveBookingSchema);

