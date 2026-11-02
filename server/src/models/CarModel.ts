import mongoose, { Document, Schema } from 'mongoose';

export interface ICarSpecification {
  engine: string;
  displacementCc: number;
  maxPower: string;
  maxTorque: string;
  fuelTypes: string[];
  transmissions: string[];
  mileageKmpl: number;
  seatingCapacity: number;
  bootSpaceLiters: number;
  fuelTankCapacityLiters: number;
}

export interface ICarColor {
  name: string;
  hexCode: string;
  imageUrl?: string;
}

export interface ICarModel extends Document {
  name: string;
  slug: string;
  tagline: string;
  brand: string;
  bodyType: 'SUV' | 'Sedan' | 'Hatchback' | 'Coupe' | 'EV';
  startingPrice: number;
  heroImage: string;
  images: string[];
  overview: string;
  specifications: ICarSpecification;
  safetyRating: number; // e.g., 5-star
  safetyFeatures: string[];
  availableColors: ICarColor[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarModelSchema = new Schema<ICarModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, trim: true },
    brand: { type: String, default: 'Autoverse Brand' },
    bodyType: { type: String, enum: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'EV'], required: true, index: true },
    startingPrice: { type: Number, required: true, min: 0 },
    heroImage: { type: String, required: true },
    images: [{ type: String }],
    overview: { type: String },
    specifications: {
      engine: { type: String, default: '1.5L Turbo Petrol' },
      displacementCc: { type: Number, default: 1498 },
      maxPower: { type: String, default: '148 bhp @ 5500 rpm' },
      maxTorque: { type: String, default: '250 Nm @ 1500-3500 rpm' },
      fuelTypes: [{ type: String }],
      transmissions: [{ type: String }],
      mileageKmpl: { type: Number, default: 17.8 },
      seatingCapacity: { type: Number, default: 5 },
      bootSpaceLiters: { type: Number, default: 450 },
      fuelTankCapacityLiters: { type: Number, default: 50 },
    },
    safetyRating: { type: Number, default: 5, min: 1, max: 5 },
    safetyFeatures: [{ type: String }],
    availableColors: [
      {
        name: { type: String, required: true },
        hexCode: { type: String, required: true },
        imageUrl: { type: String },
      },
    ],
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const CarModel = mongoose.model<ICarModel>('CarModel', CarModelSchema);

