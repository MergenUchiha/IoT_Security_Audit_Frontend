import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

export const api = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const status = error.response?.status;

    console.error(`🔴 API Error: ${method} ${url} - Status: ${status}`);

    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ============================================
// Devices API
// ============================================
export const devicesApi = {
  getAll: (params?: { status?: string; type?: string; search?: string }) =>
    api.get('/devices', { params }),

  getById: (id: string) => api.get(`/devices/${id}`),

  create: (data: any) => api.post('/devices', data),

  update: (id: string, data: any) => api.put(`/devices/${id}`, data),

  delete: (id: string) => api.delete(`/devices/${id}`),

  getVulnerabilities: (id: string) => api.get(`/devices/${id}/vulnerabilities`),
};

// ============================================
// Scans API
// ============================================
export const scansApi = {
  getAll: (params?: { deviceId?: string; status?: string }) =>
    api.get('/scans', { params }),

  getById: (id: string) => api.get(`/scans/${id}`),

  create: (data: { deviceId: string; scanType?: string }) =>
    api.post('/scans/start', { deviceId: data.deviceId, type: data.scanType || 'full' }),

  stop: (id: string) => api.post(`/scans/${id}/stop`),
};

// ============================================
// Vulnerabilities API
// ============================================
export const vulnerabilitiesApi = {
  getAll: (params?: { 
    severity?: string; 
    status?: string; 
    deviceId?: string;
    search?: string;
    device?: string;
  }) => api.get('/vulnerabilities', { params }),

  getById: (id: string) => api.get(`/vulnerabilities/${id}`),

  getStats: () => api.get('/vulnerabilities/stats/summary'),
};

// ============================================
// Reports API
// ============================================
export const reportsApi = {
  getAll: () => api.get('/reports'),

  getById: (id: string) => api.get(`/reports/${id}`),

  generate: (type: string) => api.post('/reports/generate', { type }),

  downloadPdf: (id: string) => 
    api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
};

// ============================================
// Analytics API
// ============================================
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),

  getMetrics: () => api.get('/analytics/metrics'),

  getTraffic: () => api.get('/analytics/traffic'),

  getTrends: () => api.get('/analytics/trends'),

  getActivity: () => api.get('/analytics/activity'),
};

// ============================================
// Helper Functions
// ============================================

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Please check if backend is running on http://localhost:3001';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    
    if (error.response?.status === 500) {
      return 'Server error. Please try again later';
    }
  }
  
  return 'An unexpected error occurred';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): any => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;