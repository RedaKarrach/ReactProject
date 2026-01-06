

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service Layer
 * Manages all local data persistence operations
 * 
 * @author Sara Bellaly - Lead Developer
 * @author Reda Karrach - Architecture Design
 */

// Storage keys constants
const STORAGE_KEYS = {
  AUTH_TOKEN: '@ecommerce_auth_token',
  USER_DATA: '@ecommerce_user_data',
  CART_DATA: '@ecommerce_cart_data',
  ORDERS_DATA: '@ecommerce_orders_data',
  FAVORITES: '@ecommerce_favorites',
};

/**
 * Generic storage operations
 */
const storage = {
  // Save data
  saveData: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  // Get data
  getData: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },

  // Remove data
  removeData: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};

/**
 * Authentication storage operations
 */
export const authStorage = {
  // Save auth token
  saveToken: async (token) => {
    return await storage.saveData(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  // Get auth token
  getToken: async () => {
    return await storage.getData(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Remove auth token
  removeToken: async () => {
    return await storage.removeData(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Save user data
  saveUserData: async (userData) => {
    return await storage.saveData(STORAGE_KEYS.USER_DATA, userData);
  },

  // Get user data
  getUserData: async () => {
    return await storage.getData(STORAGE_KEYS.USER_DATA);
  },

  // Remove user data
  removeUserData: async () => {
    return await storage.removeData(STORAGE_KEYS.USER_DATA);
  },

  // Clear all auth data
  clearAuthData: async () => {
    await storage.removeData(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeData(STORAGE_KEYS.USER_DATA);
    return true;
  },
};

/**
 * Cart storage operations
 */
export const cartStorage = {
  // Save cart
  saveCart: async (cartItems) => {
    return await storage.saveData(STORAGE_KEYS.CART_DATA, cartItems);
  },

  // Get cart
  getCart: async () => {
    const cart = await storage.getData(STORAGE_KEYS.CART_DATA);
    return cart || [];
  },

  // Clear cart
  clearCart: async () => {
    return await storage.removeData(STORAGE_KEYS.CART_DATA);
  },
};

/**
 * Orders storage operations
 */
export const ordersStorage = {
  // Save orders
  saveOrders: async (orders) => {
    return await storage.saveData(STORAGE_KEYS.ORDERS_DATA, orders);
  },

  // Get orders
  getOrders: async () => {
    const orders = await storage.getData(STORAGE_KEYS.ORDERS_DATA);
    return orders || [];
  },

  // Add new order
  addOrder: async (order) => {
    try {
      const existingOrders = await ordersStorage.getOrders();
      const updatedOrders = [order, ...existingOrders];
      return await storage.saveData(STORAGE_KEYS.ORDERS_DATA, updatedOrders);
    } catch (error) {
      console.error('Error adding order:', error);
      return false;
    }
  },

  // Clear orders
  clearOrders: async () => {
    return await storage.removeData(STORAGE_KEYS.ORDERS_DATA);
  },
};

/**
 * Favorites storage operations
 */
export const favoritesStorage = {
  // Save favorites
  saveFavorites: async (favorites) => {
    return await storage.saveData(STORAGE_KEYS.FAVORITES, favorites);
  },

  // Get favorites
  getFavorites: async () => {
    const favorites = await storage.getData(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  },

  // Add favorite
  addFavorite: async (productId) => {
    try {
      const favorites = await favoritesStorage.getFavorites();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        return await storage.saveData(STORAGE_KEYS.FAVORITES, favorites);
      }
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  },

  // Remove favorite
  removeFavorite: async (productId) => {
    try {
      const favorites = await favoritesStorage.getFavorites();
      const updatedFavorites = favorites.filter((id) => id !== productId);
      return await storage.saveData(STORAGE_KEYS.FAVORITES, updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  },

  // Clear favorites
  clearFavorites: async () => {
    return await storage.removeData(STORAGE_KEYS.FAVORITES);
  },
};

export default storage;
