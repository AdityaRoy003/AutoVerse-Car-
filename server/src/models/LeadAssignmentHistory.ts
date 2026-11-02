import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadAssignmentHistory extends Document {
  leadId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId | string; // ObjectId or "SYSTEM_AUTO"
  previousConsultantId?: mongoose.Types.ObjectId;
  reason: string;
  assignedAt: Date;
}

const LeadAssignmentHistorySchema = new Schema<ILeadAssignmentHistory>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Schema.Types.Mixed, default: 'SYSTEM_AUTO' },
    previousConsultantId: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, default: 'Automated workload-balanced assignment' },
    assignedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const LeadAssignmentHistory = mongoose.model<ILeadAssignmentHistory>('LeadAssignmentHistory', LeadAssignmentHistorySchema);

