import mongoose, { Document, Schema } from 'mongoose';

export type ServiceBookingStatus = 'CONFIRMED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';

export interface IServiceBooking extends Document {
  bookingReference: string; // e.g. "AV-SB-202611-1024"
  workshopId: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleRegistrationNumber: string; // e.g. "UP32AB1234"
  vehicleModel: string;
  serviceType: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM - 11:00 AM"
  assignedBayNumber: number;
  pickupDropRequired: boolean;
  pickupAddress?: string;
  estimatedCost: number;
  serviceAdvisorName: string;
  status: ServiceBookingStatus;
  consentGiven: boolean;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBookingSchema = new Schema<IServiceBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true, index: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    vehicleRegistrationNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      required: true,
      default: 'Periodic Maintenance',
    },
    bookingDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true, index: true },
    assignedBayNumber: { type: Number, required: true, default: 1 },
    pickupDropRequired: { type: Boolean, default: false },
    pickupAddress: { type: String },
    estimatedCost: { type: Number, default: 4500 },
    serviceAdvisorName: { type: String, default: 'Vikash Saxena (Senior Service Advisor)' },
    status: {
      type: String,
      enum: ['CONFIRMED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    consentGiven: { type: Boolean, required: true, default: true },
    notes: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

ServiceBookingSchema.index({ workshopId: 1, bookingDate: 1, timeSlot: 1, assignedBayNumber: 1 });

export const ServiceBooking = mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema);

