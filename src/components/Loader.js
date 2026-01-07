import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Loader Component
 * Reusable loading indicator
 */
const Loader = ({ size = 'large', color = '#2563eb', text = '' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default Loader;
