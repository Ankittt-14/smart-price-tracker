import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH SERVICES ============
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

// ============ PRODUCT SERVICES ============
export const productService = {
  // Add new product to track
  // Add new product to track
  addProduct: async (url, manualData = null) => {
    const data = manualData ? manualData : { url };
    const response = await api.post('/products', data);
    return response.data;
  },

  // Get all user products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get trending products (Public)
  getTrendingProducts: async () => {
    const response = await api.get('/products/public/trending');
    return response.data;
  },

  // Get single product with price history
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Update product
  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// ============ PRICE SERVICES ============
export const priceService = {
  // Get price history for a product
  getPriceHistory: async (productId, days = 30) => {
    const response = await api.get(`/prices/${productId}?days=${days}`);
    return response.data;
  },

  // Manual price check
  checkPrice: async (productId) => {
    const response = await api.post('/prices/check', { productId });
    return response.data;
  }
};

// ============ ALERT SERVICES ============
export const alertService = {
  // Create price alert
  createAlert: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },

  // Get all user alerts
  getAlerts: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },

  // Update alert
  updateAlert: async (id, data) => {
    const response = await api.put(`/alerts/${id}`, data);
    return response.data;
  },

  // Delete alert
  deleteAlert: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  }
};

export default api;