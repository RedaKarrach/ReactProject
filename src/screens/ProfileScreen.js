/**
 * ProfileScreen - User Profile & Settings
 * 
 * @author Achraf Oubakouz - UI/UX Design
 * @author Reda Karrach - Profile Logic & Navigation
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Button from '../components/Button';

/**
 * ProfileScreen Component
 * Displays user profile and settings
 */
const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  /**
   * Menu items
   */
  const menuItems = [
    {
      id: 1,
      icon: '📦',
      title: 'My Orders',
      subtitle: 'View order history',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: 2,
      icon: '❤️',
      title: 'Wishlist',
      subtitle: 'Your favorite items',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: 3,
      icon: '📍',
      title: 'Addresses',
      subtitle: 'Manage shipping addresses',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 4,
      icon: '💳',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 6,
      icon: '⚙️',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.username?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 
               user?.email?.split('@')[0]?.substring(0, 2).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.username || user?.email || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="primary"
            fullWidth
            size="large"
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
          <Text style={styles.appInfoText}>© 2026 E-Commerce App</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'linear-gradient(135deg, #5B21B6 0%, #7c3aed 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  editButton: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#5B21B6',
    elevation: 3,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  menuArrow: {
    fontSize: 24,
    color: '#d1d5db',
    marginLeft: 12,
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    marginTop: 8,
  },
  appInfo: {
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  appInfoText: {
    fontSize: 13,
    color: '#a0aec0',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default ProfileScreen;
