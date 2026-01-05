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
    checkStoredAuth();
  }, []);

  /**
   * Check if user is already logged in
   */
  const checkStoredAuth = async () => {
    try {
      const storedToken = await authStorage.getToken();
      const storedUser = await authStorage.getUserData();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (err) {
      console.error('Error checking stored auth:', err);
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

      // Call login API
      const response = await authAPI.login(email, password);

      // Save token and user data
      await authStorage.saveToken(response.token);
      await authStorage.saveUserData(response.user);

      // Update state
      setToken(response.token);
      setUser(response.user);

      return { success: true };
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

      // Call register API
      const response = await authAPI.register(name, email, password);

      // Save token and user data
      await authStorage.saveToken(response.token);
      await authStorage.saveUserData(response.user);

      // Update state
      setToken(response.token);
      setUser(response.user);

      return { success: true };
    } catch (err) {
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

      // Call logout API
      await authAPI.logout();

      // Clear stored data
      await authStorage.clearAuthData();

      // Clear state
      setToken(null);
      setUser(null);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API fails, clear local data
      await authStorage.clearAuthData();
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
      const updatedUser = { ...user, ...updatedData };
      await authStorage.saveUserData(updatedUser);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Failed to update profile' };
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
