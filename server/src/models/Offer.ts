import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description: string;
  discountAmount: number;
  bannerImageUrl: string;
  badgeText: string;
  validTill: Date;
  applicableModels: mongoose.Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountAmount: { type: Number, default: 0 },
    bannerImageUrl: { type: String, required: true },
    badgeText: { type: String, default: 'Festive Special' },
    validTill: { type: Date, required: true },
    applicableModels: [{ type: Schema.Types.ObjectId, ref: 'CarModel' }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>('Offer', OfferSchema);

