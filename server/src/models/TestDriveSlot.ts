import mongoose, { Document, Schema } from 'mongoose';

export interface ITestDriveSlot extends Document {
  showroomId: mongoose.Types.ObjectId;
  demoVehicleId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  startTime: string; // "10:00 AM"
  endTime: string; // "11:00 AM"
  isBlocked: boolean;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestDriveSlotSchema = new Schema<ITestDriveSlot>(
  {
    showroomId: { type: Schema.Types.ObjectId, ref: 'Showroom', required: true, index: true },
    demoVehicleId: { type: Schema.Types.ObjectId, ref: 'DemoVehicle', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
  },
  { timestamps: true }
);

TestDriveSlotSchema.index({ demoVehicleId: 1, date: 1, startTime: 1 }, { unique: true });

export const TestDriveSlot = mongoose.model<ITestDriveSlot>('TestDriveSlot', TestDriveSlotSchema);

