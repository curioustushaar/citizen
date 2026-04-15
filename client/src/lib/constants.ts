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

export const AI_INSIGHTS = [
  { text: 'Traffic complaints increased by 32% in East Delhi this week', type: 'warning' as const, icon: '📈' },
  { text: 'Water supply issues detected in Dwarka cluster — possible pipeline fault', type: 'danger' as const, icon: '🔍' },
  { text: 'Sanitation complaints reduced by 18% after MCD drive in South Delhi', type: 'success' as const, icon: '✅' },
  { text: 'Electricity outages correlated with transformer overload in Rohini area', type: 'info' as const, icon: '⚡' },
  { text: 'Predicted: 40% increase in waterlogging complaints due to upcoming monsoon', type: 'warning' as const, icon: '🌧️' },
  { text: 'Road infrastructure complaints highest during 6PM–9PM peak hours', type: 'info' as const, icon: '🕐' },
  { text: 'AI detected unusual spike in public safety complaints near Daryaganj', type: 'danger' as const, icon: '🚨' },
  { text: 'Average resolution time improved by 2.3 hours compared to last month', type: 'success' as const, icon: '⏱️' },
];

export const DELHI_CENTER = { lat: 28.6139, lng: 77.209 } as const;
