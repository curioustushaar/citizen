export const CATEGORIES = [
  'Traffic & Transport',
  'Water Supply',
  'Electricity',
  'Sanitation',
  'Road & Infrastructure',
  'Public Safety',
  'General',
] as const;

export const DELHI_DISTRICTS = [
  'Central Delhi',
  'East Delhi',
  'New Delhi',
  'North Delhi',
  'North East Delhi',
  'North West Delhi',
  'Shahdara',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'West Delhi',
] as const;

export const PRIORITY_COLORS = {
  HIGH: { bg: 'bg-danger-500/20', text: 'text-danger-400', border: 'border-danger-500/30', dot: 'bg-danger-500' },
  MEDIUM: { bg: 'bg-warning-500/20', text: 'text-warning-400', border: 'border-warning-500/30', dot: 'bg-warning-500' },
  LOW: { bg: 'bg-success-500/20', text: 'text-success-400', border: 'border-success-500/30', dot: 'bg-success-500' },
} as const;

export const STATUS_COLORS = {
  PENDING: { bg: 'bg-warning-500/20', text: 'text-warning-400', label: 'Pending' },
  IN_PROGRESS: { bg: 'bg-primary-500/20', text: 'text-primary-400', label: 'In Progress' },
  RESOLVED: { bg: 'bg-success-500/20', text: 'text-success-400', label: 'Resolved' },
  ESCALATED: { bg: 'bg-danger-500/20', text: 'text-danger-400', label: 'Escalated' },
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Traffic & Transport': '🚗',
  'Water Supply': '💧',
  'Electricity': '⚡',
  'Sanitation': '🗑️',
  'Road & Infrastructure': '🛣️',
  'Public Safety': '🛡️',
  'General': '📋',
};

export const DEPARTMENT_COLORS: Record<string, string> = {
  'Delhi Traffic Police': '#3b82f6',
  'Delhi Jal Board': '#06b6d4',
  'BSES / TPDDL': '#f59e0b',
  'Municipal Corporation of Delhi': '#22c55e',
  'Public Works Department': '#8b5cf6',
  'Delhi Police': '#ef4444',
  'General Administration': '#64748b',
};

export const AI_INSIGHTS = [];

export const DELHI_CENTER = { lat: 28.6139, lng: 77.209 } as const;
