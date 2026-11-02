import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunicationLog extends Document {
  leadId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP_SIMULATED';
  recipientPhone: string;
  recipientEmail: string;
  subject?: string;
  messageBody: string;
  isAiDraftEdited: boolean;
  status: 'SENT_MOCK' | 'FAILED';
  sentAt: Date;
}

const CommunicationLogSchema = new Schema<ICommunicationLog>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: String, enum: ['EMAIL', 'SMS', 'WHATSAPP_SIMULATED'], default: 'EMAIL' },
    recipientPhone: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String },
    messageBody: { type: String, required: true },
    isAiDraftEdited: { type: Boolean, default: false },
    status: { type: String, default: 'SENT_MOCK' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CommunicationLog = mongoose.model<ICommunicationLog>('CommunicationLog', CommunicationLogSchema);

