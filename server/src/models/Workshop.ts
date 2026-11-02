import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkshop extends Document {
  name: string;
  address: string;
  city: string;
  phone: string;
  baysCount: number;
  servicesOffered: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkshopSchema = new Schema<IWorkshop>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: 'Lucknow', index: true },
    phone: { type: String, required: true, trim: true },
    baysCount: { type: Number, default: 12 },
    servicesOffered: [{ type: String }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Workshop = mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

