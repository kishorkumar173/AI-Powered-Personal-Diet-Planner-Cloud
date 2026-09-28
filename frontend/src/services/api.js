/**
 * Centralized API Service for NutriCloud AI Client
 * Manages JWT Bearer authentication, HTTP requests, and backend communication.
 */

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || 'https://ai-powered-personal-diet-planner-cloud.onrender.com').replace(/\/+$/, '');
}

export function setCustomApiUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('nutricloud_api_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('nutricloud_api_url');
  }
}

function getAuthHeaders(isMultipart = false) {
  const token = localStorage.getItem('nutricloud_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    if (url.includes('localhost')) {
      throw new Error(
        `The app is attempting to connect to "${url}". Because this site is on Vercel, please connect your live cloud backend URL.`
      );
    }
    throw new Error(
      `Unable to reach backend at "${url}". If hosted on Render free tier, the server may be waking up (please wait 30 seconds and retry).`
    );
  }

  if (response.status === 401) {
    // Unauthorized: clear token and redirect if needed
    localStorage.removeItem('nutricloud_token');
    localStorage.removeItem('nutricloud_user');
  }

  if (response.status === 204) {
    return true;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || 'An unexpected error occurred with the cloud service.';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Authentication
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    request('/api/auth/me', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  // User Profile
  getProfile: () =>
    request('/api/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  updateProfile: (payload) =>
    request('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }),

  // AI Diet Recommendation Engine
  generatePlan: (payload = {}) =>
    request('/api/diet/generate-plan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }),

  savePlan: (payload) =>
    request('/api/diet/plans', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }),

  listPlans: () =>
    request('/api/diet/plans', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  getPlanById: (planId) =>
    request(`/api/diet/plans/${planId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  deletePlan: (planId) =>
    request(`/api/diet/plans/${planId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  getExportUrl: (planId) => `${API_BASE_URL}/api/diet/plans/${planId}/export`,

  // Cloud Object Storage
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/files/upload', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
  },

  listFiles: () =>
    request('/api/files', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),

  deleteFile: (fileId) =>
    request(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  getFileDownloadUrl: (fileId) => `${getApiBaseUrl()}/api/files/${fileId}/download`,

  // Dynamic Backend Config
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setCustomApiUrl,

  // Dashboard Aggregation
  getDashboardMetrics: () =>
    request('/api/dashboard', {
      method: 'GET',
      headers: getAuthHeaders(),
    }),
};
