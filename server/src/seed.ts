import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db';
import Complaint from './models/Complaint';
import Officer from './models/Officer';
import User from './models/User';
import SLAConfig from './models/SLAConfig';
import AuditLog from './models/AuditLog';
import Department from './models/Department';
import {
  detectCategory,
  detectPriority,
  getDepartment,
  calculateSLA,
  generateComplaintId,
} from './services/aiService';

dotenv.config();

const departments = [
  {
    name: 'Delhi Police',
    icon: '🚓',
    categories: ['Public Safety', 'Crime', 'Harassment'],
    hierarchy: [
      { name: 'Constable', level: 1 },
      { name: 'Head Constable', level: 2 },
      { name: 'Sub Inspector', level: 3 },
      { name: 'Inspector / SHO', level: 4 },
      { name: 'DSP / ACP', level: 5 },
      { name: 'SP / DCP', level: 6 },
      { name: 'IG', level: 7 },
      { name: 'Commissioner', level: 8 },
    ],
  },
  {
    name: 'Municipal Corporation (MCD)',
    icon: '🏙️',
    categories: ['Sanitation', 'Road & Infrastructure'],
    hierarchy: [
      { name: 'Ward Worker', level: 1 },
      { name: 'Junior Engineer (JE)', level: 2 },
      { name: 'Assistant Engineer (AE)', level: 3 },
      { name: 'Executive Engineer', level: 4 },
      { name: 'Municipal Commissioner', level: 5 },
    ],
  },
  {
    name: 'Electricity Department',
    icon: '⚡',
    categories: ['Electricity'],
    hierarchy: [
      { name: 'Lineman', level: 1 },
      { name: 'Junior Engineer', level: 2 },
      { name: 'Assistant Engineer', level: 3 },
      { name: 'Executive Engineer', level: 4 },
      { name: 'Chief Engineer', level: 5 },
    ],
  },
];

const officers = [
  // Police Hierarchy Demo
  { name: 'Amit Sharma', department: 'Delhi Police', rank: 'Constable', designation: 'Constable', level: 1, email: 'amit.c@dp.gov.in', phone: '+91 90000 00001' },
  { name: 'Rajiv Mehra', department: 'Delhi Police', rank: 'Sub Inspector', designation: 'Sub Inspector', level: 3, email: 'rajiv.si@dp.gov.in', phone: '+91 90000 00002' },
  { name: 'Vikram Singh', department: 'Delhi Police', rank: 'Commissioner', designation: 'Commissioner', level: 8, email: 'comm.singh@dp.gov.in', phone: '+91 90000 00003' },
  
  // Municipal Hierarchy Demo
  { name: 'Suresh Kumar', department: 'Municipal Corporation (MCD)', rank: 'Ward Worker', designation: 'Ward Worker', level: 1, email: 'suresh.w@mcd.gov.in', phone: '+91 90000 00004' },
  { name: 'Anil Gupta', department: 'Municipal Corporation (MCD)', rank: 'Assistant Engineer (AE)', designation: 'Assistant Engineer', level: 3, email: 'anil.ae@mcd.gov.in', phone: '+91 90000 00005' },
  
  // Electricity Hierarchy Demo
  { name: 'Mahesh Verma', department: 'Electricity Department', rank: 'Lineman', designation: 'Lineman', level: 1, email: 'mahesh.l@electricity.gov.in', phone: '+91 90000 00006' },
  { name: 'Sanjay Rawat', department: 'Electricity Department', rank: 'Chief Engineer', designation: 'Chief Engineer', level: 5, email: 'sanjay.ce@electricity.gov.in', phone: '+91 90000 00007' },
];

const users = [
  { name: 'Aarav Citizen', email: 'citizen@demo.com', password: 'demo123', role: 'PUBLIC' as const, department: null, region: 'Delhi' },
  { name: 'Commissioner Singh', email: process.env.SUPERADMIN_EMAIL || 'superadmin@delhi.gov.in', password: process.env.SUPERADMIN_PASSWORD || 'super123', role: 'SUPER_ADMIN' as const, department: null, region: 'Delhi-NCR' },
  // Adding logins for the seeded officers
  ...officers.map(o => ({
    name: o.name,
    email: o.email,
    password: 'admin123',
    role: 'ADMIN' as const,
    department: o.department,
    region: 'Delhi-NCR'
  }))
];

