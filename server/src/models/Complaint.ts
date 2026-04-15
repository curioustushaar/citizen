import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  complaintId: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  department: string;
  location: {
    lat: number;
    lng: number;
    area: string;
    district: string;
  };
  assignedOfficer: string | null;
  assignedOfficerName: string | null;
  confidence: number;
  slaDeadline: Date;
  userId: string | null;
  userName: string;
  notes: Array<{
    text: string;
    attachment: string | null;
    addedBy: string;
    addedAt: Date;
  }>;
  feedback: {
    satisfied: boolean;
    comment: string;
    submittedAt: Date;
  } | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'],
      default: 'PENDING',
    },
    department: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      area: { type: String, required: true },
      district: { type: String, default: '' },
    },
    assignedOfficer: { type: String, default: null },
    assignedOfficerName: { type: String, default: null },
    confidence: { type: Number, default: 0 },
    slaDeadline: { type: Date, required: true },
    userId: { type: String, default: null, index: true },
    userName: { type: String, default: 'Anonymous' },
    notes: [
      {
        text: { type: String },
        attachment: { type: String, default: null },
        addedBy: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    feedback: {
      type: {
        satisfied: Boolean,
        comment: String,
        submittedAt: Date,
      },
      default: null,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
