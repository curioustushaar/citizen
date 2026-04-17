import { NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import Complaint from '@/models/Complaint.js';
import Notification from '@/models/Notification.js';
import { verifyJwt } from '@/lib/server/auth.js';

export const runtime = 'nodejs';

function extractToken(req) {
  const cookieToken = req.cookies.get('citizen_token')?.value;
  const authHeader = req.headers.get('authorization') || '';
  const headerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;
  return cookieToken || headerToken;
}

const ESCALATION_CHAIN = [
  { level: 'Officer', escalatedTo: 'Assigned Officer' },
  { level: 'Supervisor', escalatedTo: 'Department Supervisor' },
  { level: 'Department Head', escalatedTo: 'Department Head' },
  { level: 'District Authority', escalatedTo: 'District Authority' },
];

function nextEscalation(history = []) {
  const index = Math.min(history.length, ESCALATION_CHAIN.length - 1);
  return ESCALATION_CHAIN[index];
}

export async function POST(req, { params }) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    await connectDb();

    const complaint = await Complaint.findOne({ complaintId: params.id, userId: payload.userId });
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    const body = await req.json();
    const response = body?.response;
    const comment = String(body?.comment || '').trim();

    if (!['yes', 'no'].includes(response)) {
      return NextResponse.json({ success: false, error: 'Invalid feedback response' }, { status: 400 });
    }

    complaint.feedback = {
      response,
      comment,
      timestamp: new Date(),
    };

    if (response === 'yes') {
      complaint.status = 'Citizen Verified';
      complaint.statusTimeline.push({
        status: 'Citizen Verified',
        timestamp: new Date(),
        note: 'Citizen verified resolution',
        changedBy: 'citizen',
      });
      complaint.status = 'Closed';
      complaint.statusTimeline.push({
        status: 'Closed',
        timestamp: new Date(),
        note: 'Case closed after citizen verification',
        changedBy: 'system',
      });
    } else {
      const escalation = nextEscalation(complaint.escalationHistory || []);
      complaint.status = 'Reopened';
      complaint.statusTimeline.push({
        status: 'Reopened',
        timestamp: new Date(),
        note: 'Citizen reported issue unresolved',
        changedBy: 'citizen',
      });
      complaint.escalationHistory.push({
        level: escalation.level,
        reason: 'Citizen marked unresolved',
        timestamp: new Date(),
        escalatedTo: escalation.escalatedTo,
      });
    }

    await complaint.save();

    await Notification.create({
      userId: payload.userId,
      title: response === 'yes' ? 'Complaint closed' : 'Complaint reopened',
      message:
        response === 'yes'
          ? `Complaint ${complaint.complaintId} marked resolved and closed.`
          : `Complaint ${complaint.complaintId} reopened and escalated for action.`,
      relatedComplaintId: complaint.complaintId,
    });
    return NextResponse.json({ success: true, data: complaint });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}
