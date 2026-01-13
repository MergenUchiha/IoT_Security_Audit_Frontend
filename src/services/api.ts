import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Must match backend CORS config
  timeout: 10000, // Reduced from 30s to 10s
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only log in development mode
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
  (response: AxiosResponse) => {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const status = error.response?.status;
    const data = error.response?.data;

    console.error(`🔴 API Error: ${method} ${url}`);
    console.error('   Status:', status);
    console.error('   Error data:', data || error.message);

    // Handle 401 Unauthorized - redirect to login
    if (status === 401) {
      console.warn('⚠️  Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('⚠️  Forbidden - insufficient permissions');
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn('⚠️  Resource not found');
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      console.error('❌ Server error - please try again later');
    }

    // Handle Network Error (CORS issues)
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error - Check if backend is running and CORS is configured');
      console.error('   Backend URL:', API_URL);
      console.error('   Make sure backend is running on:', API_URL);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication API
// ============================================
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  refreshToken: () => api.post('/auth/refresh'),
};

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

  scan: (id: string) => api.post(`/devices/${id}/scan`),

  getScans: (id: string) => api.get(`/devices/${id}/scans`),
};

// ============================================
// Scans API
// ============================================
export const scansApi = {
  getAll: (params?: { deviceId?: string; status?: string }) =>
    api.get('/scans', { params }),

  getById: (id: string) => api.get(`/scans/${id}`),

  create: (data: { deviceId: string; scanType?: string }) =>
    api.post('/scans', data),

  cancel: (id: string) => api.post(`/scans/${id}/cancel`),

  getResults: (id: string) => api.get(`/scans/${id}/results`),
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
  }) => api.get('/vulnerabilities', { params }),

  getById: (id: string) => api.get(`/vulnerabilities/${id}`),

  update: (id: string, data: any) => api.put(`/vulnerabilities/${id}`, data),

  resolve: (id: string, data?: { resolution?: string; notes?: string }) =>
    api.post(`/vulnerabilities/${id}/resolve`, data),

  reopen: (id: string) => api.post(`/vulnerabilities/${id}/reopen`),

  getStatistics: () => api.get('/vulnerabilities/statistics'),
};

// ============================================
// Reports API
// ============================================
export const reportsApi = {
  getAll: () => api.get('/reports'),

  getById: (id: string) => api.get(`/reports/${id}`),

  generate: (data: {
    type: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }) => api.post('/reports', data),

  download: (id: string) => 
    api.get(`/reports/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) => api.delete(`/reports/${id}`),
};

// ============================================
// Analytics API
// ============================================
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),

  getDeviceMetrics: (deviceId: string, params?: { period?: string }) =>
    api.get(`/analytics/devices/${deviceId}`, { params }),

  getTrends: (params?: { period?: string; metric?: string }) =>
    api.get('/analytics/trends', { params }),

  getVulnerabilityTrends: (params?: { period?: string }) =>
    api.get('/analytics/vulnerabilities/trends', { params }),

  getDeviceHealth: () => api.get('/analytics/device-health'),

  getScanStatistics: (params?: { period?: string }) =>
    api.get('/analytics/scans', { params }),
};

// ============================================
// Helper Functions
// ============================================

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // CORS or Network Error
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
    
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection and backend server';
    }
  }
  
  return 'An unexpected error occurred';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): any => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set authentication token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Clear authentication
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 3000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export default api;