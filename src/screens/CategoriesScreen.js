/**
 * CategoriesScreen - Browse Products by Category
 * 
 
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productAPI.getCategories();
      setCategories(data);
      
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

  const renderCategoryButton = ({ item }) => {
    const isSelected = item === selectedCategory;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonActive
        ]}
        onPress={() => loadCategoryProducts(item)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextActive
        ]}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Chargement des catégories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Catégories" />
      
      {/* Categories horizontal list */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(item, index) => `category-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products grid */}
      {loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>
            Chargement des produits...
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
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
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsList: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default CategoriesScreen;
