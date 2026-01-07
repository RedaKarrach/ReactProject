import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Loader from '../components/Loader';


const HomeScreen = ({ navigation }) => {
  const { getCartItemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    fetchProducts();
  }, []);


  const fetchProducts = async () => {
    try {
      setError(null);
      // Utilise le cache par défaut, récupère de l'API si nécessaire
      const data = await productAPI.getAllProducts(true);
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Impossible de charger les produits');
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force le rafraîchissement depuis l'API
      const data = await productAPI.refreshCache();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Erreur rafraîchissement:', err);
      // En cas d'erreur, recharger depuis le cache
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  };

  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(category)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const navigateToProductDetails = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  
  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigateToProductDetails(item)}
    />
  );

  
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

  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIconText}>NO ITEMS</Text>
      </View>
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  );

  
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

      <View style={styles.headerContent}>
        <Text style={styles.screenTitle}>Discover</Text>
        <Text style={styles.screenSubtitle}>Find the perfect product for you</Text>
      </View>

      {renderCategoryFilter()}

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={true}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
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
    backgroundColor: '#0a0e27',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    backgroundColor: '#0a0e27',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f9fafb',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#a0aec0',
    fontWeight: '400',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
    maxHeight: 56,
  },
  categoryContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  categoryButton: {
    height: 28,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    lineHeight: 14,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 28,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIconContainer: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  cartIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f9fafb',
    letterSpacing: 0.8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2d3748',
  },
  emptyIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a0aec0',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  errorIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1f1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  errorIconText: {
    fontSize: 38,
    fontWeight: '700',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  retryText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;