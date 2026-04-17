import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import connectDb from '@/lib/db.js';
import Complaint from '@/models/Complaint.js';
import User from '@/models/User.js';
import Notification from '@/models/Notification.js';
import { verifyJwt } from '@/lib/server/auth.js';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const CLOSED_STATUSES = ['Closed', 'Citizen Verified'];

const DEPARTMENT_MAP = {
  road: 'Municipal / PWD',
  pothole: 'Municipal / PWD',
  'street light': 'Municipal / PWD',
  water: 'Water Department',
  electricity: 'Power Department',
  traffic: 'Traffic Police',
  crime: 'Police Department',
  safety: 'Police Department',
  health: 'Health Department',
  sanitation: 'Sanitation Department',
  other: 'Manual Review',
};

const PRIORITY_RULES = {
  HIGH: /(accident|crime|fire|danger|medical emergency|emergency|blast|explosion|gas leak|injury)/i,
  MEDIUM: /(water issue|road damage|electricity outage|infrastructure|pothole|broken road|leak|power cut)/i,
};

const SLA_HOURS = {
  HIGH: 4,
  MEDIUM: 24,
  LOW: 72,
};

const AUTO_PROGRESS_STEPS = [
  { status: 'Under Review', minutes: 1, note: 'Initial review started' },
  { status: 'Assigned', minutes: 3, note: 'Assigned to department queue' },
  { status: 'In Progress', minutes: 10, note: 'Field work initiated' },
  { status: 'Resolved', minutes: 30, note: 'Marked resolved by system update' },
];

function sanitizeText(value) {
  return value.replace(/[<>]/g, '').trim();
}

function classifyPriority(text) {
  if (PRIORITY_RULES.HIGH.test(text)) return 'High';
  if (PRIORITY_RULES.MEDIUM.test(text)) return 'Medium';
  return 'Low';
}

function normalizeCategory(value) {
  const lower = value.toLowerCase();
  if (/(road|pothole|street light|traffic)/.test(lower)) return 'road';
  if (/water/.test(lower)) return 'water';
  if (/electric/.test(lower)) return 'electricity';
  if (/traffic/.test(lower)) return 'traffic';
  if (/crime|safety|police/.test(lower)) return 'crime';
  if (/health|medical|hospital/.test(lower)) return 'health';
  if (/sanitation|garbage|waste/.test(lower)) return 'sanitation';
  return 'other';
}

function resolveDepartment(category, description) {
  const seed = `${category} ${description}`.toLowerCase();
  const key = normalizeCategory(seed);
  return DEPARTMENT_MAP[key] || DEPARTMENT_MAP.other;
}

function getSlaDeadline(priority) {
  const hours = SLA_HOURS[priority?.toUpperCase()] || SLA_HOURS.MEDIUM;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function ensureTimeline(complaint) {
  if (!Array.isArray(complaint.statusTimeline)) {
    complaint.statusTimeline = [];
  }
}

function hasStatus(complaint, status) {
  return (complaint.statusTimeline || []).some((entry) => entry.status === status);
}

function maybeAutoProgress(complaint, now = new Date()) {
  const terminalStatuses = ['Closed', 'Citizen Verified', 'Rejected', 'Resolved', 'Escalated'];
  if (terminalStatuses.includes(complaint.status)) {
    return false;
  }

  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : now;
  const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
  ensureTimeline(complaint);

  let updated = false;
  for (const step of AUTO_PROGRESS_STEPS) {
    if (elapsedMinutes >= step.minutes && !hasStatus(complaint, step.status)) {
      complaint.statusTimeline.push({
        status: step.status,
        timestamp: new Date(createdAt.getTime() + step.minutes * 60000),
        note: step.note,
        changedBy: 'system',
      });
      complaint.status = step.status;
      updated = true;
    }
  }

  return updated;
}

function extractToken(req) {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }
  
  // Fallback to cookie
  const cookieToken = req.cookies.get('citizen_token')?.value;
  return cookieToken;
}

