/**
 * Authentication Context
 * 
 * @author Reda Karrach - Architecture & Implementation
 * @author Sara Bellaly - Storage Integration
 * 
 * Manages user authentication state and operations throughout the app.
 * Handles login, registration, logout, and session persistence.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { authStorage } from '../services/storage';
import { UserModel } from '../services/models';
import database from '../services/database';

/**
 * Authentication Context
 * 
 * @author Reda Karrach - Architecture & Implementation
 * @author Sara Bellaly - Storage Integration
 */

// Create Auth Context
const AuthContext = createContext({});

/**
 * Auth Provider Component
 * Manages authentication state and operations
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check for stored auth data on app initialization
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize database and check auth
   */
  const initializeAuth = async () => {
    try {
      // Initialize database
      await database.init();
      
      // Check stored auth
      await checkStoredAuth();
    } catch (err) {
      console.error('Error initializing auth:', err);
      setLoading(false);
    }
  };

  /**
   * Check if user is already logged in
   * CRITICAL: Always fetch fresh user data from database to ensure data integrity
   */
  const checkStoredAuth = async () => {
    try {
      const storedToken = await authStorage.getToken();
      const storedUser = await authStorage.getUserData();

      if (storedToken && storedUser && storedUser.id) {
        // CRITICAL: Verify user still exists in database
        // Don't trust cached data - always fetch fresh to prevent data leakage
        const freshUser = await UserModel.getProfile(storedUser.id);
        
        if (freshUser) {
          // Update cache with fresh data
          await authStorage.saveUserData(freshUser);
          setToken(storedToken);
          setUser(freshUser);
        } else {
          // User no longer exists - clear auth
          await authStorage.clearAuthData();
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error checking stored auth:', err);
      // On error, clear auth to be safe
      await authStorage.clearAuthData();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Try to login with SQLite database
      const dbUser = await UserModel.login(email, password);
      
      if (dbUser) {
        // Generate a simple token
        const token = `token_${dbUser.id}_${Date.now()}`;
        
        // Save token and user data
        await authStorage.saveToken(token);
        await authStorage.saveUserData(dbUser);

        // Update state
        setToken(token);
        setUser(dbUser);

        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   */
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('AuthContext: Starting registration for', email);
      
      // Register with SQLite database
      const dbUser = await UserModel.register(email, password, name);
      console.log('AuthContext: Registration returned user:', dbUser);
      
      if (dbUser && dbUser.id) {
        // Generate a simple token
        const token = `token_${dbUser.id}_${Date.now()}`;
        console.log('AuthContext: Generated token, saving to storage');
        
        // Save token and user data
        await authStorage.saveToken(token);
        await authStorage.saveUserData(dbUser);
        console.log('AuthContext: Saved to storage, updating state');

        // Update state
        setToken(token);
        setUser(dbUser);

        console.log('AuthContext: Registration successful for user ID:', dbUser.id);
        return { success: true, user: dbUser };
      } else {
        console.error('AuthContext: Registration returned invalid user object');
        throw new Error('Registration failed - invalid user data');
      }
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setLoading(true);

      // CRITICAL: Clear ALL AsyncStorage to prevent data leakage
      // This includes auth data, cart cache, orders cache, favorites, etc.
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.clear();

      // Clear state immediately
      setToken(null);
      setUser(null);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Even if fails, clear local data
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.clear();
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
      setToken(null);
      setUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updatedData) => {
    try {
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      // Update in database (pass userId and updates separately)
      const updatedUser = await UserModel.updateProfile(user.id, updatedData);
      
      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }
      
      // Update storage and state
      await authStorage.saveUserData(updatedUser);
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
