/**
 * AppNavigator - Root Navigation
 * 
 * @author Reda Karrach - Navigation Architecture
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import Loader from '../components/Loader';

const Stack = createStackNavigator();

/**
 * AppNavigator
 * Main navigation component that handles auth state
 */
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // Authenticated users see the main app
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
          />
        </Stack.Navigator>
      ) : (
        // Unauthenticated users see auth screens
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
