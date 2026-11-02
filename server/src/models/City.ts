import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  name: string;
  state: string;
  rtoCode: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    rtoCode: { type: String, uppercase: true, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const City = mongoose.model<ICity>('City', CitySchema);