function makeComplaintId() {
  return `CIT-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
}

async function saveEvidenceFiles(files) {
  if (!files.length) return [];
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'complaints');
  await fs.mkdir(uploadDir, { recursive: true });

  const entries = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, WEBP, or PDF allowed.');
    }
    const ext = path.extname(file.name || '').toLowerCase() || '.bin';
    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    entries.push({
      url: `/uploads/complaints/${fileName}`,
      name: file.name || fileName,
      type: file.type,
    });
  }
  return entries;
}

export async function POST(req) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwt(token);
    await connectDb();

    const rateKey = `citizen_${payload.userId}`;
    const now = Date.now();
    const limiter = global.citizenRateLimiter || new Map();
    const lastHit = limiter.get(rateKey);
    if (lastHit && now - lastHit < 30000) {
      return NextResponse.json({ success: false, error: 'Too many submissions, try again shortly.' }, { status: 429 });
    }
    limiter.set(rateKey, now);
    global.citizenRateLimiter = limiter;

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = sanitizeText(String(formData.get('title') || ''));
    const description = sanitizeText(String(formData.get('description') || ''));
    const category = sanitizeText(String(formData.get('category') || ''));
    const subcategory = sanitizeText(String(formData.get('subcategory') || ''));
    const city = sanitizeText(String(formData.get('city') || ''));
    const area = sanitizeText(String(formData.get('area') || ''));
    const fullAddress = sanitizeText(String(formData.get('fullAddress') || ''));
    const ward = sanitizeText(String(formData.get('ward') || ''));
    const pincode = sanitizeText(String(formData.get('pincode') || ''));
    const landmark = sanitizeText(String(formData.get('landmark') || ''));
    const preferredLanguage = sanitizeText(String(formData.get('preferredLanguage') || ''));
    const contactPreference = sanitizeText(String(formData.get('contactPreference') || ''));
    const anonymous = String(formData.get('anonymous') || 'false') === 'true';
    const consent = String(formData.get('consent') || 'false') === 'true';
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');

    if (!title || !description || !category || !city || !area || !pincode || !consent) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const evidenceFiles = formData.getAll('evidence').filter((item) => item && item instanceof File);
    if (!evidenceFiles.length) {
      return NextResponse.json({ success: false, error: 'Evidence is required' }, { status: 400 });
    }

    const evidence = await saveEvidenceFiles(evidenceFiles);

    const normalizedCategory = category;
    const priority = classifyPriority(`${title} ${description}`);
    const assignedDepartment = resolveDepartment(normalizedCategory, description);
    const slaDeadline = getSlaDeadline(priority);

    const duplicate = await Complaint.findOne({
      userId: user._id,
      category: normalizedCategory,
      'location.city': city,
      'location.area': area,
      status: { $nin: CLOSED_STATUSES },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (duplicate) {
      await Notification.create({
        userId: user._id,
        title: 'Duplicate complaint detected',
        message: `We found an existing complaint in the same area. Tracking ${duplicate.complaintId}.`,
        relatedComplaintId: duplicate.complaintId,
      });
      return NextResponse.json({ success: true, duplicate: true, data: duplicate });
    }

    let complaintId = makeComplaintId();
    const existing = await Complaint.findOne({ complaintId });
    if (existing) complaintId = makeComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      userId: user._id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      title,
      description,
      category: normalizedCategory,
      subcategory,
      location: {
        city,
        area,
        fullAddress,
        ward,
        pincode,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      },
      landmark,
      preferredLanguage,
      contactPreference,
      anonymous,
      consent,
      evidence,
      priority,
      assignedDepartment,
      assignedOfficer: ward ? `Officer A (Ward ${ward})` : 'Officer A (Ward 22)',
      slaDeadline,
      status: 'Submitted',
      statusTimeline: [
        { status: 'Submitted', timestamp: new Date(), note: 'Complaint submitted', changedBy: 'citizen' },
      ],
    });

    await Notification.create({
      userId: user._id,
      title: 'Complaint submitted',
      message: `Your complaint ${complaint.complaintId} has been submitted successfully.`,
      relatedComplaintId: complaint.complaintId,
    });

    return NextResponse.json({ success: true, data: complaint });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    await connectDb();

    // Search by userId, email, or phone to catch all complaints
    const queryConditions = [{ userId: payload.userId }];
    if (payload.email) queryConditions.push({ email: payload.email });
    if (payload.phone) queryConditions.push({ phone: payload.phone });

    const complaints = await Complaint.find({ $or: queryConditions })
      .sort({ createdAt: -1 });

    let didUpdate = false;
    for (const complaint of complaints) {
      if (maybeAutoProgress(complaint)) {
        await complaint.save();
        didUpdate = true;
      }
    }

    return NextResponse.json({ success: true, data: complaints });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unable to load complaints' }, { status: 500 });
  }
}
