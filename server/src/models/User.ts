import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types/index.js';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  assignedShowroom?: mongoose.Types.ObjectId;
  supportedModels?: mongoose.Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['BUYER', 'SALES_CONSULTANT', 'ADMIN'], default: 'BUYER', index: true },
    phone: { type: String, trim: true },
    assignedShowroom: { type: Schema.Types.ObjectId, ref: 'Showroom' },
    supportedModels: [{ type: Schema.Types.ObjectId, ref: 'CarModel' }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

