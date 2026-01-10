/**
 * CategoriesScreen - Browse Products by Category
 * 
 * Clean, modern category browser with grid layout
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productAPI } from '../services/api';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryConfig = {
    'electronics': {
      gradient: ['#667eea', '#764ba2'],
      icon: 'phone-portrait-outline',
      color: '#667eea',
    },
    'jewelery': {
      gradient: ['#f093fb', '#f5576c'],
      icon: 'diamond-outline',
      color: '#f093fb',
    },
    "men's clothing": {
      gradient: ['#4facfe', '#00f2fe'],
      icon: 'shirt-outline',
      color: '#4facfe',
    },
    "women's clothing": {
      gradient: ['#fa709a', '#fee140'],
      icon: 'woman-outline',
      color: '#fa709a',
    },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categoriesWithCount);
    } else {
      const filtered = categoriesWithCount.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categoriesWithCount]);

  const fetchCategories = async () => {
    try {
      const cats = await productAPI.getCategories();
      
      // Get product count for each category
      const categoriesData = await Promise.all(
        cats.map(async (category) => {
          const products = await productAPI.getProductsByCategory(category);
          return {
            name: category,
            count: products.length,
            config: categoryConfig[category.toLowerCase()] || {
              gradient: ['#667eea', '#764ba2'],
              icon: 'grid-outline',
              color: '#667eea',
            },
          };
        })
      );

      setCategories(cats);
      setCategoriesWithCount(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCategoryProducts = async (category) => {
    try {
      const products = await productAPI.getProductsByCategory(category.name);
      navigation.navigate('CategoryProducts', {
        category: category.name,
        products: products,
        color: category.config.color,
      });
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigateToCategoryProducts(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.config.color + '20' }]}>
        <Ionicons name={item.config.icon} size={40} color={item.config.color} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
        <Text style={styles.productCount}>{item.count} products</Text>
      </View>
      <View style={[styles.arrowContainer, { backgroundColor: item.config.color }]}>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Categories" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Categories" />
      
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Header Info */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Shop by Category</Text>
        <Text style={styles.headerSubtitle}>
          {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
        </Text>
      </View>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No categories found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  headerInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoriesList: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
