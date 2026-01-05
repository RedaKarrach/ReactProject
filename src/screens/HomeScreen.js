/**
 * HomeScreen - Product Listing
 * 
 * @author Achraf Oubakouz - UI/UX Design
 * @author Reda Karrach - Logic & Integration
 * @author Sara Bellaly - API Integration
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Loader from '../components/Loader';

/** * HomeScreen - Product Listing & Browse
 * 
 * @author Achraf Oubakouz - UI/UX Implementation
 * @author Reda Karrach - Data Integration
 */

/** * HomeScreen Component
 * Displays list of products in a grid layout
 */
const HomeScreen = ({ navigation }) => {
  const { getCartItemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Fetch products from API
   */
  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await productAPI.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  /**
   * Navigate to product details
   */
  const navigateToProductDetails = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  /**
   * Render product item
   */
  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigateToProductDetails(item)}
    />
  );

  /**
   * Render cart badge
   */
  const renderCartBadge = () => {
    const itemCount = getCartItemCount();
    
    return (
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.7}
      >
        <View style={styles.cartIconContainer}>
          <Text style={styles.cartIcon}>CART</Text>
        </View>
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIconText}>NO ITEMS</Text>
      </View>
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIconText}>!</Text>
      </View>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loader text="Loading products..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Shop" rightComponent={renderCartBadge()} />
      
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIconContainer: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cartIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#dc2626',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
