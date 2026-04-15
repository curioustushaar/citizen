import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'PUBLIC' | 'ADMIN' | 'SUPER_ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string | null;
  region: string | null;
  phone: string;
  employeeId: string;
  officeAddress: string;
  rank: string;
  level: number;
  district: string;
  state: string;
  pincode: string;
  avatar: string;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['PUBLIC', 'ADMIN', 'SUPER_ADMIN'], default: 'PUBLIC' },
    department: { type: String, default: null },
    region: { type: String, default: null },
    phone: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    officeAddress: { type: String, default: '' },
    rank: { type: String, default: '' },
    level: { type: Number, default: 1 },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
