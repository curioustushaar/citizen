import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  performedByName: string;
  role: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    performedByName: { type: String, default: 'System' },
    role: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: '' },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
