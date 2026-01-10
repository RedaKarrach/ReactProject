

import database from './database';
import { hashPassword, verifyPassword } from '../utils/auth';

/**
 * User Model
 */
export const UserModel = {
  /**
   * Register new user
   */
  register: async (email, password, username = null) => {
    try {
      // Check if user already exists
      const existingUser = await database.user.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password (simple hash for demo - use bcrypt in production)
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const userId = await database.user.createUser(email, hashedPassword, username);
      
      // Get created user
      const user = await database.user.getUserById(userId);
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      // Get user
      const user = await database.user.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (userId) => {
    try {
      const user = await database.user.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, updates) => {
    try {
      // Check if email is already taken by another user
      if (updates.email) {
        const existingUser = await database.user.getUserByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already in use by another user');
        }
      }
      
      const success = await database.user.updateUser(userId, updates);
      if (!success) {
        throw new Error('Failed to update profile');
      }
      
      const user = await database.user.getUserById(userId);
      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};

/**
 * Product Model
 */
export const ProductModel = {
  /**
   * Sync products from API to database
   */
  syncProducts: async (products) => {
    try {
      await database.product.cacheProducts(products);
      return true;
    } catch (error) {
      console.error('Error syncing products:', error);
      return false;
    }
  },

  /**
   * Get all products
   */
  getAll: async () => {
    try {
      return await database.product.getCachedProducts();
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  /**
   * Get product by ID
   */
  getById: async (id) => {
    try {
      return await database.product.getProductById(id);
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  },
};

/**
 * Cart Model
 */
export const CartModel = {
  /**
   * Add item to cart
   */
  addItem: async (userId, product) => {
    try {
      return await database.cart.addToCart(userId, product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },

  /**
   * Get cart items
   */
  getItems: async (userId) => {
    try {
      return await database.cart.getCartItems(userId);
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  },

  /**
   * Update item quantity
   */
  updateQuantity: async (cartId, quantity) => {
    try {
      return await database.cart.updateCartQuantity(cartId, quantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId) => {
    try {
      return await database.cart.removeFromCart(cartId);
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  },

  /**
   * Clear cart
   */
  clear: async (userId) => {
    try {
      return await database.cart.clearCart(userId);
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  },

  /**
   * Get cart total
   */
  getTotal: async (userId) => {
    try {
      const items = await database.cart.getCartItems(userId);
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  },
};

/**
 * Order Model
 */
export const OrderModel = {
  /**
   * Create new order
   */
  create: async (userId, cartItems, shippingAddress, paymentMethodId = null) => {
    try {
      const totalAmount = cartItems.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
      
      // Format shipping address as string if it's an object
      const shippingAddressStr = typeof shippingAddress === 'string' 
        ? shippingAddress 
        : JSON.stringify(shippingAddress);
      
      const orderResult = await database.order.createOrder(
        userId,
        cartItems,
        totalAmount,
        shippingAddressStr
      );

      // If payment method provided, create payment record
      if (paymentMethodId) {
        try {
          await database.payment.createPayment(
            orderResult.id,
            userId,
            paymentMethodId,
            totalAmount,
            'card'
          );
        } catch (paymentError) {
          console.error('Error creating payment record:', paymentError);
          // Continue even if payment record fails
        }
      }
      
      return orderResult;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get user orders
   */
  getUserOrders: async (userId) => {
    try {
      return await database.order.getUserOrders(userId);
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  /**
   * Update order status
   */
  updateStatus: async (orderId, status) => {
    try {
      return await database.order.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },
};

/**
 * Favorites Model
 */
export const FavoritesModel = {
  /**
   * Add to favorites
   */
  add: async (userId, product) => {
    try {
      return await database.favorites.addToFavorites(userId, product);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  },

  /**
   * Remove from favorites
   */
  remove: async (userId, productId) => {
    try {
      return await database.favorites.removeFromFavorites(userId, productId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  },

  /**
   * Get favorites
   */
  getAll: async (userId) => {
    try {
      return await database.favorites.getFavorites(userId);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  /**
   * Check if product is favorite
   */
  isFavorite: async (userId, productId) => {
    try {
      return await database.favorites.isFavorite(userId, productId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  },

  /**
   * Toggle favorite
   */
  toggle: async (userId, product) => {
    try {
      const isFav = await database.favorites.isFavorite(userId, product.id);
      
      if (isFav) {
        await database.favorites.removeFromFavorites(userId, product.id);
        return false;
      } else {
        await database.favorites.addToFavorites(userId, product);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },
};

export default {
  User: UserModel,
  Product: ProductModel,
  Cart: CartModel,
  Order: OrderModel,
  Favorites: FavoritesModel,
};
