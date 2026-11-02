import mongoose, { Document, Schema } from 'mongoose';

export interface ITradeInRequest extends Document {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  currentVehicleModel: string;
  manufacturingYear: number;
  kilometres: number;
  fuelType: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Work';
  interestedNewModelId?: mongoose.Types.ObjectId;
  estimatedRangeNote: string;
  status: 'PENDING' | 'EVALUATED' | 'OFFER_MADE' | 'REJECTED';
  dealershipRemarks?: string;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TradeInRequestSchema = new Schema<ITradeInRequest>(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    currentVehicleModel: { type: String, required: true, trim: true },
    manufacturingYear: { type: Number, required: true },
    kilometres: { type: Number, required: true },
    fuelType: { type: String, required: true },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Needs Work'], default: 'Good' },
    interestedNewModelId: { type: Schema.Types.ObjectId, ref: 'CarModel' },
    estimatedRangeNote: { type: String, default: 'Indicative range subject to physical 150-point inspection at dealership.' },
    status: { type: String, enum: ['PENDING', 'EVALUATED', 'OFFER_MADE', 'REJECTED'], default: 'PENDING' },
    dealershipRemarks: { type: String },
    consentGiven: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TradeInRequest = mongoose.model<ITradeInRequest>('TradeInRequest', TradeInRequestSchema);

