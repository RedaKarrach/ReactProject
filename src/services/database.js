/**
 * SQLite Database Service
 * 
 * @author Reda Karrach - Database Architecture
 * @author Sara Bellaly - Implementation
 * 
 * Manages SQLite database operations for the e-commerce app.
 * Handles users, products, cart, orders, and favorites.
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'ecommerce.db';

// Open database connection
let db = null;

/**
 * Initialize database connection
 */
const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

/**
 * Initialize database tables
 */
const initDatabase = async () => {
  try {
    const database = await openDatabase();
    
    // Users table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products table (cache from API)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT,
        image TEXT,
        rating_rate REAL,
        rating_count INTEGER,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cart table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Orders table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        order_number TEXT UNIQUE NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Order items table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);

    // Favorites table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      );
    `);

    // Create indexes for better performance
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * User operations
 */
const userOperations = {
  // Create new user
  createUser: async (email, password, username = null) => {
    try {
      const database = await openDatabase();
      const result = await database.runAsync(
        'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
        [email, password, username]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    try {
      const database = await openDatabase();
      const result = await database.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return result;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const database = await openDatabase();
      const result = await database.getFirstAsync(
        'SELECT id, email, username, phone, address, created_at FROM users WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  // Update user profile
  updateUser: async (id, updates) => {
    try {
      const database = await openDatabase();
      const fields = [];
      const values = [];
      
      if (updates.username !== undefined) {
        fields.push('username = ?');
        values.push(updates.username);
      }
      if (updates.email !== undefined) {
        fields.push('email = ?');
        values.push(updates.email);
      }
      if (updates.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updates.phone);
      }
      if (updates.address !== undefined) {
        fields.push('address = ?');
        values.push(updates.address);
      }
      
      if (fields.length === 0) return false;
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await database.runAsync(query, values);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.message && error.message.includes('UNIQUE')) {
        throw new Error('Email already in use by another user');
      }
      throw error;
    }
  },
};

/**
 * Product operations
 */
const productOperations = {
  // Cache products from API
  cacheProducts: async (products) => {
    try {
      const database = await openDatabase();
      
      for (const product of products) {
        await database.runAsync(
          `INSERT OR REPLACE INTO products 
           (id, title, price, description, category, image, rating_rate, rating_count, cached_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            product.id,
            product.title,
            product.price,
            product.description,
            product.category,
            product.image,
            product.rating?.rate || 0,
            product.rating?.count || 0,
          ]
        );
      }
      return true;
    } catch (error) {
      console.error('Error caching products:', error);
      return false;
    }
  },

  // Get cached products
  getCachedProducts: async () => {
    try {
      const database = await openDatabase();
      const results = await database.getAllAsync(
        'SELECT * FROM products ORDER BY id'
      );
      
      return results.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        rating: {
          rate: product.rating_rate,
          count: product.rating_count,
        },
      }));
    } catch (error) {
      console.error('Error getting cached products:', error);
      return [];
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const database = await openDatabase();
      const product = await database.getFirstAsync(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      
      if (!product) return null;
      
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        rating: {
          rate: product.rating_rate,
          count: product.rating_count,
        },
      };
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  },
};

/**
 * Cart operations
 */
