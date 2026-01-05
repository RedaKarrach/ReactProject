/**
 * E-Commerce Mobile Application
 * 
 * @author Reda Karrach (Lead Developer)
 * @author Achraf Oubakouz (Frontend Specialist)
 * @author Sara Bellaly (Backend & QA Engineer)
 * 
 * @version 1.0.0
 * @since January 2026
 * 
 * @description
 * A production-quality React Native e-commerce application
 * featuring authentication, product browsing, shopping cart,
 * and order management.
 * 
 * @license MIT
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Main App Component
 * Entry point of the application with all providers
 * 
 * @component
 * @returns {React.Component} Root application component
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
