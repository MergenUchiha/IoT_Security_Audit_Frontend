import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }

    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => 
    api.post('/auth/register', { email, password, name }),
  getProfile: () => api.get('/auth/profile'),
};

// ============================================
// DEVICES API
// ============================================
export const devicesApi = {
  getAll: () => api.get('/devices'),
  getOne: (id: string) => api.get(`/devices/${id}`),
  create: (data: any) => api.post('/devices', data),
  update: (id: string, data: any) => api.put(`/devices/${id}`, data),
  delete: (id: string) => api.delete(`/devices/${id}`),
  getVulnerabilities: (id: string) => api.get(`/devices/${id}/vulnerabilities`),
};

// ============================================
// SCANS API
// ============================================
export const scansApi = {
  start: (data: { deviceId: string; type: string }) => api.post('/scans/start', data),
  stop: (id: string) => api.post(`/scans/${id}/stop`),
  getAll: () => api.get('/scans'),
  getOne: (id: string) => api.get(`/scans/${id}`),
};

// ============================================
// VULNERABILITIES API
// ============================================
export const vulnerabilitiesApi = {
  getAll: (params?: { severity?: string; device?: string }) => 
    api.get('/vulnerabilities', { params }),
  getOne: (id: string) => api.get(`/vulnerabilities/${id}`),
  getStats: () => api.get('/vulnerabilities/stats/summary'),
};

// ============================================
// REPORTS API
// ============================================
export const reportsApi = {
  generate: (type: 'technical' | 'executive' | 'compliance') => 
    api.post('/reports/generate', { type }),
  getAll: () => api.get('/reports'),
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMetrics: () => api.get('/analytics/metrics'),
  getTraffic: () => api.get('/analytics/traffic'),
  getTrends: () => api.get('/analytics/trends'),
  getActivity: () => api.get('/analytics/activity'),
};