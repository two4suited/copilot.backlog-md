import axios from 'axios';

// Empty string → relative paths → Vite proxy forwards to the API.
// VITE_API_URL should be left empty in .env.development.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  conferences: {
    list: () => apiClient.get('/api/conferences').then(r =>
      Array.isArray(r.data) ? r.data : (r.data.items ?? r.data)),
    get: (id: string) => apiClient.get(`/api/conferences/${id}`).then(r => r.data),
    create: (data: unknown) => apiClient.post('/api/conferences', data).then(r => r.data),
    update: (id: string, data: unknown) => apiClient.put(`/api/conferences/${id}`, data).then(r => r.data),
    delete: (id: string) => apiClient.delete(`/api/conferences/${id}`).then(r => r.data),
  },
  tracks: {
    list: (conferenceId: string) => apiClient.get(`/api/conferences/${conferenceId}/tracks`).then(r => r.data),
    get: (conferenceId: string, trackId: string) =>
      apiClient.get(`/api/conferences/${conferenceId}/tracks/${trackId}`).then(r => r.data),
    create: (conferenceId: string, data: unknown) => apiClient.post(`/api/conferences/${conferenceId}/tracks`, data).then(r => r.data),
    update: (conferenceId: string, trackId: string, data: unknown) => apiClient.put(`/api/conferences/${conferenceId}/tracks/${trackId}`, data).then(r => r.data),
    delete: (conferenceId: string, trackId: string) => apiClient.delete(`/api/conferences/${conferenceId}/tracks/${trackId}`).then(r => r.data),
  },
  sessions: {
    list: (trackId?: string) => apiClient.get('/api/sessions', { params: { trackId } }).then(r => r.data),
    listByConference: (conferenceId: string) =>
      apiClient.get('/api/sessions', { params: { conferenceId } }).then(r => r.data),
    listAll: () => apiClient.get('/api/sessions').then(r => r.data),
    get: (id: string) => apiClient.get(`/api/sessions/${id}`).then(r => r.data),
    register: (id: string) => apiClient.post(`/api/sessions/${id}/register`).then(r => r.data),
    unregister: (id: string) => apiClient.delete(`/api/sessions/${id}/register`).then(r => r.data),
    create: (data: unknown) => apiClient.post('/api/sessions', data).then(r => r.data),
    update: (id: string, data: unknown) => apiClient.put(`/api/sessions/${id}`, data).then(r => r.data),
    updateSpeakers: (id: string, speakerIds: string[]) => apiClient.put(`/api/sessions/${id}/speakers`, { speakerIds }).then(r => r.data),
    delete: (id: string) => apiClient.delete(`/api/sessions/${id}`).then(r => r.data),
  },
  registrations: {
    register: (sessionId: string) => apiClient.post(`/api/sessions/${sessionId}/register`).then(r => r.data),
    cancel: (sessionId: string) => apiClient.delete(`/api/sessions/${sessionId}/register`),
    myRegistrations: () => apiClient.get('/api/users/me/registrations').then(r => r.data),
  },
  speakers: {
    list: () => apiClient.get('/api/speakers').then(r => r.data),
    get: (id: string) => apiClient.get(`/api/speakers/${id}`).then(r => r.data),
    create: (data: unknown) => apiClient.post('/api/speakers', data).then(r => r.data),
    update: (id: string, data: unknown) => apiClient.put(`/api/speakers/${id}`, data).then(r => r.data),
    delete: (id: string) => apiClient.delete(`/api/speakers/${id}`).then(r => r.data),
  },
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/api/auth/login', { email, password }).then(r => r.data),
    register: (data: unknown) => apiClient.post('/api/auth/register', data).then(r => r.data),
  },
  ratings: {
    submit: (sessionId: string, stars: number, comment?: string) =>
      apiClient.post(`/api/sessions/${sessionId}/ratings`, { stars, comment }).then(r => r.data),
    getSummary: (sessionId: string) =>
      apiClient.get(`/api/sessions/${sessionId}/ratings/summary`).then(r => r.data),
    getMine: (sessionId: string) =>
      apiClient.get(`/api/sessions/${sessionId}/ratings/mine`).then(r => r.data),
  },
};
