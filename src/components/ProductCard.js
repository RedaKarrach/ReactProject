/**
 * ProductCard Component
 * 
 * @author Achraf Oubakouz - UI Design & Implementation
 * @author Reda Karrach - Component Architecture
 * 
 * Reusable product card component for grid display.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

/**
 * ProductCard Component
 * Displays product information in a card format
 * 
 * @param {Object} product - Product data object
 * @param {Function} onPress - Callback when card is pressed
 */
const ProductCard = ({ product, onPress }) => {
  const { title, price, image, category } = product;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
          <View style={styles.overlay} />
        </View>
        <View style={styles.content}>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1f3a',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#0f1323',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  content: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: '#1a1f3a',
  },
  category: {
    fontSize: 11,
    color: '#7c8adb',
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 10,
    fontWeight: '600',
    lineHeight: 19,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeText: {
    fontSize: 14,
    color: '#f9fafb',
    fontWeight: '700',
  },
});

export default ProductCard;
