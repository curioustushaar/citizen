import mongoose, { Schema, Document } from 'mongoose';

export interface IEscalation extends Document {
  complaintId: string;
  level: number;
  escalatedFrom: string | null;
  escalatedTo: string | null;
  reason: string;
  autoEscalated: boolean;
  createdAt: Date;
}

const EscalationSchema = new Schema<IEscalation>(
  {
    complaintId: { type: String, required: true, index: true },
    level: { type: Number, default: 1 },
    escalatedFrom: { type: String, default: null },
    escalatedTo: { type: String, default: null },
    reason: { type: String, default: 'SLA deadline exceeded' },
    autoEscalated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IEscalation>('Escalation', EscalationSchema);
