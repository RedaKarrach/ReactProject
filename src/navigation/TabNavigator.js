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
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { getCartItemCount } = useCart();

  const TabBarIcon = ({ icon, focused }) => (
    <View
      style={[
        styles.tabIconContainer,
        focused && styles.tabIconFocusedContainer,
      ]}
    >
    <Ionicons
      name={icon}
      size={20}
      color={focused ? '#ffffff' : '#c7d2fe'}
    />
    </View>
  );


  const TabBarLabel = ({ label, focused }) => (
    <Text
      style={[
        styles.tabLabel,
        focused && styles.tabLabelFocused,
      ]}
    >
      {label}
    </Text>
  );

  const CartBadge = () => {
    const count = getCartItemCount();
    if (count === 0) return null;

    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {count > 99 ? '99+' : count}
        </Text>
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="home-outline" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Home" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="grid-outline" focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel label="Categories" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabBarIcon icon="cart-outline" focused={focused} />
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
            <TabBarIcon icon="receipt-outline" focused={focused} />
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
            <TabBarIcon icon="person-outline" focused={focused} />
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
    height: Platform.OS === 'ios' ? 90 : 68,
    paddingTop: 13,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    backgroundColor: '#0f172a',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabIconFocusedContainer: {
    backgroundColor: '#312e81',
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 4,
  },

  tabLabelFocused: {
    fontWeight: '600',
    color: '#e0e7ff',
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default TabNavigator;
