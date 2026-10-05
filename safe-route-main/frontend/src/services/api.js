// api.js — Women Safe Route
// ✅ All endpoints wired. UserController.java must be present on backend.

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto logout on 401
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Saves to MySQL: users table
export const authApi = {
  register: d => api.post('/auth/register', d),
  login:    d => api.post('/auth/login', d),
};

// ─── Route ────────────────────────────────────────────────────────────────────
// Saves to MySQL: routes table (on analyze), safe_zones table (on addSafeZone)
export const routeApi = {
  analyze:     d         => api.post('/route/analyze', d),
  history:     ()        => api.get('/route/history'),
  safeZones:   ()        => api.get('/route/safe-zones'),
  dangerZones: ()        => api.get('/route/danger-zones'),
  nearbySafe:  (lat,lng) => api.get(`/route/nearby-safe?lat=${lat}&lng=${lng}`),

  // ✅ FIX 3: This was defined but never called from SafeZonesPage.jsx
  // Wire it by importing and calling routeApi.addSafeZone(formData) from your page
  addSafeZone: d => api.post('/route/safe-zones', d),
};

// ─── SOS ──────────────────────────────────────────────────────────────────────
// Saves to MySQL: sos_alerts table
export const sosApi = {
  trigger: d  => api.post('/sos/trigger', d),
  resolve: id => api.put(`/sos/${id}/resolve`),
  my:      () => api.get('/sos/my'),
  active:  () => api.get('/sos/active'),
};

// ─── Incidents ────────────────────────────────────────────────────────────────
// Saves to MySQL: incidents table
export const incidentApi = {
  report: d  => api.post('/incidents', d),
  my:     () => api.get('/incidents/my'),
  all:    () => api.get('/incidents'),
  updateStatus: (id, status) => api.put(`/incidents/${id}/status?status=${status}`),
};

// ─── User Profile + Emergency Contacts ───────────────────────────────────────
// Saves to MySQL: users table (profile), emergency_contacts table (contacts)
// ✅ FIX 2: These were calling non-existent endpoints — UserController.java now handles them
export const userApi = {
  profile:       ()  => api.get('/users/profile'),
  updateProfile: d   => api.put('/users/profile', d),
  contacts:      ()  => api.get('/users/contacts'),
  addContact:    d   => api.post('/users/contacts', d),
  deleteContact: id  => api.delete(`/users/contacts/${id}`),
};

export default api;