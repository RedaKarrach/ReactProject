/**
 * API Service Layer
 * 
 * @author Reda Karrach - API Architecture
 * @author Sara Bellaly - Integration & Error Handling
 * 
 * Centralized API client for all backend communications.
 * Includes interceptors, error handling, and service methods.
 */

import axios from 'axios';

/**
 * API Service Layer
 * Handles all HTTP requests and API communication
 * 
 * @author Reda Karrach - API Architecture
 * @author Sara Bellaly - Integration & Error Handling
 */

// Base API configuration
const API_BASE_URL = 'https://fakestoreapi.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = await getStoredToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Product API Services
 */
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single product by ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Authentication API Services
 * Note: FakeStoreAPI has limited auth, this is a mock implementation
 */
export const authAPI = {
  // Mock login - in production, this would call a real API
  login: async (email, password) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Predefined demo users (team members)
      const demoUsers = {
        'reda@ecommerce.com': {
          id: '1',
          email: 'reda@ecommerce.com',
          name: 'Reda Karrach',
          role: 'Lead Developer'
        },
        'achraf@ecommerce.com': {
          id: '2',
          email: 'achraf@ecommerce.com',
          name: 'Achraf Oubakouz',
          role: 'Frontend Developer'
        },
        'sara@ecommerce.com': {
          id: '3',
          email: 'sara@ecommerce.com',
          name: 'Sara Bellaly',
          role: 'Backend Specialist'
        }
      };

      // Check if it's a demo user
      const demoUser = demoUsers[email.toLowerCase()];
      
      // Mock successful response
      return {
        user: demoUser || {
          id: '999',
          email: email,
          name: email.split('@')[0],
          avatar: 'https://i.pravatar.cc/150?img=1',
          role: 'Customer'
        },
        token: 'mock-jwt-token-' + Date.now(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Mock register
  register: async (name, email, password) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Generate random avatar number
      const avatarNum = Math.floor(Math.random() * 70) + 1;

      // Mock successful response
      return {
        user: {
          id: Date.now().toString(),
          email: email,
          name: name,
          avatar: `https://i.pravatar.cc/150?img=${avatarNum}`,
          role: 'Customer'
        },
        token: 'mock-jwt-token-' + Date.now(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Mock logout
  logout: async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Order API Services
 * Mock implementation for demonstration
 */
export const orderAPI = {
  // Create order
  createOrder: async (orderData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return {
        id: 'ORD-' + Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (userId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Return mock orders (in production, fetch from backend)
      return [];
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
