// Fallback dummy data for when the backend is unavailable
// All data is Delhi-based and realistic

export const dummyComplaints = [
  { complaintId: 'GRV-M1A2B3-X1Y2', description: 'Major accident near Laxmi Nagar flyover, multiple vehicles involved and traffic completely blocked for 2 hours', category: 'Traffic & Transport', priority: 'HIGH' as const, status: 'PENDING' as const, location: { lat: 28.6304, lng: 77.2773, area: 'Laxmi Nagar', district: 'East Delhi' }, assignedOfficer: '1', assignedOfficerName: 'Rajesh Kumar', department: 'Delhi Traffic Police', slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), confidence: 0.92, createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-N2B3C4-A2B3', description: 'No water supply in Dwarka Sector 7 for the past 3 days, residents struggling for basic needs', category: 'Water Supply', priority: 'MEDIUM' as const, status: 'IN_PROGRESS' as const, location: { lat: 28.5921, lng: 77.0460, area: 'Dwarka', district: 'South West Delhi' }, assignedOfficer: '2', assignedOfficerName: 'Priya Sharma', department: 'Delhi Jal Board', slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), confidence: 0.88, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-O3C4D5-B3C4', description: 'Streetlights not working on the main road near Saket Metro Station for over a week', category: 'Electricity', priority: 'LOW' as const, status: 'PENDING' as const, location: { lat: 28.5244, lng: 77.2066, area: 'Saket', district: 'South Delhi' }, assignedOfficer: '3', assignedOfficerName: 'Amit Singh', department: 'BSES / TPDDL', slaDeadline: new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString(), confidence: 0.78, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-P4D5E6-C4D5', description: 'Garbage dump overflowing near Chandni Chowk market causing severe health hazard', category: 'Sanitation', priority: 'MEDIUM' as const, status: 'ESCALATED' as const, location: { lat: 28.6507, lng: 77.2334, area: 'Chandni Chowk', district: 'Central Delhi' }, assignedOfficer: '4', assignedOfficerName: 'Sunita Gupta', department: 'Municipal Corporation of Delhi', slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), confidence: 0.95, createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-Q5E6F7-D5E6', description: 'Dangerous pothole on Ring Road near Nehru Place causing frequent accidents and vehicle damage', category: 'Road & Infrastructure', priority: 'HIGH' as const, status: 'PENDING' as const, location: { lat: 28.5491, lng: 77.2533, area: 'Nehru Place', district: 'South Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), confidence: 0.91, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-R6F7G8-E6F7', description: 'Complete power outage in Rohini Sector 15 since yesterday evening affecting 500+ families', category: 'Electricity', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, location: { lat: 28.7495, lng: 77.0565, area: 'Rohini', district: 'North West Delhi' }, assignedOfficer: '3', assignedOfficerName: 'Amit Singh', department: 'BSES / TPDDL', slaDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), confidence: 0.87, createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-S7G8H9-F7G8', description: 'Sewage water flooding the residential colony in Janakpuri Block C, extremely unhygienic conditions', category: 'Water Supply', priority: 'HIGH' as const, status: 'PENDING' as const, location: { lat: 28.6219, lng: 77.0864, area: 'Janakpuri', district: 'West Delhi' }, assignedOfficer: '2', assignedOfficerName: 'Priya Sharma', department: 'Delhi Jal Board', slaDeadline: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), confidence: 0.93, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-T8H9I0-G8H9', description: 'Unauthorized vehicles blocking emergency route near Karol Bagh fire station', category: 'Traffic & Transport', priority: 'MEDIUM' as const, status: 'RESOLVED' as const, location: { lat: 28.6514, lng: 77.1907, area: 'Karol Bagh', district: 'Central Delhi' }, assignedOfficer: '7', assignedOfficerName: 'Deepak Verma', department: 'Delhi Traffic Police', slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), confidence: 0.82, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { complaintId: 'GRV-U9I0J1-H9I0', description: 'Broken water pipeline flooding the road in Pitampura causing severe waterlogging', category: 'Water Supply', priority: 'MEDIUM' as const, status: 'PENDING' as const, location: { lat: 28.6969, lng: 77.1315, area: 'Pitampura', district: 'North West Delhi' }, assignedOfficer: '8', assignedOfficerName: 'Meera Joshi', department: 'Delhi Jal Board', slaDeadline: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(), confidence: 0.89, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-V0J1K2-I0J1', description: 'Illegal construction debris dumped on footpath near Greater Kailash M Block market', category: 'Road & Infrastructure', priority: 'LOW' as const, status: 'PENDING' as const, location: { lat: 28.5494, lng: 77.2425, area: 'Greater Kailash', district: 'South Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), confidence: 0.76, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-W1K2L3-J1K2', description: 'Stray dog menace in Lajpat Nagar central market, multiple bite incidents reported', category: 'Sanitation', priority: 'MEDIUM' as const, status: 'IN_PROGRESS' as const, location: { lat: 28.5700, lng: 77.2400, area: 'Lajpat Nagar', district: 'South Delhi' }, assignedOfficer: '4', assignedOfficerName: 'Sunita Gupta', department: 'Municipal Corporation of Delhi', slaDeadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), confidence: 0.71, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-X2L3M4-K2L3', description: 'Transformer sparking dangerously near Hauz Khas Village entrance, risk of electrocution', category: 'Electricity', priority: 'HIGH' as const, status: 'ESCALATED' as const, location: { lat: 28.5494, lng: 77.2001, area: 'Hauz Khas', district: 'South Delhi' }, assignedOfficer: '3', assignedOfficerName: 'Amit Singh', department: 'BSES / TPDDL', slaDeadline: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(), confidence: 0.94, createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-Y3M4N5-L3M4', description: 'Traffic signal malfunctioning at Vasant Kunj main crossing for the past 5 days', category: 'Traffic & Transport', priority: 'MEDIUM' as const, status: 'RESOLVED' as const, location: { lat: 28.5189, lng: 77.1571, area: 'Vasant Kunj', district: 'South West Delhi' }, assignedOfficer: '1', assignedOfficerName: 'Rajesh Kumar', department: 'Delhi Traffic Police', slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), confidence: 0.85, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { complaintId: 'GRV-Z4N5O6-M4N5', description: 'Open manholes on the road in Mayur Vihar Phase 1, extremely dangerous for pedestrians', category: 'Road & Infrastructure', priority: 'HIGH' as const, status: 'PENDING' as const, location: { lat: 28.5937, lng: 77.2976, area: 'Mayur Vihar', district: 'East Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), confidence: 0.90, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-A5O6P7-N5O6', description: 'Contaminated water supply in Connaught Place inner circle area, brownish water coming from taps', category: 'Water Supply', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, location: { lat: 28.6315, lng: 77.2167, area: 'Connaught Place', district: 'New Delhi' }, assignedOfficer: '2', assignedOfficerName: 'Priya Sharma', department: 'Delhi Jal Board', slaDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), confidence: 0.88, createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-B6P7Q8-O6P7', description: 'Fire outbreak in slum area near ITO junction, fire brigade needed urgently', category: 'Public Safety', priority: 'HIGH' as const, status: 'ESCALATED' as const, location: { lat: 28.6289, lng: 77.2411, area: 'ITO', district: 'Central Delhi' }, assignedOfficer: '6', assignedOfficerName: 'Ananya Patel', department: 'Delhi Police', slaDeadline: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(), confidence: 0.96, createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-C7Q8R9-P7Q8', description: 'Road cave-in near Moti Nagar metro station due to ongoing construction work', category: 'Road & Infrastructure', priority: 'HIGH' as const, status: 'PENDING' as const, location: { lat: 28.6603, lng: 77.1457, area: 'Moti Nagar', district: 'West Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), confidence: 0.87, createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-D8R9S0-Q8R9', description: 'Encroachment by street vendors blocking the entire footpath near Tilak Nagar metro', category: 'Public Safety', priority: 'LOW' as const, status: 'RESOLVED' as const, location: { lat: 28.6398, lng: 77.0986, area: 'Tilak Nagar', district: 'West Delhi' }, assignedOfficer: '6', assignedOfficerName: 'Ananya Patel', department: 'Delhi Police', slaDeadline: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), confidence: 0.73, createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
  { complaintId: 'GRV-E9S0T1-R9S0', description: 'Frequent power cuts in Shahdara area disrupting small businesses and daily life', category: 'Electricity', priority: 'MEDIUM' as const, status: 'PENDING' as const, location: { lat: 28.6742, lng: 77.2891, area: 'Shahdara', district: 'Shahdara' }, assignedOfficer: '3', assignedOfficerName: 'Amit Singh', department: 'BSES / TPDDL', slaDeadline: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(), confidence: 0.81, createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-F0T1U2-S0T1', description: 'Garbage collection truck not arriving in Patel Nagar for over a week', category: 'Sanitation', priority: 'MEDIUM' as const, status: 'PENDING' as const, location: { lat: 28.6434, lng: 77.1631, area: 'Patel Nagar', district: 'Central Delhi' }, assignedOfficer: '4', assignedOfficerName: 'Sunita Gupta', department: 'Municipal Corporation of Delhi', slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), confidence: 0.84, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-G1U2V3-T1U2', description: 'Chain snatching incidents increasing near Daryaganj book market during evening hours', category: 'Public Safety', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, location: { lat: 28.6421, lng: 77.2393, area: 'Daryaganj', district: 'Central Delhi' }, assignedOfficer: '6', assignedOfficerName: 'Ananya Patel', department: 'Delhi Police', slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), confidence: 0.79, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-H2V3W4-U2V3', description: 'Water logging and mosquito breeding in vacant plot near Sarvapriya Vihar', category: 'Sanitation', priority: 'LOW' as const, status: 'PENDING' as const, location: { lat: 28.5365, lng: 77.2067, area: 'Sarvapriya Vihar', district: 'South Delhi' }, assignedOfficer: '4', assignedOfficerName: 'Sunita Gupta', department: 'Municipal Corporation of Delhi', slaDeadline: new Date(Date.now() + 55 * 60 * 60 * 1000).toISOString(), confidence: 0.68, createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-I3W4X5-V3W4', description: 'Broken road divider on GT Karnal Road near Azadpur causing lane confusion', category: 'Road & Infrastructure', priority: 'MEDIUM' as const, status: 'RESOLVED' as const, location: { lat: 28.7134, lng: 77.1779, area: 'Azadpur', district: 'North Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(), confidence: 0.83, createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString() },
  { complaintId: 'GRV-J4X5Y6-W4X5', description: 'Noise pollution from illegal DJ and parties in Rajouri Garden area past midnight', category: 'Public Safety', priority: 'LOW' as const, status: 'PENDING' as const, location: { lat: 28.6491, lng: 77.1217, area: 'Rajouri Garden', district: 'West Delhi' }, assignedOfficer: '6', assignedOfficerName: 'Ananya Patel', department: 'Delhi Police', slaDeadline: new Date(Date.now() + 65 * 60 * 60 * 1000).toISOString(), confidence: 0.72, createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { complaintId: 'GRV-K5Y6Z7-X5Y6', description: 'Bus shelter roof collapsed at Pragati Maidan bus stop after heavy rainfall', category: 'Road & Infrastructure', priority: 'HIGH' as const, status: 'ESCALATED' as const, location: { lat: 28.6180, lng: 77.2478, area: 'Pragati Maidan', district: 'New Delhi' }, assignedOfficer: '5', assignedOfficerName: 'Vikram Mehta', department: 'Public Works Department', slaDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), confidence: 0.91, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
];

export const dummyOfficers = [
  { _id: '1', name: 'Rajesh Kumar', department: 'Delhi Traffic Police', designation: 'Inspector', email: 'rajesh.kumar@dtp.gov.in', phone: '+91 98111 00001', pendingCount: 4, escalatedCount: 1, resolvedCount: 12, performance: 88, isActive: true },
  { _id: '2', name: 'Priya Sharma', department: 'Delhi Jal Board', designation: 'Executive Engineer', email: 'priya.sharma@djb.gov.in', phone: '+91 98111 00002', pendingCount: 5, escalatedCount: 0, resolvedCount: 18, performance: 92, isActive: true },
  { _id: '3', name: 'Amit Singh', department: 'BSES / TPDDL', designation: 'Senior Engineer', email: 'amit.singh@bses.gov.in', phone: '+91 98111 00003', pendingCount: 6, escalatedCount: 2, resolvedCount: 9, performance: 78, isActive: true },
  { _id: '4', name: 'Sunita Gupta', department: 'Municipal Corporation of Delhi', designation: 'Sanitation Officer', email: 'sunita.gupta@mcd.gov.in', phone: '+91 98111 00004', pendingCount: 5, escalatedCount: 1, resolvedCount: 14, performance: 85, isActive: true },
  { _id: '5', name: 'Vikram Mehta', department: 'Public Works Department', designation: 'Assistant Engineer', email: 'vikram.mehta@pwd.gov.in', phone: '+91 98111 00005', pendingCount: 7, escalatedCount: 2, resolvedCount: 8, performance: 72, isActive: true },
  { _id: '6', name: 'Ananya Patel', department: 'Delhi Police', designation: 'Sub Inspector', email: 'ananya.patel@dp.gov.in', phone: '+91 98111 00006', pendingCount: 3, escalatedCount: 1, resolvedCount: 16, performance: 90, isActive: true },
  { _id: '7', name: 'Deepak Verma', department: 'Delhi Traffic Police', designation: 'Sub Inspector', email: 'deepak.verma@dtp.gov.in', phone: '+91 98111 00007', pendingCount: 2, escalatedCount: 0, resolvedCount: 11, performance: 82, isActive: true },
  { _id: '8', name: 'Meera Joshi', department: 'Delhi Jal Board', designation: 'Junior Engineer', email: 'meera.joshi@djb.gov.in', phone: '+91 98111 00008', pendingCount: 3, escalatedCount: 1, resolvedCount: 7, performance: 76, isActive: true },
];

export const dummySummary = {
  total: 25,
  pending: 11,
  inProgress: 5,
  resolved: 4,
  escalated: 5,
};

export const dummyDepartmentStats = [
  { department: 'Delhi Traffic Police', count: 4 },
  { department: 'Delhi Jal Board', count: 5 },
  { department: 'BSES / TPDDL', count: 4 },
  { department: 'Municipal Corporation of Delhi', count: 4 },
  { department: 'Public Works Department', count: 5 },
  { department: 'Delhi Police', count: 3 },
];

export const dummyResolutionData = {
  averageResolutionHours: 14.3,
  trend: [
    { day: 'Mon', avgHours: 12.5, complaints: 18 },
    { day: 'Tue', avgHours: 15.2, complaints: 22 },
    { day: 'Wed', avgHours: 10.8, complaints: 15 },
    { day: 'Thu', avgHours: 18.1, complaints: 28 },
    { day: 'Fri', avgHours: 13.4, complaints: 20 },
    { day: 'Sat', avgHours: 8.7, complaints: 12 },
    { day: 'Sun', avgHours: 6.3, complaints: 8 },
  ],
};

export const dummyEscalationData = {
  rate: 20.0,
  byCategory: [
    { category: 'Road & Infrastructure', count: 2 },
    { category: 'Electricity', count: 1 },
    { category: 'Public Safety', count: 1 },
    { category: 'Sanitation', count: 1 },
  ],
};

export const dummyHeatmapData = [
  { area: 'Connaught Place', slots: [{ time: '06-09', count: 3 }, { time: '09-12', count: 8 }, { time: '12-15', count: 12 }, { time: '15-18', count: 10 }, { time: '18-21', count: 14 }, { time: '21-00', count: 5 }] },
  { area: 'Laxmi Nagar', slots: [{ time: '06-09', count: 5 }, { time: '09-12', count: 11 }, { time: '12-15', count: 7 }, { time: '15-18', count: 9 }, { time: '18-21', count: 13 }, { time: '21-00', count: 4 }] },
  { area: 'Dwarka', slots: [{ time: '06-09', count: 2 }, { time: '09-12', count: 6 }, { time: '12-15', count: 4 }, { time: '15-18', count: 8 }, { time: '18-21', count: 7 }, { time: '21-00', count: 1 }] },
  { area: 'Rohini', slots: [{ time: '06-09', count: 4 }, { time: '09-12', count: 9 }, { time: '12-15', count: 6 }, { time: '15-18', count: 11 }, { time: '18-21', count: 8 }, { time: '21-00', count: 3 }] },
  { area: 'Saket', slots: [{ time: '06-09', count: 1 }, { time: '09-12', count: 5 }, { time: '12-15', count: 9 }, { time: '15-18', count: 7 }, { time: '18-21', count: 10 }, { time: '21-00', count: 2 }] },
  { area: 'Janakpuri', slots: [{ time: '06-09', count: 3 }, { time: '09-12', count: 7 }, { time: '12-15', count: 5 }, { time: '15-18', count: 6 }, { time: '18-21', count: 9 }, { time: '21-00', count: 3 }] },
  { area: 'Karol Bagh', slots: [{ time: '06-09', count: 6 }, { time: '09-12', count: 10 }, { time: '12-15', count: 8 }, { time: '15-18', count: 12 }, { time: '18-21', count: 11 }, { time: '21-00', count: 7 }] },
  { area: 'Chandni Chowk', slots: [{ time: '06-09', count: 8 }, { time: '09-12', count: 14 }, { time: '12-15', count: 11 }, { time: '15-18', count: 9 }, { time: '18-21', count: 12 }, { time: '21-00', count: 6 }] },
  { area: 'Nehru Place', slots: [{ time: '06-09', count: 2 }, { time: '09-12', count: 7 }, { time: '12-15', count: 10 }, { time: '15-18', count: 8 }, { time: '18-21', count: 6 }, { time: '21-00', count: 1 }] },
  { area: 'Pitampura', slots: [{ time: '06-09', count: 3 }, { time: '09-12', count: 5 }, { time: '12-15', count: 4 }, { time: '15-18', count: 7 }, { time: '18-21', count: 9 }, { time: '21-00', count: 2 }] },
  { area: 'Greater Kailash', slots: [{ time: '06-09', count: 1 }, { time: '09-12', count: 4 }, { time: '12-15', count: 6 }, { time: '15-18', count: 5 }, { time: '18-21', count: 8 }, { time: '21-00', count: 3 }] },
  { area: 'Lajpat Nagar', slots: [{ time: '06-09', count: 4 }, { time: '09-12', count: 8 }, { time: '12-15', count: 7 }, { time: '15-18', count: 10 }, { time: '18-21', count: 11 }, { time: '21-00', count: 5 }] },
];

// Simulated AI categorization for frontend-only mode
const categoryKeywords: Record<string, string[]> = {
  'Traffic & Transport': ['traffic', 'accident', 'signal', 'parking', 'vehicle', 'jam', 'transport', 'bus', 'metro', 'flyover'],
  'Water Supply': ['water', 'pipeline', 'leakage', 'supply', 'tanker', 'sewage', 'drain', 'flood', 'waterlogging', 'tap'],
  'Electricity': ['electricity', 'power', 'outage', 'blackout', 'transformer', 'wire', 'electric', 'streetlight', 'current'],
  'Sanitation': ['garbage', 'waste', 'sanitation', 'cleaning', 'dump', 'smell', 'dustbin', 'trash', 'mosquito', 'stray'],
  'Road & Infrastructure': ['pothole', 'road', 'construction', 'bridge', 'footpath', 'divider', 'pavement', 'cave-in'],
  'Public Safety': ['crime', 'theft', 'harassment', 'violence', 'unsafe', 'danger', 'emergency', 'fire', 'robbery'],
};

const priorityKeywordsHigh = ['accident', 'fire', 'emergency', 'danger', 'death', 'injury', 'collapse', 'flood', 'violence', 'critical', 'urgent'];
const priorityKeywordsMed = ['broken', 'damage', 'leakage', 'outage', 'blocked', 'overflow', 'disrupted'];

const departmentMap: Record<string, string> = {
  'Traffic & Transport': 'Delhi Traffic Police',
  'Water Supply': 'Delhi Jal Board',
  'Electricity': 'BSES / TPDDL',
  'Sanitation': 'Municipal Corporation of Delhi',
  'Road & Infrastructure': 'Public Works Department',
  'Public Safety': 'Delhi Police',
  'General': 'General Administration',
};

export function simulateAI(description: string) {
  const lower = description.toLowerCase();
  let bestCat = 'General';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const kw of keywords) { if (lower.includes(kw)) score++; }
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }

  let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  for (const kw of priorityKeywordsHigh) { if (lower.includes(kw)) { priority = 'HIGH'; break; } }
  if (priority === 'LOW') {
    for (const kw of priorityKeywordsMed) { if (lower.includes(kw)) { priority = 'MEDIUM'; break; } }
  }

  const confidence = bestScore > 0 ? Math.min(0.65 + bestScore * 0.1, 0.98) : 0.45;
  const department = departmentMap[bestCat] || 'General Administration';
  const slaHours = priority === 'HIGH' ? 4 : priority === 'MEDIUM' ? 24 : 72;
  const officerPool = dummyOfficers.filter(o => o.department === department);
  const officer = officerPool.length > 0 ? officerPool[Math.floor(Math.random() * officerPool.length)] : dummyOfficers[0];
  const complaintId = `GRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    complaintId,
    description,
    category: bestCat,
    priority,
    status: 'PENDING' as const,
    department,
    assignedOfficer: officer._id,
    assignedOfficerName: officer.name,
    confidence: parseFloat(confidence.toFixed(2)),
    slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
}
