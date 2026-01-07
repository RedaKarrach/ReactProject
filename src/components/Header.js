/**
 * Header Component
 * 
 * @author Achraf Oubakouz - Design & Implementation
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Header Component
 * Reusable header with title and optional back button
 */
const Header = ({
  title,
  showBack = false,
  rightComponent = null,
  onBackPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {rightComponent && <View style={styles.rightSection}>{rightComponent}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#0b1120',
  },
  backText: {
    color: '#e5e7eb',
    fontSize: 22,
    fontWeight: '400',
  },
  title: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  rightSection: {
    marginLeft: 12,
  },
});

export default Header;