const slaConfigs = [
  { category: 'Traffic & Transport', department: 'Delhi Traffic Police', priorityHigh: 2, priorityMedium: 12, priorityLow: 48 },
  { category: 'Water Supply', department: 'Delhi Jal Board', priorityHigh: 4, priorityMedium: 24, priorityLow: 72 },
  { category: 'Electricity', department: 'BSES / TPDDL', priorityHigh: 3, priorityMedium: 18, priorityLow: 60 },
  { category: 'Sanitation', department: 'Municipal Corporation of Delhi', priorityHigh: 6, priorityMedium: 24, priorityLow: 72 },
  { category: 'Road & Infrastructure', department: 'Public Works Department', priorityHigh: 4, priorityMedium: 24, priorityLow: 96 },
  { category: 'Public Safety', department: 'Delhi Police', priorityHigh: 1, priorityMedium: 8, priorityLow: 48 },
];

const complaintDescriptions = [
  { desc: 'Major accident near Laxmi Nagar flyover, multiple vehicles involved', area: 'Laxmi Nagar', district: 'East Delhi', lat: 28.6304, lng: 77.2773 },
  { desc: 'No water supply in Dwarka Sector 7 for 3 days', area: 'Dwarka', district: 'South West Delhi', lat: 28.5921, lng: 77.0460 },
  { desc: 'Streetlights not working near Saket Metro Station', area: 'Saket', district: 'South Delhi', lat: 28.5244, lng: 77.2066 },
  { desc: 'Garbage dump overflowing near Chandni Chowk market', area: 'Chandni Chowk', district: 'Central Delhi', lat: 28.6507, lng: 77.2334 },
  { desc: 'Dangerous pothole on Ring Road near Nehru Place', area: 'Nehru Place', district: 'South Delhi', lat: 28.5491, lng: 77.2533 },
  { desc: 'Power outage in Rohini Sector 15 affecting 500+ families', area: 'Rohini', district: 'North West Delhi', lat: 28.7495, lng: 77.0565 },
  { desc: 'Sewage flooding in Janakpuri Block C residential colony', area: 'Janakpuri', district: 'West Delhi', lat: 28.6219, lng: 77.0864 },
  { desc: 'Unauthorized vehicles blocking emergency route Karol Bagh', area: 'Karol Bagh', district: 'Central Delhi', lat: 28.6514, lng: 77.1907 },
  { desc: 'Broken water pipeline flooding road in Pitampura', area: 'Pitampura', district: 'North West Delhi', lat: 28.6969, lng: 77.1315 },
  { desc: 'Illegal construction debris on footpath Greater Kailash', area: 'Greater Kailash', district: 'South Delhi', lat: 28.5494, lng: 77.2425 },
  { desc: 'Stray dog menace in Lajpat Nagar central market', area: 'Lajpat Nagar', district: 'South Delhi', lat: 28.5700, lng: 77.2400 },
  { desc: 'Transformer sparking dangerously near Hauz Khas Village', area: 'Hauz Khas', district: 'South Delhi', lat: 28.5494, lng: 77.2001 },
  { desc: 'Traffic signal malfunctioning at Vasant Kunj crossing', area: 'Vasant Kunj', district: 'South West Delhi', lat: 28.5189, lng: 77.1571 },
  { desc: 'Open manholes on road in Mayur Vihar Phase 1', area: 'Mayur Vihar', district: 'East Delhi', lat: 28.5937, lng: 77.2976 },
  { desc: 'Contaminated water supply Connaught Place inner circle', area: 'Connaught Place', district: 'New Delhi', lat: 28.6315, lng: 77.2167 },
  { desc: 'Fire outbreak in slum area near ITO junction', area: 'ITO', district: 'Central Delhi', lat: 28.6289, lng: 77.2411 },
  { desc: 'Road cave-in near Moti Nagar metro station', area: 'Moti Nagar', district: 'West Delhi', lat: 28.6603, lng: 77.1457 },
  { desc: 'Encroachment blocking footpath near Tilak Nagar metro', area: 'Tilak Nagar', district: 'West Delhi', lat: 28.6398, lng: 77.0986 },
  { desc: 'Frequent power cuts in Shahdara area', area: 'Shahdara', district: 'Shahdara', lat: 28.6742, lng: 77.2891 },
  { desc: 'Garbage collection truck not arriving Patel Nagar for a week', area: 'Patel Nagar', district: 'Central Delhi', lat: 28.6434, lng: 77.1631 },
  { desc: 'Chain snatching incidents increasing near Daryaganj', area: 'Daryaganj', district: 'Central Delhi', lat: 28.6421, lng: 77.2393 },
  { desc: 'Water logging and mosquito breeding Sarvapriya Vihar', area: 'Sarvapriya Vihar', district: 'South Delhi', lat: 28.5365, lng: 77.2067 },
  { desc: 'Broken road divider on GT Karnal Road near Azadpur', area: 'Azadpur', district: 'North Delhi', lat: 28.7134, lng: 77.1779 },
  { desc: 'Noise pollution from illegal DJ Rajouri Garden past midnight', area: 'Rajouri Garden', district: 'West Delhi', lat: 28.6491, lng: 77.1217 },
  { desc: 'Bus shelter roof collapsed at Pragati Maidan bus stop', area: 'Pragati Maidan', district: 'New Delhi', lat: 28.6180, lng: 77.2478 },
];

