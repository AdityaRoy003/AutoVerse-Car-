import mongoose, { Document, Schema } from 'mongoose';

export interface IShowroom extends Document {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
    workingDays: string[];
  };
  geoCoordinates?: {
    latitude: number;
    longitude: number;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowroomSchema = new Schema<IShowroom>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: 'Lucknow', index: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    operatingHours: {
      open: { type: String, default: '09:30 AM' },
      close: { type: String, default: '07:30 PM' },
      workingDays: [{ type: String, default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    },
    geoCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Showroom = mongoose.model<IShowroom>('Showroom', ShowroomSchema);

