import mongoose, { Document, Schema } from 'mongoose';

export interface IConsentRecord {
  type: 'ENQUIRY_TERMS' | 'MARKETING_SMS_EMAIL' | 'PRIVACY_POLICY';
  consentGiven: boolean;
  consentedAt: Date;
  policyVersion: string;
  ipAddress?: string;
}

export interface ICustomerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  alternatePhone?: string;
  address?: string;
  city?: string;
  preferredShowroom?: mongoose.Types.ObjectId;
  consentHistory: IConsentRecord[];
  marketingOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    type: { type: String, required: true },
    consentGiven: { type: Boolean, required: true },
    consentedAt: { type: Date, default: Date.now },
    policyVersion: { type: String, default: '1.0' },
    ipAddress: { type: String },
  },
  { _id: false }
);

const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    alternatePhone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    preferredShowroom: { type: Schema.Types.ObjectId, ref: 'Showroom' },
    consentHistory: [ConsentRecordSchema],
    marketingOptIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CustomerProfile = mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);

