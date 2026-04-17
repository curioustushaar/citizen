import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, default: 'citizen' },
    authProviders: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
