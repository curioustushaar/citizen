import {
  dummyComplaints,
  dummyOfficers,
  dummySummary,
  dummyDepartmentStats,
  dummyResolutionData,
  dummyEscalationData,
  dummyHeatmapData,
  simulateAI,
} from './dummyData';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('grievance_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options,
    });
    
    const result = await res.json();
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('grievance_token');
        localStorage.removeItem('grievance_user');
        window.location.href = '/login';
      }
      return { success: false, data: null as T, message: 'Session expired. Please login again.' };
    }
    
    if (!res.ok) {
      return { 
        success: false, 
        data: null as T, 
        message: result.error || result.message || `HTTP error ${res.status}` 
      };
    }
    return result;
  } catch (err) {
    return { success: false, data: null as T, message: 'Backend unavailable' };
  }
}

// In-memory store for frontend-only mode
let localComplaints: any[] = [];

export const api = {
  // ── Complaints ──────────────────────────────────────────
  getComplaints: async (params?: string) => {
    const res = await fetchApi<any[]>(`/complaints${params ? `?${params}` : ''}`);
    if (res.success && res.data) return res;
    // Frontend-only: filter locally
    if (params?.includes('userId=')) {
      const userId = params.split('userId=')[1]?.split('&')[0];
      if (userId && userId.startsWith('demo-')) {
        return { success: true, data: localComplaints };
      }
    }
    return { success: true, data: localComplaints };
  },

  getComplaint: async (id: string) => {
    const res = await fetchApi<any>(`/complaints/${id}`);
    if (res.success && res.data) return res;
    const found = localComplaints.find((c) => c.complaintId === id);
    return { success: !!found, data: found || null };
  },

  createComplaint: async (data: any) => {
    const res = await fetchApi<any>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data) return res;
    const processed = simulateAI(data.description);
    const complaint = {
      ...processed,
      location: data.location || {
        lat: 28.6139 + (Math.random() - 0.5) * 0.15,
        lng: 77.209 + (Math.random() - 0.5) * 0.15,
        area: 'Unknown Area',
        district: 'New Delhi',
      },
      userId: data.userId || null,
      userName: data.userName || 'Anonymous',
      notes: [],
      feedback: null,
    };
    localComplaints = [complaint, ...localComplaints];
    return { success: true, data: complaint };
  },

  updateComplaint: async (id: string, data: any) => {
    const res = await fetchApi<any>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res.success && res.data) return res;
    localComplaints = localComplaints.map((c) =>
      c.complaintId === id ? { ...c, ...data } : c
    );
    const updated = localComplaints.find((c) => c.complaintId === id);
    return { success: true, data: updated };
  },

  updateStatus: async (id: string, status: string, remarks?: string) => {
    const res = await fetchApi<any>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
    if (res.success && res.data) return res;
    localComplaints = localComplaints.map((c) =>
      c.complaintId === id ? { ...c, status, resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : c.resolvedAt } : c
    );
    return { success: true, data: localComplaints.find((c) => c.complaintId === id) };
  },

  addFeedback: async (id: string, satisfied: boolean, comment: string) => {
    const res = await fetchApi<any>(`/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ satisfied, comment }),
    });
    if (res.success && res.data) return res;
    localComplaints = localComplaints.map((c) =>
      c.complaintId === id ? { ...c, feedback: { satisfied, comment, submittedAt: new Date().toISOString() }, status: satisfied ? c.status : 'ESCALATED' } : c
    );
    return { success: true, data: localComplaints.find((c) => c.complaintId === id) };
  },

  // ── Officers ────────────────────────────────────────────
  getOfficers: async () => {
    const res = await fetchApi<any[]>('/officers');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  // ── Analytics ───────────────────────────────────────────
  getSummary: async () => {
    const res = await fetchApi<any>('/analytics/summary');
    if (res.success && res.data) return res;
    const total = localComplaints.length;
    const pending = localComplaints.filter((c) => c.status === 'PENDING').length;
    const inProgress = localComplaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = localComplaints.filter((c) => c.status === 'RESOLVED').length;
    const escalated = localComplaints.filter((c) => c.status === 'ESCALATED').length;
    return { success: true, data: { total, pending, inProgress, resolved, escalated } };
  },

  getDepartmentStats: async () => {
    return fetchApi<any[]>('/analytics/department');
  },

  getResolutionStats: async () => {
    return fetchApi<any>('/analytics/resolution');
  },

  getEscalationStats: async () => {
    return fetchApi<any>('/analytics/escalation');
  },

  getHeatmap: async () => {
    return fetchApi<any[]>('/analytics/heatmap');
  },

  getAIInsights: async () => {
    return fetchApi<any[]>('/analytics/insights');
  },

  // ── Users (SUPER_ADMIN) ─────────────────────────────────
  getUsers: async () => {
    const res = await fetchApi<any[]>('/users');
    if (res.success && res.data) return res;
    return { success: false, data: [] };
  },

  createUser: async (data: any) => {
    return fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  },

  updateUser: async (id: string, data: any) => {
    return fetchApi<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // ── SLA Config (SUPER_ADMIN) ────────────────────────────
  getSLAConfigs: async () => {
    const res = await fetchApi<any[]>('/sla');
    if (res.success && res.data) return res;
    return { success: false, data: [] };
  },

  updateSLAConfig: async (id: string, data: any) => {
    return fetchApi<any>(`/sla/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // ── Audit Logs (SUPER_ADMIN) ────────────────────────────
  getAuditLogs: async (params?: string) => {
    const res = await fetchApi<any[]>(`/audit-logs${params ? `?${params}` : ''}`);
    if (res.success && res.data) return res;
    return { success: false, data: [] };
  },

  // ── Departments (SUPER_ADMIN) ───────────────────────────
  getDepartments: async () => {
    const res = await fetchApi<any[]>('/departments');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  createDepartment: async (data: any) => {
    return fetchApi<any>('/departments', { method: 'POST', body: JSON.stringify(data) });
  },

  updateDepartment: async (id: string, data: any) => {
    return fetchApi<any>(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deleteDepartment: async (id: string) => {
    return fetchApi<any>(`/departments/${id}`, { method: 'DELETE' });
  },

  updateUser: async (id: string, data: any) => {
    return fetchApi<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deleteUser: async (id: string) => {
    return fetchApi<any>(`/users/${id}`, { method: 'DELETE' });
  },

  // ── Simulate Crisis ────────────────────────────────────
  simulateCrisis: async () => {
    const res = await fetchApi<any>('/simulate', { method: 'POST' });
    if (res.success && res.data) return res;
    const crisisDescriptions = [
      'Major fire reported in Chandni Chowk market area, multiple shops affected',
      'Severe waterlogging on NH-24 near Laxmi Nagar, traffic at standstill',
      'Gas pipeline leak detected near Dwarka Sector 21 metro station',
      'Building collapse reported in Rohini Sector 7, emergency rescue needed',
      'Multiple vehicle accident on Ring Road near AIIMS causing major disruption',
      'Complete power outage in Janakpuri district affecting hospitals',
      'Toxic chemical spill from overturned tanker near Wazirpur Industrial Area',
      'Road cave-in near Connaught Place outer circle disrupting metro services',
    ];
    const areas = [
      { area: 'Chandni Chowk', district: 'Central Delhi', lat: 28.6507, lng: 77.2334 },
      { area: 'Laxmi Nagar', district: 'East Delhi', lat: 28.6304, lng: 77.2773 },
      { area: 'Dwarka', district: 'South West Delhi', lat: 28.5571, lng: 77.0588 },
      { area: 'Rohini', district: 'North West Delhi', lat: 28.7158, lng: 77.0695 },
      { area: 'AIIMS', district: 'South Delhi', lat: 28.5672, lng: 77.2100 },
      { area: 'Janakpuri', district: 'West Delhi', lat: 28.6219, lng: 77.0864 },
      { area: 'Wazirpur', district: 'North West Delhi', lat: 28.6969, lng: 77.1602 },
      { area: 'Connaught Place', district: 'New Delhi', lat: 28.6315, lng: 77.2167 },
    ];

    const count = Math.floor(Math.random() * 4) + 5;
    const shuffled = [...crisisDescriptions].sort(() => Math.random() - 0.5).slice(0, count);
    const newComplaints = shuffled.map((desc, i) => {
      const loc = areas[i % areas.length];
      const processed = simulateAI(desc);
      return {
        ...processed,
        location: {
          lat: loc.lat + (Math.random() - 0.5) * 0.01,
          lng: loc.lng + (Math.random() - 0.5) * 0.01,
          area: loc.area,
          district: loc.district,
        },
        notes: [],
        feedback: null,
      };
    });

    localComplaints = [...newComplaints, ...localComplaints];
    return {
      success: true,
      message: `🚨 Crisis simulated! ${newComplaints.length} complaints generated.`,
      data: newComplaints,
    };
  },
};
