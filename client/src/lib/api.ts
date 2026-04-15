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
        message: result.error || result.message || `HTTP error ${res.status}`,
      };
    }
    return result;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, data: null as T, message: 'Backend unavailable' };
  }
}

export const api = {
  // ── Complaints ──────────────────────────────────────────
  getComplaints: async (params?: string) => {
    return await fetchApi<any[]>(`/complaints${params ? `?${params}` : ''}`);
  },

  getComplaint: async (id: string) => {
    return await fetchApi<any>(`/complaints/${id}`);
  },

  createComplaint: async (data: any) => {
    return await fetchApi<any>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateComplaint: async (id: string, data: any) => {
    return await fetchApi<any>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: string, remarks?: string) => {
    return await fetchApi<any>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  },

  addFeedback: async (id: string, satisfied: boolean, comment: string) => {
    return await fetchApi<any>(`/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ satisfied, comment }),
    });
  },

  // ── Officers ────────────────────────────────────────────
  getOfficers: async () => {
    const res = await fetchApi<any[]>('/officers');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  // ── Analytics ───────────────────────────────────────────
  getSummary: async () => {
    return await fetchApi<any>('/analytics/summary');
  },

  getDepartmentStats: async () => {
    return await fetchApi<any[]>('/analytics/department');
  },

  getResolutionStats: async () => {
    return await fetchApi<any>('/analytics/resolution');
  },

  getEscalationStats: async () => {
    return await fetchApi<any>('/analytics/escalation');
  },

  getHeatmap: async () => {
    return await fetchApi<any[]>('/analytics/heatmap');
  },

  getAIInsights: async () => {
    return await fetchApi<any[]>('/analytics/insights');
  },

  // ── Users (SUPER_ADMIN) ─────────────────────────────────
  getUsers: async () => {
    return await fetchApi<any[]>('/users');
  },

  createUser: async (data: any) => {
    return await fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  },

  updateUser: async (id: string, data: any) => {
    return await fetchApi<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  deleteUser: async (id: string) => {
    return fetchApi<any>(`/users/${id}`, { method: 'DELETE' });
  },

  // ── User Profile (Self) ─────────────────────────────────
  getMe: async () => {
    return await fetchApi<any>('/users/me');
  },

  updateProfile: async (data: any) => {
    return await fetchApi<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ── SLA Config (SUPER_ADMIN) ────────────────────────────
  getSLAConfigs: async () => {
    return await fetchApi<any[]>('/sla');
  },

  updateSLAConfig: async (id: string, data: any) => {
    return await fetchApi<any>(`/sla/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // ── Audit Logs (SUPER_ADMIN) ────────────────────────────
  getAuditLogs: async (params?: string) => {
    return await fetchApi<any[]>(`/audit-logs${params ? `?${params}` : ''}`);
  },

  // ── Notifications ──────────────────────────────────────
  getNotifications: async () => {
    return await fetchApi<any[]>('/notifications');
  },

  markNotificationAsRead: async (id: string) => {
    return await fetchApi<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsAsRead: async () => {
    return await fetchApi<any>('/notifications/read-all', { method: 'PATCH' });
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('grievance_token') : null;
    const res = await fetch('/api/users/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return await res.json();
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

  // ── Simulate Crisis ────────────────────────────────────
  simulateCrisis: async () => {
    return await fetchApi<any>('/simulate', { method: 'POST' });
  },
};
