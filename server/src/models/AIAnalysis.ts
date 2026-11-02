import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalysisDoc extends Document {
  leadId: mongoose.Types.ObjectId;
  prompt: string;
  rawResponse: string;
  summary: string;
  budget: string | null;
  preferredModel: string | null;
  fuelPreference: string | null;
  transmission: string | null;
  purchaseTimeline: string | null;
  intent: string;
  confidence: number;
  needsReview: boolean;
  provider: string; // 'gemini' | 'openai' | 'fallback'
  createdAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysisDoc>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    prompt: { type: String, required: true },
    rawResponse: { type: String, required: true },
    summary: { type: String, required: true },
    budget: { type: String, default: null },
    preferredModel: { type: String, default: null },
    fuelPreference: { type: String, default: null },
    transmission: { type: String, default: null },
    purchaseTimeline: { type: String, default: null },
    intent: { type: String, default: 'Medium' },
    confidence: { type: Number, required: true },
    needsReview: { type: Boolean, default: false },
    provider: { type: String, default: 'gemini' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIAnalysis = mongoose.model<IAIAnalysisDoc>('AIAnalysis', AIAnalysisSchema);

