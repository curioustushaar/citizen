import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficer extends Document {
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  pendingCount: number;
  escalatedCount: number;
  resolvedCount: number;
  performance: number;
  isActive: boolean;
}

const OfficerSchema = new Schema<IOfficer>(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    pendingCount: { type: Number, default: 0 },
    escalatedCount: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },
    performance: { type: Number, default: 75 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOfficer>('Officer', OfficerSchema);
