import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  action: string;
  entityType: 'PRICING' | 'USER' | 'LEAD' | 'BOOKING' | 'CAR_MODEL' | 'USED_CAR' | 'SHOWROOM';
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['PRICING', 'USER', 'LEAD', 'BOOKING', 'CAR_MODEL', 'USED_CAR', 'SHOWROOM'],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    oldValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

