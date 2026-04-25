
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pg_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pg_token', res.data.token);
    localStorage.setItem('pg_user', JSON.stringify(res.data.user));
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('pg_token', res.data.token);
    localStorage.setItem('pg_user', JSON.stringify(res.data.user));
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('pg_token');
    localStorage.removeItem('pg_user');
  },
  getCurrentUser: () => {
    const u = localStorage.getItem('pg_user');
    return u ? JSON.parse(u) : null;
  },
};


export const uploadService = {
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const token = localStorage.getItem('pg_token');
    const res = await axios.post(
      (import.meta.env.VITE_API_URL || 'http://localhost:5000/v1') + '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.urls;
  },
  deleteImage: async (url) => {
    await api.delete('/upload', { data: { url } });
  },
};

// ── PG LISTINGS ───────────────────────────────────────────────────────

export const pgService = {
  getAll: async (filters = {}) => {
    const res = await api.get('/pgs', { params: filters });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/pgs/${id}`);
    return res.data;
  },

  getMyListings: async () => {
    const res = await api.get('/pgs/my-listings'); // ✅ correct
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/pgs', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/pgs/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/pgs/${id}`);
    return res.data;
  },
};

// ── BOOKINGS ──────────────────────────────────────────────────────────
export const bookingService = {
  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data;
  },
  getOwnerRequests: async () => {
    const res = await api.get('/bookings/owner-requests');
    return res.data;
  },
  

    requestBooking: async (pgId, data) => {
    const res = await api.post('/bookings', { pgId, ...data }); // ✅ send to /bookings not /pgs/:id/book
    return res.data;
  },

  
   updateStatus: async (bookingId, status) => {
    const res = await api.patch(`/bookings/${bookingId}/status`, { status }); // ✅ fixed
    return res.data;
  },

};

// ── CONTACT ───────────────────────────────────────────────────────────
export const contactService = {
  send: async (data) => {
    const res = await api.post('/contact', data);
    return res.data;
  },
};

export default api;
