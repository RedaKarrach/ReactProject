/**
 * TabNavigator - Bottom Tab Navigation
 * 
 * @author Achraf Oubakouz - Tab UI Design
 * @author Reda Karrach - Navigation Logic
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

/**
 * TabNavigator
 * Bottom tab navigation for main app screens
 */
const TabNavigator = () => {
  const { getCartItemCount } = useCart();

  /**
   * Custom tab bar icon
   */
  const TabBarIcon = ({ label, focused }) => (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocusedContainer]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
        {label.charAt(0)}
      </Text>
    </View>
  );

  /**
   * Custom tab bar label
   */
  const TabBarLabel = ({ label, focused }) => (
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  );

  /**
   * Cart badge
   */
  const CartBadge = () => {
    const count = getCartItemCount();
    if (count === 0) return null;

    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Home" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Home" focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabBarIcon label="Cart" focused={focused} />
              <CartBadge />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Cart" focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Orders" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Orders" focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Profile" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocusedContainer: {
    backgroundColor: '#dbeafe',
  },
  tabIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabIconTextFocused: {
    color: '#2563eb',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelFocused: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabNavigator;