const statuses: Array<'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED'> = [
  'PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED',
];

async function seed() {
  await connectDB();

  // Clear collections
  await Promise.all([
    Complaint.deleteMany({}),
    Officer.deleteMany({}),
    User.deleteMany({}),
    SLAConfig.deleteMany({}),
    AuditLog.deleteMany({}),
    Department.deleteMany({}),
  ]);
  console.log('🗑️  Cleared all collections');

  // Seed Departments
  const createdDepartments = await Department.insertMany(departments);
  console.log(`🏢 Seeded ${createdDepartments.length} departments`);

  // Seed Officers
  const createdOfficers = await Officer.insertMany(
    officers.map((o) => ({
      ...o,
      pendingCount: Math.floor(Math.random() * 8),
      escalatedCount: Math.floor(Math.random() * 3),
      resolvedCount: Math.floor(Math.random() * 20) + 5,
      isActive: true,
    }))
  );
  console.log(`👮 Seeded ${createdOfficers.length} officers`);

  // Seed Users
  const hashedUsers = await Promise.all(
    users.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
      phone: '+91 98111 ' + String(Math.floor(Math.random() * 90000) + 10000),
      isActive: true,
    }))
  );
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`👥 Seeded ${createdUsers.length} users (PUBLIC, ADMIN, SUPER_ADMIN)`);

  // Seed SLA Configs
  const createdSLA = await SLAConfig.insertMany(
    slaConfigs.map((s) => ({ ...s, autoEscalate: true, escalationLevels: 3 }))
  );
  console.log(`📋 Seeded ${createdSLA.length} SLA configurations`);

  // Seed Complaints
  const publicUsers = createdUsers.filter((u) => u.role === 'PUBLIC');
  const complaints = complaintDescriptions.map((c, i) => {
    const { category, confidence: aiConfidence } = detectCategory(c.desc);
    const priority = detectPriority(c.desc);
    const department = getDepartment(category);
    const slaDeadline = calculateSLA(priority);
    const officer = createdOfficers.find((o) => o.department === department) || createdOfficers[0];
    const status = statuses[i % statuses.length];
    const publicUser = publicUsers[i % publicUsers.length];
    const hoursAgo = Math.floor(Math.random() * 48) + 1;

    return {
      complaintId: generateComplaintId(),
      description: c.desc,
      category,
      priority,
      status,
      department,
      location: { lat: c.lat, lng: c.lng, area: c.area, district: c.district },
      assignedOfficer: officer._id,
      assignedOfficerName: officer.name,
      confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
      slaDeadline,
      userId: publicUser._id.toString(),
      userName: publicUser.name,
      notes: [],
      feedback: status === 'RESOLVED' ? { satisfied: Math.random() > 0.3, comment: 'Thanks for resolving', submittedAt: new Date() } : null,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      resolvedAt: status === 'RESOLVED' ? new Date(Date.now() - (hoursAgo - 2) * 60 * 60 * 1000) : null,
    };
  });

  await Complaint.insertMany(complaints);
  console.log(`📝 Seeded ${complaints.length} complaints`);

  // Seed initial audit logs
  await AuditLog.insertMany([
    { action: 'SYSTEM_SEED', performedBy: 'system', performedByName: 'System', role: 'SYSTEM', targetType: 'system', details: 'Database seeded with demo data' },
    { action: 'CREATE_USER', performedBy: 'system', performedByName: 'System', role: 'SYSTEM', targetType: 'user', details: `Created ${createdUsers.length} demo users` },
    { action: 'CONFIGURE_SLA', performedBy: 'system', performedByName: 'System', role: 'SYSTEM', targetType: 'sla', details: `Configured ${createdSLA.length} SLA rules` },
  ]);
  console.log('📄 Seeded audit logs');

  console.log('\n✅ Seed complete!');
  console.log('\n--- Demo Accounts ---');
  console.log('PUBLIC:      citizen@demo.com / demo123');
  console.log('ADMIN:       admin@trafficpolice.gov.in / admin123');
  console.log('SUPER_ADMIN: superadmin@delhi.gov.in / super123');
  console.log('---');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
