import mongoose, { Document, Schema } from 'mongoose';

export interface ICSVImport extends Document {
  fileName: string;
  importedBy?: mongoose.Types.ObjectId;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errorDetails: Array<{ row: number; error: string; data?: any }>;
  importedAt: Date;
}

const CSVImportSchema = new Schema<ICSVImport>(
  {
    fileName: { type: String, required: true },
    importedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    totalRows: { type: Number, required: true },
    successCount: { type: Number, required: true },
    failureCount: { type: Number, required: true },
    errorDetails: [
      {
        row: { type: Number, required: true },
        error: { type: String, required: true },
        data: { type: Schema.Types.Mixed },
      },
    ],
    importedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const CSVImport = mongoose.model<ICSVImport>('CSVImport', CSVImportSchema);