const cartOperations = {
  // Add item to cart
  addToCart: async (userId, product) => {
    try {
      const database = await openDatabase();
      
      // Check if item already exists
      const existing = await database.getFirstAsync(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, product.id]
      );
      
      if (existing) {
        // Update quantity
        await database.runAsync(
          'UPDATE cart SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existing.id]
        );
      } else {
        // Insert new item
        await database.runAsync(
          `INSERT INTO cart (user_id, product_id, title, price, image, quantity)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, product.id, product.title, product.price, product.image, 1]
        );
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },

  // Get cart items
  getCartItems: async (userId) => {
    try {
      const database = await openDatabase();
      const results = await database.getAllAsync(
        'SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      return results.map(item => ({
        id: item.product_id,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        cartId: item.id,
      }));
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  },

  // Update cart item quantity
  updateCartQuantity: async (cartId, quantity) => {
    try {
      const database = await openDatabase();
      
      if (quantity <= 0) {
        await database.runAsync('DELETE FROM cart WHERE id = ?', [cartId]);
      } else {
        await database.runAsync(
          'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantity, cartId]
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartId) => {
    try {
      const database = await openDatabase();
      await database.runAsync('DELETE FROM cart WHERE id = ?', [cartId]);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  },

  // Clear cart
  clearCart: async (userId) => {
    try {
      const database = await openDatabase();
      await database.runAsync('DELETE FROM cart WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  },
};

/**
 * Order operations
 */
const orderOperations = {
  // Create order
  createOrder: async (userId, cartItems, totalAmount, shippingAddress) => {
    try {
      const database = await openDatabase();
      const orderNumber = `ORD-${Date.now()}-${userId}`;
      
      // Create order
      const orderResult = await database.runAsync(
        `INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, orderNumber, totalAmount, 'pending', shippingAddress]
      );
      
      const orderId = orderResult.lastInsertRowId;
      
      // Add order items
      for (const item of cartItems) {
        await database.runAsync(
          `INSERT INTO order_items (order_id, product_id, title, price, quantity, image)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.title, item.price, item.quantity, item.image]
        );
      }
      
      // Clear cart
      await cartOperations.clearCart(userId);
      
      return { id: orderId, orderNumber };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (userId) => {
    try {
      const database = await openDatabase();
      const orders = await database.getAllAsync(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await database.getAllAsync(
            'SELECT * FROM order_items WHERE order_id = ?',
            [order.id]
          );
          
          return {
            id: order.id,
            orderNumber: order.order_number,
            totalAmount: order.total_amount,
            status: order.status,
            shippingAddress: order.shipping_address,
            createdAt: order.created_at,
            items: items.map(item => ({
              id: item.product_id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          };
        })
      );
      
      return ordersWithItems;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const database = await openDatabase();
      await database.runAsync(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId]
      );
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },
};

/**
 * Favorites operations
 */
const favoritesOperations = {
  // Add to favorites
  addToFavorites: async (userId, product) => {
    try {
      const database = await openDatabase();
      await database.runAsync(
        `INSERT OR IGNORE INTO favorites (user_id, product_id, title, price, image)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, product.id, product.title, product.price, product.image]
      );
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  },

  // Remove from favorites
  removeFromFavorites: async (userId, productId) => {
    try {
      const database = await openDatabase();
      await database.runAsync(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  },

  // Get favorites
  getFavorites: async (userId) => {
    try {
      const database = await openDatabase();
      const results = await database.getAllAsync(
        'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      return results.map(item => ({
        id: item.product_id,
        title: item.title,
        price: item.price,
        image: item.image,
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Check if product is favorite
  isFavorite: async (userId, productId) => {
    try {
      const database = await openDatabase();
      const result = await database.getFirstAsync(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return !!result;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  },
};

/**
 * Database utilities
 */
const dbUtils = {
  // Drop all tables (for development/testing)
  dropAllTables: async () => {
    try {
      const database = await openDatabase();
      await database.execAsync(`
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS cart;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS users;
      `);
      console.log('All tables dropped');
      return true;
    } catch (error) {
      console.error('Error dropping tables:', error);
      return false;
    }
  },

  // Reset database
  resetDatabase: async () => {
    try {
      await dbUtils.dropAllTables();
      await initDatabase();
      console.log('Database reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      return false;
    }
  },

  // Get database statistics
  getStats: async () => {
    try {
      const database = await openDatabase();
      
      const userCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM users');
      const productCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM products');
      const cartCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM cart');
      const orderCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM orders');
      const favoriteCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM favorites');
      
      return {
        users: userCount.count,
        products: productCount.count,
        cartItems: cartCount.count,
        orders: orderCount.count,
        favorites: favoriteCount.count,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  },
};

export {
  initDatabase,
  userOperations,
  productOperations,
  cartOperations,
  orderOperations,
  favoritesOperations,
  dbUtils,
};

export default {
  init: initDatabase,
  user: userOperations,
  product: productOperations,
  cart: cartOperations,
  order: orderOperations,
  favorites: favoritesOperations,
  utils: dbUtils,
};
