import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mboa_command_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mboa_command_token');
      localStorage.removeItem('mboa_command_user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email: string, password: string) => API.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; phone: string; password: string; city: string }) =>
    API.post('/auth/register', data),
  sendOTP: (email: string, purpose: 'login' | 'reset' = 'login') =>
    API.post('/auth/send-otp', { email, purpose }),
  verifyOTP: (email: string, code: string, purpose: 'login' | 'reset' = 'login') =>
    API.post('/auth/verify-otp', { email, code, purpose }),
};

export const restaurantsAPI = {
  getAll: (params?: { city?: string; category?: string; featured?: boolean; search?: string }) =>
    API.get('/restaurants', { params }),
  getById: (id: string) => API.get(`/restaurants/${id}`),
  getReviews: (id: string) => API.get(`/restaurants/${id}/reviews`),
};

export const menuAPI = {
  getItem: (id: string) => API.get(`/menu/items/${id}`),
  getFeatured: (params?: { city?: string; limit?: number }) => API.get('/menu/featured', { params }),
  search: (q: string, city?: string) => API.get('/menu/search', { params: { q, city } }),
};

export const ordersAPI = {
  create: (data: {
    restaurant_id: string;
    items: { menu_item_id: string; quantity: number }[];
    delivery_address?: string;
    delivery_city?: string;
    payment_method?: string;
    notes?: string;
  }) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my'),
  getById: (id: string) => API.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => API.patch(`/orders/${id}/status`, { status }),
};

export const categoriesAPI = {
  getAll: () => API.get('/categories'),
};

export const usersAPI = {
  getMe: () => API.get('/users/me'),
  updateMe: (data: { name: string; phone: string; address: string; city: string }) =>
    API.put('/users/me', data),
  getFavorites: () => API.get('/users/favorites'),
  addFavorite: (restaurant_id: string) => API.post('/users/favorites', { restaurant_id }),
  removeFavorite: (restaurantId: string) => API.delete(`/users/favorites/${restaurantId}`),
};

export default API;
