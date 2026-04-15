import mongoose, { Schema, Document } from 'mongoose';

export interface ISLAConfig extends Document {
  category: string;
  department: string;
  priorityHigh: number;
  priorityMedium: number;
  priorityLow: number;
  autoEscalate: boolean;
  escalationLevels: number;
  updatedBy: string;
}

const SLAConfigSchema = new Schema<ISLAConfig>(
  {
    category: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    priorityHigh: { type: Number, default: 4 },
    priorityMedium: { type: Number, default: 24 },
    priorityLow: { type: Number, default: 72 },
    autoEscalate: { type: Boolean, default: true },
    escalationLevels: { type: Number, default: 3 },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ISLAConfig>('SLAConfig', SLAConfigSchema);
