// import axios from 'axios';
// import { mockPGs, mockBookings, mockOwnerBookingRequests } from '../data/mockData';

// // Base API instance — swap BASE_URL with real backend later
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'https://api.pgfinder.example.com/v1',
//   timeout: 10000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Request interceptor: attach auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('pg_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Response interceptor: handle errors globally
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('pg_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// // ── Helper to simulate API delay ──
// const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// // ── AUTH ──────────────────────────────────────────────────────────────
// export const authService = {
//   login: async (email, password) => {
//     await delay();
//     // MOCK: replace with api.post('/auth/login', { email, password })
//     if (email && password) {
//       const user = { id: 1, name: 'Demo User', email, role: 'tenant' };
//       localStorage.setItem('pg_token', 'mock-jwt-token');
//       localStorage.setItem('pg_user', JSON.stringify(user));
//       return { user, token: 'mock-jwt-token' };
//     }
//     throw new Error('Invalid credentials');
//   },
//   register: async (data) => {
//     await delay();
//     // MOCK: replace with api.post('/auth/register', data)
//     const user = { id: 2, ...data };
//     localStorage.setItem('pg_token', 'mock-jwt-token');
//     localStorage.setItem('pg_user', JSON.stringify(user));
//     return { user, token: 'mock-jwt-token' };
//   },
//   logout: () => {
//     localStorage.removeItem('pg_token');
//     localStorage.removeItem('pg_user');
//   },
//   getCurrentUser: () => {
//     const u = localStorage.getItem('pg_user');
//     return u ? JSON.parse(u) : null;
//   },
// };

// // ── PG LISTINGS ───────────────────────────────────────────────────────
// export const pgService = {
//   getAll: async (filters = {}) => {
//     await delay();
//     // MOCK: replace with api.get('/pgs', { params: filters })
//     let results = [...mockPGs];
//     if (filters.city) results = results.filter(p => p.location.city === filters.city);
//     if (filters.type && filters.type !== 'all') results = results.filter(p => p.type === filters.type);
//     if (filters.minPrice) results = results.filter(p => p.price >= Number(filters.minPrice));
//     if (filters.maxPrice) results = results.filter(p => p.price <= Number(filters.maxPrice));
//     if (filters.amenities?.length) results = results.filter(p => filters.amenities.every(a => p.amenities.includes(a)));
//     if (filters.search) {
//       const q = filters.search.toLowerCase();
//       results = results.filter(p =>
//         p.title.toLowerCase().includes(q) ||
//         p.location.city.toLowerCase().includes(q) ||
//         p.location.area.toLowerCase().includes(q)
//       );
//     }
//     return results;
//   },
//   getById: async (id) => {
//     await delay(400);
//     // MOCK: replace with api.get(`/pgs/${id}`)
//     const pg = mockPGs.find(p => p.id === Number(id));
//     if (!pg) throw new Error('PG not found');
//     return pg;
//   },
//   create: async (data) => {
//     await delay();
//     // MOCK: replace with api.post('/pgs', data)
//     return { id: Date.now(), ...data };
//   },
//   update: async (id, data) => {
//     await delay();
//     // MOCK: replace with api.put(`/pgs/${id}`, data)
//     return { id, ...data };
//   },
//   delete: async (id) => {
//     await delay();
//     // MOCK: replace with api.delete(`/pgs/${id}`)
//     return { success: true };
//   },
// };

// // ── BOOKINGS ──────────────────────────────────────────────────────────
// export const bookingService = {
//   getMyBookings: async () => {
//     await delay();
//     // MOCK: replace with api.get('/bookings/mine')
//     return mockBookings;
//   },
//   getOwnerRequests: async () => {
//     await delay();
//     // MOCK: replace with api.get('/bookings/requests')
//     return mockOwnerBookingRequests;
//   },
//   requestBooking: async (pgId, data) => {
//     await delay();
//     // MOCK: replace with api.post(`/pgs/${pgId}/book`, data)
//     return { id: 'BK' + Date.now(), pgId, ...data, status: 'pending' };
//   },
//   updateStatus: async (bookingId, status) => {
//     await delay(300);
//     // MOCK: replace with api.patch(`/bookings/${bookingId}`, { status })
//     return { id: bookingId, status };
//   },
// };

// // ── CONTACT ───────────────────────────────────────────────────────────
// export const contactService = {
//   send: async (data) => {
//     await delay(800);
//     // MOCK: replace with api.post('/contact', data)
//     return { success: true, message: 'Message sent successfully' };
//   },
// };

// export default api;


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
    const res = await api.get('/bookings/mine');
    return res.data;
  },
  getOwnerRequests: async () => {
    const res = await api.get('/bookings/requests');
    return res.data;
  },
  requestBooking: async (pgId, data) => {
    const res = await api.post(`/pgs/${pgId}/book`, data);
    return res.data;
  },
  updateStatus: async (bookingId, status) => {
    const res = await api.patch(`/bookings/${bookingId}`, { status });
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
