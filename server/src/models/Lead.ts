import mongoose, { Document, Schema } from 'mongoose';
import { LeadSource, LeadStatus } from '../types/index.js';

export interface ILeadNote {
  note: string;
  authorId?: mongoose.Types.ObjectId;
  authorName?: string;
  createdAt: Date;
}

export interface ILead extends Document {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  interestedModelId?: mongoose.Types.ObjectId;
  interestedVariantId?: mongoose.Types.ObjectId;
  budgetRange?: string; // e.g. "12-15 Lakh"
  preferredShowroom?: mongoose.Types.ObjectId;
  leadSource: LeadSource;
  status: LeadStatus;
  assignedConsultantId?: mongoose.Types.ObjectId;
  responseDeadline: Date; // 5 minutes after creation
  firstContactedAt?: Date;
  isOverdue: boolean;
  notes: ILeadNote[];
  consentGiven: boolean;
  consentTimestamp: Date;
  policyVersion: string;
  marketingOptIn: boolean;
  message?: string; // Buyer's original enquiry text
  aiSummary?: {
    summary: string;
    budget: string | null;
    preferredModel: string | null;
    fuelPreference: string | null;
    transmission: string | null;
    purchaseTimeline: string | null;
    intent: string;
    confidence: number;
    needsReview: boolean;
    provider: string;
    generatedAt: Date;
  };
  aiReplyDraft?: {
    draft: string;
    confidence: number;
    needsReview: boolean;
    provider: string;
    generatedAt: Date;
    isApproved: boolean;
    isSent: boolean;
    sentAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    note: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Consultant' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new Schema<ILead>(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    interestedModelId: { type: Schema.Types.ObjectId, ref: 'CarModel', index: true },
    interestedVariantId: { type: Schema.Types.ObjectId, ref: 'CarVariant' },
    budgetRange: { type: String },
    preferredShowroom: { type: Schema.Types.ObjectId, ref: 'Showroom', index: true },
    leadSource: {
      type: String,
      enum: ['Website', 'Used-car enquiry', 'Test-drive request', 'Portal CSV import', 'Walk-in'],
      default: 'Website',
      index: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'ASSIGNED', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP', 'CONVERTED', 'LOST'],
      default: 'NEW',
      index: true,
    },
    assignedConsultantId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    responseDeadline: { type: Date, required: true, index: true },
    firstContactedAt: { type: Date },
    isOverdue: { type: Boolean, default: false, index: true },
    notes: [LeadNoteSchema],
    consentGiven: { type: Boolean, required: true, default: true },
    consentTimestamp: { type: Date, default: Date.now },
    policyVersion: { type: String, default: '1.0' },
    marketingOptIn: { type: Boolean, default: false },
    message: { type: String },
    aiSummary: {
      summary: { type: String },
      budget: { type: String },
      preferredModel: { type: String },
      fuelPreference: { type: String },
      transmission: { type: String },
      purchaseTimeline: { type: String },
      intent: { type: String },
      confidence: { type: Number },
      needsReview: { type: Boolean, default: false },
      provider: { type: String },
      generatedAt: { type: Date },
    },
    aiReplyDraft: {
      draft: { type: String },
      confidence: { type: Number },
      needsReview: { type: Boolean, default: false },
      provider: { type: String },
      generatedAt: { type: Date },
      isApproved: { type: Boolean, default: false },
      isSent: { type: Boolean, default: false },
      sentAt: { type: Date },
    },
  },
  { timestamps: true }
);

LeadSchema.index({ assignedConsultantId: 1, status: 1 });
LeadSchema.index({ responseDeadline: 1, isOverdue: 1, firstContactedAt: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

