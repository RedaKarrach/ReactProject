/**
 * Database Test Screen
 * Simple screen to test SQLite integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import database from '../services/database';

const DatabaseTestScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await database.utils.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      setMessage('Error: ' + error.message);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    setMessage('');
    try {
      const userId = await database.user.createUser(
        `test${Date.now()}@example.com`,
        'hashed_password_123',
        'Test User'
      );
      setMessage(`✅ User created with ID: ${userId}`);
      await loadStats();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSeedDatabase = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Add sample products
      const sampleProducts = [
        {
          id: 101,
          title: 'Test Product 1',
          price: 29.99,
          description: 'A test product',
          category: 'electronics',
          image: 'https://via.placeholder.com/150',
          rating: { rate: 4.5, count: 100 }
        },
        {
          id: 102,
          title: 'Test Product 2',
          price: 49.99,
          description: 'Another test product',
          category: 'clothing',
          image: 'https://via.placeholder.com/150',
          rating: { rate: 4.0, count: 50 }
        }
      ];

      await database.product.cacheProducts(sampleProducts);
      setMessage('✅ Sample data added successfully!');
      await loadStats();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testResetDatabase = async () => {
    setLoading(true);
    setMessage('');
    try {
      await database.utils.resetDatabase();
      setMessage('✅ Database reset successfully!');
      await loadStats();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗄️ SQLite Database Test</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Statistics</Text>
        {stats ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Users:</Text>
              <Text style={styles.statValue}>{stats.users}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Products:</Text>
              <Text style={styles.statValue}>{stats.products}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cart Items:</Text>
              <Text style={styles.statValue}>{stats.cartItems}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Orders:</Text>
              <Text style={styles.statValue}>{stats.orders}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Favorites:</Text>
              <Text style={styles.statValue}>{stats.favorites}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading stats...</Text>
        )}
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={testCreateUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Test User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testSeedDatabase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Add Sample Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={loadStats}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Refresh Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={testResetDatabase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Reset Database</Text>
        </TouchableOpacity>
      </View>

      {/* Message/Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          La base de données est initialisée automatiquement
        </Text>
        <Text style={styles.footerText}>
          Les tests s'exécutent via AuthContext
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  messageContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default DatabaseTestScreen;
