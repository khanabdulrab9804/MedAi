const API_BASE = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT_MS = 45000;
const TOKEN_KEY = 'medai-auth-token';
const USER_KEY = 'medai-auth-user';

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('medai-auth-cleared'));
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = options.token ?? getStoredToken();

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        clearStoredAuth();
        throw new Error(data.message || 'Session expired. Please sign in again.');
      }
      const detail = data.errors?.[0]?.msg;
      if (res.status >= 500 && !data.message && !detail) {
        throw new Error(
          'Server unavailable. Wait a moment and refresh, or run: npm run dev:backend'
        );
      }
      throw new Error(detail || data.message || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Request timed out. Make sure the backend is running on port 5000 (npm run dev:backend).'
      );
    }
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(
        'Cannot reach the server. Start the backend: cd backend && npm run dev'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  health: () => request('/health'),

  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getMe: (token) => request('/auth/me', { token }),

  searchMedicines: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/medicines?${qs}`);
  },

  getMedicine: (id) => request(`/medicines/${id}`),

  getAllMedicines: () => request('/medicines/all'),

  sendChat: (body) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getChatHistory: (sessionId) => request(`/chat/history/${sessionId}`),

  updateProfile: (body) =>
    request('/profile/me', { method: 'PATCH', body: JSON.stringify(body) }),

  getMyMedicines: () => request('/my-medicines'),
  addMyMedicine: (body) =>
    request('/my-medicines', { method: 'POST', body: JSON.stringify(body) }),
  removeMyMedicine: (id) => request(`/my-medicines/${id}`, { method: 'DELETE' }),

  getReminders: () => request('/reminders'),
  createReminder: (body) =>
    request('/reminders', { method: 'POST', body: JSON.stringify(body) }),
  markReminderTaken: (id) => request(`/reminders/${id}/taken`, { method: 'PATCH' }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  checkInteractions: (drugs) =>
    request('/tools/interactions', { method: 'POST', body: JSON.stringify({ drugs }) }),
  calculateDose: (body) =>
    request('/tools/dose-calculator', { method: 'POST', body: JSON.stringify(body) }),

  submitFeedback: (body) =>
    request('/feedback', { method: 'POST', body: JSON.stringify(body) }),

  exportChat: (sessionId, format = 'json') =>
    request(`/reports/chat/${sessionId}?format=${format}`),

  getAnalyticsOverview: () => request('/analytics/overview'),
  getDetailedAnalytics: () => request('/analytics/detailed'),
  getRagComparison: () => request('/analytics/rag-comparison'),
  getAnalyticsUsers: () => request('/analytics/users'),

  runTriage: (symptoms) =>
    request('/triage', { method: 'POST', body: JSON.stringify({ symptoms }) }),

  getDoctorPatients: () => request('/doctor/patients'),

  scanPrescription: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}/prescriptions/scan`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Scan failed');
    return data;
  },

  uploadPrescription: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  uploadKbPdf: async (secret, file, category) => {
    const form = new FormData();
    form.append('file', file);
    if (category) form.append('category', category);
    const res = await fetch(`${API_BASE}/upload-kb`, {
      method: 'POST',
      headers: { 'X-Admin-Secret': secret },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  getKbStatus: (secret) =>
    request('/upload-kb/status', { headers: { 'X-Admin-Secret': secret } }),

  admin: {
    listMedicines: (secret) =>
      request('/admin/medicines', {
        headers: { 'X-Admin-Secret': secret },
      }),
    createMedicine: (secret, body) =>
      request('/admin/medicines', {
        method: 'POST',
        headers: { 'X-Admin-Secret': secret },
        body: JSON.stringify(body),
      }),
    uploadJson: async (secret, file) => {
      const form = new FormData();
      form.append('file', file);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(`${API_BASE}/admin/medicines/upload`, {
          method: 'POST',
          headers: { 'X-Admin-Secret': secret },
          body: form,
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    deleteMedicine: (secret, id) =>
      request(`/admin/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Secret': secret },
      }),
  },
};
