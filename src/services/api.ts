import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Job endpoints
export const jobAPI = {
  getAllJobs: (params?: any) => api.get('/jobs', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
  updateJob: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  getEmployerJobs: () => api.get('/jobs/employer/my-jobs'),
};

// Application endpoints
export const applicationAPI = {
  applyForJob: (data: any) => api.post('/applications', data),
  getCandidateApplications: () => api.get('/applications/candidate/my-applications'),
  getJobApplications: (jobId: string) => api.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (id: string, status: string) => 
    api.put(`/applications/${id}/status`, { status }),
  deleteApplication: (id: string) => api.delete(`/applications/${id}`),
};

// User endpoints
export const userAPI = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  getUserById: (id: string) => api.get(`/users/${id}`),
};

export default api;
