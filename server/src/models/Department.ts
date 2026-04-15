import mongoose, { Schema, Document } from 'mongoose';

export interface IRank {
  name: string;
  level: number;
}

export interface IDepartment extends Document {
  name: string;
  type: string;
  icon: string;
  location: string;
  jurisdictionLevel: string;
  categories: string[];
  hierarchy: IRank[];
  isActive: boolean;
}

const RankSchema = new Schema<IRank>({
  name: { type: String, required: true },
  level: { type: Number, required: true },
});

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, default: 'General' },
    icon: { type: String, default: '🏢' },
    location: { type: String, default: 'Delhi' },
    jurisdictionLevel: { type: String, default: 'City' },
    categories: { type: [String], default: [] },
    hierarchy: { type: [RankSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
