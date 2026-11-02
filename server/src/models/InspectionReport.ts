import mongoose, { Document, Schema } from 'mongoose';

export interface IInspectionSection {
  rating: number; // 1-5 or 1-10
  comments: string;
  defects?: string[];
}

export interface IInspectionReport extends Document {
  usedCarStockId: string;
  inspectionDate: Date;
  inspectorName: string;
  overallRatingPoints: number; // Out of 150 points
  exterior: IInspectionSection;
  interior: IInspectionSection;
  engineTransmission: IInspectionSection;
  tyresBrakes: {
    rating: number;
    comments: string;
    tyreLifePercent: number;
    brakePadLifePercent: number;
  };
  electricals: IInspectionSection;
  accidentHistory: {
    hasAccident: boolean;
    details: string;
  };
  serviceHistoryAvailable: boolean;
  status: 'Passed' | 'Conditional' | 'Failed';
  createdAt: Date;
  updatedAt: Date;
}

const InspectionReportSchema = new Schema<IInspectionReport>(
  {
    usedCarStockId: { type: String, required: true, uppercase: true, trim: true, index: true },
    inspectionDate: { type: Date, default: Date.now },
    inspectorName: { type: String, default: 'Certified Technical Evaluator' },
    overallRatingPoints: { type: Number, default: 142, min: 0, max: 150 },
    exterior: {
      rating: { type: Number, default: 4.8 },
      comments: { type: String, default: 'Minor superficial stone chips on front bumper, original factory paint preserved.' },
      defects: [{ type: String }],
    },
    interior: {
      rating: { type: Number, default: 4.9 },
      comments: { type: String, default: 'Pristine upholstery, all electronics and dual-zone climate control functioning.' },
      defects: [{ type: String }],
    },
    engineTransmission: {
      rating: { type: Number, default: 5.0 },
      comments: { type: String, default: 'Smooth gear shift, silent idle, compression test within manufacturer specs.' },
      defects: [{ type: String }],
    },
    tyresBrakes: {
      rating: { type: Number, default: 4.7 },
      comments: { type: String, default: 'Uniform tyre tread depth 6.2mm, brake rotors checked.' },
      tyreLifePercent: { type: Number, default: 82 },
      brakePadLifePercent: { type: Number, default: 85 },
    },
    electricals: {
      rating: { type: Number, default: 5.0 },
      comments: { type: String, default: 'OBD-II diagnostics scan clean, zero DTC fault codes reported.' },
      defects: [{ type: String }],
    },
    accidentHistory: {
      hasAccident: { type: Boolean, default: false },
      details: { type: String, default: 'No structural or flood damage detected on comprehensive chassis ultrasound inspection.' },
    },
    serviceHistoryAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ['Passed', 'Conditional', 'Failed'], default: 'Passed' },
  },
  { timestamps: true }
);

export const InspectionReport = mongoose.model<IInspectionReport>('InspectionReport', InspectionReportSchema);

