import mongoose, { Document, Schema } from 'mongoose';

export interface IPricing extends Document {
  carVariantId: mongoose.Types.ObjectId;
  cityId: mongoose.Types.ObjectId;
  exShowroomPrice: number;
  roadTaxRatePercent: number; // e.g. 10.5 for 10.5%
  roadTaxFixed: number; // Fixed surcharge if any, default 0
  insuranceAmount: number;
  accessoriesAmount: number;
  registrationCharges: number;
  otherCharges: number; // Fastag, hypothecation, green cess
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  auditNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    carVariantId: { type: Schema.Types.ObjectId, ref: 'CarVariant', required: true, index: true },
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    exShowroomPrice: { type: Number, required: true, min: 0 },
    roadTaxRatePercent: { type: Number, required: true, min: 0, default: 10 },
    roadTaxFixed: { type: Number, default: 0, min: 0 },
    insuranceAmount: { type: Number, required: true, min: 0 },
    accessoriesAmount: { type: Number, default: 0, min: 0 },
    registrationCharges: { type: Number, default: 1500, min: 0 },
    otherCharges: { type: Number, default: 2000, min: 0 },
    validFrom: { type: Date, required: true, default: Date.now, index: true },
    validUntil: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    auditNotes: { type: String },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per variant + city
PricingSchema.index({ carVariantId: 1, cityId: 1, isActive: 1 });

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);

