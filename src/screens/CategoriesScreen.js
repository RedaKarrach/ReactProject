/**
 * CategoriesScreen - Browse Products by Category
 * 
 
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  ImageBackground,
  Animated,
  TextInput,
  Easing,
} from 'react-native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = (width - 36) / 2;

// Composant séparé pour le bouton horizontal de catégorie
const HorizontalCategoryButton = ({ item, isSelected, onPress }) => {
  const categoryData = {
    'electronics': { 
      color: '#FF6B6B', 
      darkColor: '#CC5555',
      icon: '📱',
    },
    'jewelery': { 
      color: '#FFD93D', 
      darkColor: '#CCB030',
      icon: '💎',
    },
    'men\'s clothing': { 
      color: '#6BCB77', 
      darkColor: '#57A861',
      icon: '👔',
    },
    'women\'s clothing': { 
      color: '#4D96FF', 
      darkColor: '#3D76CC',
      icon: '👗',
    },
  };

  const catInfo = categoryData[item.toLowerCase()] || { 
    color: '#6BCB77', 
    darkColor: '#57A861',
    icon: '📦',
  };

  return (
    <TouchableOpacity
      style={[
        styles.horizontalCategoryButton,
        isSelected && { ...styles.horizontalCategoryButtonActive, backgroundColor: catInfo.color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryIconSmall}>{catInfo.icon}</Text>
      <Text style={[
        styles.horizontalCategoryText,
        isSelected && styles.horizontalCategoryTextActive
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

// Composant séparé pour chaque carte de catégorie
const CategoryCard = ({ item, isSelected, onPress }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  const categoryData = {
    'electronics': { 
      color: '#FF6B6B', 
      lightColor: '#FFE0E0',
      darkColor: '#CC5555',
      icon: '📱',
    },
    'jewelery': { 
      color: '#FFD93D', 
      lightColor: '#FFF5D0',
      darkColor: '#CCB030',
      icon: '💎',
    },
    'men\'s clothing': { 
      color: '#6BCB77', 
      lightColor: '#E0F5E0',
      darkColor: '#57A861',
      icon: '👔',
    },
    'women\'s clothing': { 
      color: '#4D96FF', 
      lightColor: '#E0EFFF',
      darkColor: '#3D76CC',
      icon: '👗',
    },
  };

  const catInfo = categoryData[item.toLowerCase()] || { 
    color: '#6BCB77', 
    lightColor: '#E0F5E0',
    darkColor: '#57A861',
    icon: '📦',
  };

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isSelected, animValue]);

  return (
    <Animated.View 
      style={[
        styles.categoryCardWrapper,
        {
          transform: [{ scale: isSelected ? 1.08 : 1 }],
          shadowOpacity: isSelected ? 0.8 : 0.3,
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: isSelected ? catInfo.color : catInfo.lightColor,
            borderColor: catInfo.color,
            borderWidth: isSelected ? 0 : 2,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryIcon}>{catInfo.icon}</Text>
        <Text style={[
          styles.categoryCardText,
          { color: isSelected ? '#ffffff' : catInfo.darkColor }
        ]}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: catInfo.darkColor }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bannerColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCategories();
    animateEntrance();
  }, []);

  useEffect(() => {
    // Filtrer les catégories selon la recherche
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchCategories = async () => {
    try {
      const data = await productAPI.getCategories();
      setCategories(data);
      setFilteredCategories(data);
      
      // Charger la première catégorie par défaut
      if (data && data.length > 0) {
        loadCategoryProducts(data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (category) => {
    setSelectedCategory(category);
    setLoadingProducts(true);
    
    try {
      const data = await productAPI.getProductsByCategory(category);
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const navigateToProductDetails = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const renderCategoryButton = ({ item }) => (
    <HorizontalCategoryButton
      item={item}
      isSelected={item === selectedCategory}
      onPress={() => loadCategoryProducts(item)}
    />
  );

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigateToProductDetails(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Catégories" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
        </View>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Catégories" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Aucune catégorie disponible</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Catégories" />
      
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchSection,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une catégorie..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Beautiful Banner Section */}
      <View style={styles.bannerSection}>
        <View style={styles.bannerGradient}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>🛍️</Text>
            <Text style={styles.bannerTitle}>Bienvenue dans nos collections</Text>
            <Text style={styles.bannerSubtitle}>Explorez nos meilleures catégories</Text>
          </View>
        </View>

        {/* Horizontal Categories List */}
        <View style={styles.categoriesHorizontal}>
          <FlatList
            horizontal
            data={filteredCategories}
            renderItem={renderCategoryButton}
            keyExtractor={(item, index) => `category-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesHorizontalList}
          />
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 'Tous les produits'}
          </Text>
          {selectedCategory && (
            <Text style={styles.productCount}>{products.length} articles</Text>
          )}
        </View>

        {loadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Chargement des produits...</Text>
          </View>
        ) : products && products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 8,
  },
  bannerSection: {
    backgroundColor: '#ffffff',
  },
  bannerGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#5B21B6',
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '500',
  },
  categoriesHorizontal: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoriesHorizontalList: {
    paddingHorizontal: 8,
    gap: 10,
  },
  horizontalCategoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  horizontalCategoryButtonActive: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  categoryIconSmall: {
    fontSize: 16,
  },
  horizontalCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  horizontalCategoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  categoryCardWrapper: {
    width: CATEGORY_WIDTH,
    height: 150,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 16,
    overflow: 'visible',
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  categoryCardText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productsSection: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  productsList: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
