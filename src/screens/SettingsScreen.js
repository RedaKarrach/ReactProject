/**
 * SettingsScreen - App Settings & Preferences
 * 
 * @author Reda Karrach - Settings Implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const SETTINGS_KEY = '@app_settings';

/**
 * SettingsScreen Component
 * Manages app preferences and settings
 */
const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
      orderUpdates: true,
      promotions: false,
    },
    privacy: {
      shareData: false,
      personalization: true,
    },
    appearance: {
      darkMode: false,
    },
    other: {
      autoPlayVideos: false,
      saveSearchHistory: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from storage
   */
  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * Save settings to storage
   */
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  /**
   * Toggle notification setting
   */
  const toggleNotification = (key) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    };
    saveSettings(newSettings);
  };

  /**
   * Toggle privacy setting
   */
  const togglePrivacy = (key) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    };
    saveSettings(newSettings);
  };

  /**
   * Toggle appearance setting
   */
  const toggleAppearance = (key) => {
    const newSettings = {
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: !settings.appearance[key],
      },
    };
    saveSettings(newSettings);
    
    if (key === 'darkMode') {
      Alert.alert('Dark Mode', 'Dark mode feature coming soon!');
    }
  };

  /**
   * Toggle other setting
   */
  const toggleOther = (key) => {
    const newSettings = {
      ...settings,
      other: {
        ...settings.other,
        [key]: !settings.other[key],
      },
    };
    saveSettings(newSettings);
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached images and data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear specific caches
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  /**
   * Reset all settings
   */
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              notifications: {
                pushEnabled: true,
                emailEnabled: true,
                orderUpdates: true,
                promotions: false,
              },
              privacy: {
                shareData: false,
                personalization: true,
              },
              appearance: {
                darkMode: false,
              },
              other: {
                autoPlayVideos: false,
                saveSearchHistory: true,
              },
            };
            await saveSettings(defaultSettings);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  /**
   * Render setting item with switch
   */
  const renderSettingItem = (title, subtitle, value, onToggle) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
        thumbColor={value ? '#5B21B6' : '#f3f4f6'}
      />
    </View>
  );

  /**
   * Render action button
   */
  const renderActionButton = (title, onPress, destructive = false) => (
    <TouchableOpacity
      style={[styles.actionButton, destructive && styles.destructiveButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.actionButtonText, destructive && styles.destructiveText]}>
        {title}
      </Text>
      <Text style={[styles.actionArrow, destructive && styles.destructiveText]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          {renderSettingItem(
            'Push Notifications',
            'Receive push notifications',
            settings.notifications.pushEnabled,
            () => toggleNotification('pushEnabled')
          )}
          {renderSettingItem(
            'Email Notifications',
            'Receive email updates',
            settings.notifications.emailEnabled,
            () => toggleNotification('emailEnabled')
          )}
          {renderSettingItem(
            'Order Updates',
            'Notifications about your orders',
            settings.notifications.orderUpdates,
            () => toggleNotification('orderUpdates')
          )}
          {renderSettingItem(
            'Promotions',
            'Receive promotional offers',
            settings.notifications.promotions,
            () => toggleNotification('promotions')
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Privacy</Text>
          {renderSettingItem(
            'Share Usage Data',
            'Help improve the app',
            settings.privacy.shareData,
            () => togglePrivacy('shareData')
          )}
          {renderSettingItem(
            'Personalization',
            'Get personalized recommendations',
            settings.privacy.personalization,
            () => togglePrivacy('personalization')
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Appearance</Text>
          {renderSettingItem(
            'Dark Mode',
            'Use dark theme (Coming Soon)',
            settings.appearance.darkMode,
            () => toggleAppearance('darkMode')
          )}
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Other</Text>
          {renderSettingItem(
            'Auto-play Videos',
            'Automatically play product videos',
            settings.other.autoPlayVideos,
            () => toggleOther('autoPlayVideos')
          )}
          {renderSettingItem(
            'Save Search History',
            'Keep track of your searches',
            settings.other.saveSearchHistory,
            () => toggleOther('saveSearchHistory')
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Actions</Text>
          {renderActionButton('Clear Cache', clearCache)}
          {renderActionButton('Reset Settings', resetSettings, true)}
        </View>

        {/* App Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2026.01.10</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon')}
          >
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon')}
          >
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Licenses', 'Open source licenses coming soon')}
          >
            <Text style={styles.legalText}>Open Source Licenses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 E-Commerce App</Text>
          <Text style={styles.footerText}>Made with ❤️ by the Team</Text>
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
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
  },
  actionArrow: {
    fontSize: 24,
    color: '#5B21B6',
  },
  destructiveButton: {
    borderBottomWidth: 0,
  },
  destructiveText: {
    color: '#dc2626',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  legalSection: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  legalButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 14,
    color: '#5B21B6',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
});

export default SettingsScreen;
