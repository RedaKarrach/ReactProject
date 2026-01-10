/**
 * WishlistScreen - User's Favorite Products
 * 
 * @author Reda Karrach - Wishlist Implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Loader from '../components/Loader';

const WISHLIST_KEY = '@wishlist';

/**
 * WishlistScreen Component
 * Displays user's wishlist items
 */
const WishlistScreen = ({ navigation }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  /**
   * Load wishlist from storage
   */
  const loadWishlist = async () => {
    try {
      const data = await AsyncStorage.getItem(WISHLIST_KEY);
      if (data) {
        setWishlistItems(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove item from wishlist
   */
  const removeFromWishlist = async (productId) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
              await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
              setWishlistItems(updatedWishlist);
            } catch (error) {
              console.error('Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove item from wishlist');
            }
          },
        },
      ]
    );
  };

  /**
   * Navigate to product details
   */
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  /**
   * Render wishlist item
   */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>${item.price ? item.price.toFixed(2) : '0.00'}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWishlist(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#dc2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Add products you love to your wishlist
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loader text="Loading wishlist..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="My Wishlist" showBack onBackPress={() => navigation.goBack()} />
      
      {wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.itemCount}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <FlatList
            data={wishlistItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  listContent: {
    padding: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B21B6',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#5B21B6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WishlistScreen;
