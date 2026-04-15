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
  avatar: string;
  isActive: boolean;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  gender: string;
  dob: string;
  bio: string;
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
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    gender: { type: String, default: '' },
    dob: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
