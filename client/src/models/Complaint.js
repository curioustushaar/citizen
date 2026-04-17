import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema(
  {
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    fullAddress: { type: String, default: '' },
    ward: { type: String, default: '' },
    pincode: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    changedBy: { type: String, default: 'system' },
  },
  { _id: false }
);

const EscalationSchema = new Schema(
  {
    level: { type: String, required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    escalatedTo: { type: String, default: '' },
  },
  { _id: false }
);

const OfficerUpdateSchema = new Schema(
  {
    type: { type: String, default: 'note' },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    proofUrl: { type: String, default: '' },
  },
  { _id: false }
);

const FeedbackSchema = new Schema(
  {
    response: { type: String, enum: ['yes', 'no', ''], default: '' },
    comment: { type: String, default: '' },
    timestamp: { type: Date },
  },
  { _id: false }
);

const EvidenceSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: '' },
    type: { type: String, default: '' },
  },
  { _id: false }
);

const ComplaintSchema = new Schema(
  {
    complaintId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    location: { type: LocationSchema, required: true },
    landmark: { type: String, default: '' },
    preferredLanguage: { type: String, default: '' },
    contactPreference: { type: String, default: '' },
    anonymous: { type: Boolean, default: false },
    consent: { type: Boolean, default: false },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Submitted' },
    assignedDepartment: { type: String, default: '' },
    assignedOfficer: { type: String, default: '' },
    evidence: { type: [EvidenceSchema], default: [] },
    slaDeadline: { type: Date },
    statusTimeline: { type: [TimelineSchema], default: [] },
    escalationHistory: { type: [EscalationSchema], default: [] },
    officerUpdates: { type: [OfficerUpdateSchema], default: [] },
    feedback: { type: FeedbackSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
