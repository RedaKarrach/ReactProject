/**
 * Database Usage Examples
 * 
 * @description Practical examples of using the SQLite database in your components
 * @author Reda Karrach, Sara Bellaly
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { UserModel, ProductModel, CartModel, OrderModel, FavoritesModel } from '../services/models';
import database from '../services/database';

/**
 * Example 1: User Registration Component
 */
export const RegistrationExample = () => {
  const [status, setStatus] = useState('');

  const handleRegister = async () => {
    try {
      const user = await UserModel.register(
        'john@example.com',
        'securePassword123',
        'John Doe'
      );
      setStatus(`User created! ID: ${user.id}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Register User" onPress={handleRegister} />
      <Text>{status}</Text>
    </View>
  );
};

/**
 * Example 2: Product List with Caching
 */
export const ProductListExample = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Try to get cached products first
      let cachedProducts = await ProductModel.getAll();
      
      if (cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setLoading(false);
      }

      // Fetch from API
      const response = await fetch('https://fakestoreapi.com/products');
      const apiProducts = await response.json();

      // Cache in database
      await ProductModel.syncProducts(apiProducts);

      // Update UI
      setProducts(apiProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <Text>{item.title}</Text>
              <Text>${item.price}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

/**
 * Example 3: Shopping Cart Management
 */
export const CartManagementExample = ({ userId }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, [userId]);

  const loadCart = async () => {
    const items = await CartModel.getItems(userId);
    setCartItems(items);
  };

  const addProduct = async (product) => {
    await CartModel.addItem(userId, product);
    await loadCart(); // Refresh
  };

  const updateQuantity = async (cartId, quantity) => {
    await CartModel.updateQuantity(cartId, quantity);
    await loadCart(); // Refresh
  };

  const removeItem = async (cartId) => {
    await CartModel.removeItem(cartId);
    await loadCart(); // Refresh
  };

  const clearAllItems = async () => {
    await CartModel.clear(userId);
    await loadCart(); // Refresh
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.cartId.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text>{item.title}</Text>
            <Text>Qty: {item.quantity}</Text>
            <Button
              title="+"
              onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
            />
            <Button
              title="-"
              onPress={() => updateQuantity(item.cartId, item.quantity - 1)}
            />
            <Button
              title="Remove"
              onPress={() => removeItem(item.cartId)}
            />
          </View>
        )}
      />
      <Button title="Clear Cart" onPress={clearAllItems} />
    </View>
  );
};

/**
 * Example 4: Order Creation and History
 */
export const OrderExample = ({ userId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    const userOrders = await OrderModel.getUserOrders(userId);
    setOrders(userOrders);
  };

  const createOrder = async () => {
    try {
      // Get cart items
      const cartItems = await CartModel.getItems(userId);
      
      if (cartItems.length === 0) {
        alert('Cart is empty!');
        return;
      }

      // Create order
      const order = await OrderModel.create(
        userId,
        cartItems,
        '123 Main Street, City, State 12345'
      );

      alert(`Order created! Number: ${order.orderNumber}`);
      await loadOrders(); // Refresh
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Place Order" onPress={createOrder} />
      
      <Text style={styles.heading}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>Order #{item.orderNumber}</Text>
            <Text>Total: ${item.totalAmount.toFixed(2)}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Items: {item.items.length}</Text>
          </View>
        )}
      />
    </View>
  );
};

/**
 * Example 5: Favorites Management
 */
export const FavoritesExample = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    const fav = await FavoritesModel.getAll(userId);
    setFavorites(fav);
  };

  const toggleFavorite = async (product) => {
    const isFavorite = await FavoritesModel.toggle(userId, product);
    await loadFavorites(); // Refresh
    
    if (isFavorite) {
      alert('Added to favorites!');
    } else {
      alert('Removed from favorites!');
    }
  };

  const checkIsFavorite = async (productId) => {
    const isFav = await FavoritesModel.isFavorite(userId, productId);
    return isFav;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            <Text>{item.title}</Text>
            <Text>${item.price}</Text>
            <Button
              title="Remove"
              onPress={() => toggleFavorite(item)}
            />
          </View>
        )}
      />
    </View>
  );
};

/**
 * Example 6: Database Statistics Dashboard
 */
export const DatabaseStatsExample = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const dbStats = await database.utils.getStats();
    setStats(dbStats);
  };

  const resetDatabase = async () => {
    if (confirm('Are you sure? This will delete all data!')) {
      await database.utils.resetDatabase();
      await loadStats();
      alert('Database reset successfully!');
    }
  };

  if (!stats) return <Text>Loading stats...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Database Statistics</Text>
      <Text>Total Users: {stats.users}</Text>
      <Text>Cached Products: {stats.products}</Text>
      <Text>Cart Items: {stats.cartItems}</Text>
      <Text>Total Orders: {stats.orders}</Text>
      <Text>Total Favorites: {stats.favorites}</Text>
      
      <Button title="Refresh Stats" onPress={loadStats} />
      <Button title="Reset Database (DEV ONLY)" onPress={resetDatabase} />
    </View>
  );
};

/**
 * Example 7: User Profile Management
 */
export const ProfileExample = ({ userId }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    const user = await UserModel.getProfile(userId);
    setProfile(user);
  };

  const updateProfile = async () => {
    try {
      const updatedUser = await UserModel.updateProfile(userId, {
        username: 'Updated Name',
        phone: '+1234567890',
        address: '456 New Street, New City'
      });
      
      setProfile(updatedUser);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!profile) return <Text>Loading profile...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Profile</Text>
      <Text>Email: {profile.email}</Text>
      <Text>Username: {profile.username || 'Not set'}</Text>
      <Text>Phone: {profile.phone || 'Not set'}</Text>
      <Text>Address: {profile.address || 'Not set'}</Text>
      
      <Button title="Update Profile" onPress={updateProfile} />
    </View>
  );
};

/**
 * Example 8: Search Products with Database
 */
export const SearchProductsExample = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchProducts = async (searchQuery) => {
    try {
      // Get all cached products
      const allProducts = await ProductModel.getAll();
      
      // Filter by search query
      const filtered = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search products..."
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          searchProducts(text);
        }}
        style={styles.searchInput}
      />
      
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>{item.title}</Text>
            <Text>${item.price}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  cartItem: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  orderItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    borderRadius: 5,
  },
  favoriteItem: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default {
  RegistrationExample,
  ProductListExample,
  CartManagementExample,
  OrderExample,
  FavoritesExample,
  DatabaseStatsExample,
  ProfileExample,
  SearchProductsExample,
};
