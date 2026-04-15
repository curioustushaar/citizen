// ============================================================
// Simulated AI Service — keyword-based categorization & routing
// ============================================================

const categoryKeywords: Record<string, string[]> = {
  'Traffic & Transport': [
    'traffic', 'accident', 'road block', 'signal', 'parking',
    'vehicle', 'jam', 'transport', 'bus', 'metro', 'auto', 'cab',
    'rickshaw', 'congestion', 'flyover', 'highway',
  ],
  'Water Supply': [
    'water', 'pipeline', 'leakage', 'supply', 'tanker', 'sewage',
    'drain', 'flood', 'waterlogging', 'borewell', 'contaminated',
    'dirty water', 'no water', 'tap',
  ],
  'Electricity': [
    'electricity', 'power', 'outage', 'blackout', 'transformer',
    'wire', 'electric', 'voltage', 'pole', 'meter', 'streetlight',
    'light', 'current', 'short circuit',
  ],
  'Sanitation': [
    'garbage', 'waste', 'sanitation', 'cleaning', 'dump', 'smell',
    'hygiene', 'sweeping', 'dustbin', 'trash', 'filth', 'mosquito',
    'pest', 'stray dog', 'stray animal',
  ],
  'Road & Infrastructure': [
    'pothole', 'road damage', 'construction', 'bridge', 'footpath',
    'divider', 'pavement', 'broken road', 'crack', 'barricade',
    'under construction', 'cement', 'asphalt',
  ],
  'Public Safety': [
    'crime', 'theft', 'harassment', 'violence', 'unsafe', 'danger',
    'emergency', 'fire', 'robbery', 'assault', 'missing', 'kidnap',
    'drug', 'illegal', 'encroachment',
  ],
};

const departmentMapping: Record<string, string> = {
  'Traffic & Transport': 'Delhi Traffic Police',
  'Water Supply': 'Delhi Jal Board',
  'Electricity': 'BSES / TPDDL',
  'Sanitation': 'Municipal Corporation of Delhi',
  'Road & Infrastructure': 'Public Works Department',
  'Public Safety': 'Delhi Police',
  'General': 'General Administration',
};

const priorityKeywords = {
  HIGH: [
    'accident', 'fire', 'emergency', 'danger', 'death', 'injury',
    'collapse', 'flood', 'violence', 'critical', 'urgent', 'severe',
    'explosion', 'electrocution', 'drowning', 'major',
  ],
  MEDIUM: [
    'broken', 'damage', 'leakage', 'outage', 'blocked', 'overflow',
    'complaint', 'issue', 'problem', 'disrupted', 'irregular',
  ],
  LOW: [
    'request', 'suggestion', 'minor', 'small', 'general', 'inquiry',
    'feedback', 'improve',
  ],
};

export function detectCategory(description: string): { category: string; confidence: number } {
  const lower = description.toLowerCase();
  let bestCategory = 'General';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const confidence = bestScore > 0
    ? Math.min(0.65 + bestScore * 0.1, 0.98)
    : 0.45;

  return { category: bestCategory, confidence: parseFloat(confidence.toFixed(2)) };
}

export function detectPriority(description: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const lower = description.toLowerCase();

  for (const keyword of priorityKeywords.HIGH) {
    if (lower.includes(keyword)) return 'HIGH';
  }
  for (const keyword of priorityKeywords.MEDIUM) {
    if (lower.includes(keyword)) return 'MEDIUM';
  }
  return 'LOW';
}

export function getDepartment(category: string): string {
  return departmentMapping[category] || 'General Administration';
}

export function calculateSLA(priority: 'HIGH' | 'MEDIUM' | 'LOW'): Date {
  const now = new Date();
  const hours = priority === 'HIGH' ? 4 : priority === 'MEDIUM' ? 24 : 72;
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function generateComplaintId(): string {
  const prefix = 'GRV';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}
