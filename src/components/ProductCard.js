/**
 * ProductCard Component
 * 
 * @author Achraf Oubakouz - UI Design & Implementation
 * @author Reda Karrach - Component Architecture
 * 
 * Reusable product card component for grid display.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export default ProductCard;
