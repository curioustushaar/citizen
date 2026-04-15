import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'STATUS_UPDATE' | 'CRISIS' | 'ESCALATION' | 'GENERAL';
  relatedId?: string; // e.g. Complaint ID
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['ASSIGNMENT', 'STATUS_UPDATE', 'CRISIS', 'ESCALATION', 'GENERAL'],
      default: 'GENERAL'
    },
    relatedId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
