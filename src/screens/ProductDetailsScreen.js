/**
 * ProductDetailsScreen - Product Information
 * 
 * @author Achraf Oubakouz - UI/UX Design
 * @author Reda Karrach - Cart Integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

/**
 * ProductDetailsScreen Component
 * Displays detailed product information
 */
const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  const productInCart = isInCart(product.id);
  const currentQuantity = getItemQuantity(product.id);

  /**
   * Handle add to cart
   */
  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Success',
      `${product.title} added to cart`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'View Cart',
          onPress: () => {
            // Navigate to Cart by going back to Main TabNavigator and specifying Cart screen
            navigation.navigate('Main', { screen: 'Cart' });
          },
        },
      ]
    );
  };

  /**
   * Increment quantity
   */
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  /**
   * Decrement quantity
   */
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Product Details" showBack />
      
      <ScrollView style={styles.content}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category */}
          <Text style={styles.category}>{product.category}</Text>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Price */}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingScore}>{product.rating.rate}</Text>
              </View>
              <Text style={styles.ratingText}>
                ({product.rating.count} reviews)
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <Button
                title="-"
                onPress={decrementQuantity}
                variant="outline"
                size="small"
                disabled={quantity <= 1}
                style={styles.quantityButton}
              />
              <Text style={styles.quantityText}>{quantity}</Text>
              <Button
                title="+"
                onPress={incrementQuantity}
                variant="outline"
                size="small"
                style={styles.quantityButton}
              />
            </View>
          </View>

          {/* Cart Status */}
          {productInCart && (
            <View style={styles.cartStatus}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkIconText}>✓</Text>
              </View>
              <Text style={styles.cartStatusText}>
                {currentQuantity} in cart
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Button
          title={productInCart ? 'Add More to Cart' : 'Add to Cart'}
          onPress={handleAddToCart}
          fullWidth
          size="large"
        />
      </View>
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
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5B21B6',
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: '#f3f0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 0,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B21B6',
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  descriptionContainer: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  quantityContainer: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 48,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  cartStatus: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  checkIcon: {
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartStatusText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
});

export default ProductDetailsScreen;
