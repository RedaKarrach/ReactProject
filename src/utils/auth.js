/**
 * Authentication Utilities
 * 
 * @author Reda Karrach
 * @author Sara Bellaly
 * 
 * Utility functions for password hashing and verification.
 */

import { Platform } from 'react-native';

/**
 * Simple hash function for demo purposes
 * In production, use a proper library like bcrypt or expo-crypto
 */
export const hashPassword = async (password) => {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or a similar library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hashed_${Math.abs(hash)}_${password.length}`;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password, hash) => {
  const newHash = await hashPassword(password);
  return newHash === hash;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  return password.length >= 6;
};
