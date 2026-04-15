import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineStep {
  step: string;
  time: Date;
}

export interface IComplaint extends Document {
  description: string;
  category: string;
  status: string;
  priority: string;
  department: string;
  slaDeadline: Date;
  tags: string[];
  imageUrls: string[];
  voiceNoteUrl: string;
  userId: string;
  userName: string;
  assignedOfficer: string;
  timeline: ITimelineStep[];
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
    area: string;
    district: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    description: { type: String, required: true },
    category:    { type: String, required: true },
    status:      { type: String, default: 'pending' },
    priority:    { type: String, default: 'MEDIUM' },
    department:  { type: String, default: 'General Administration' },
    slaDeadline: { type: Date },
    tags:        { type: [String], default: [] },
    imageUrls:   { type: [String], default: [] },
    voiceNoteUrl:{ type: String, default: '' },
    userId:      { type: String, default: '' },
    userName:    { type: String, default: 'Anonymous' },
    assignedOfficer: { type: String, default: 'Unassigned' },
    timeline: [
      {
        step: { type: String, required: true },
        time: { type: Date, default: Date.now }
      }
    ],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      area:     { type: String, required: true },
      district: { type: String, default: 'Delhi' }
    },
  },
  { timestamps: true }
);

// Create geospatial index
ComplaintSchema.index({ location: '2dsphere' });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
