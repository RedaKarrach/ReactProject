/**
 * Shopping Cart Context
 * 
 * @author Reda Karrach - Core Logic & State Management
 * @author Sara Bellaly - Storage & Persistence
 * 
 * Manages shopping cart state, operations, and order creation.
 * Provides cart functionality across the entire application.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartStorage, ordersStorage } from '../services/storage';
import { orderAPI } from '../services/api';
import { CartModel, OrderModel } from '../services/models';
import { useAuth } from './AuthContext';

/**
 * Shopping Cart Context
 * 
 * @author Reda Karrach - State Management Logic
 * @author Sara Bellaly - Persistence Layer
 */

// Create Cart Context
const CartContext = createContext({});

/**
 * Cart Provider Component
 * Manages shopping cart state and operations
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load cart from database when user changes
   */
  useEffect(() => {
    if (user && user.id) {
      loadCartFromDatabase();
    } else {
      // No user, use local storage fallback
      loadCart();
    }
  }, [user]);

  /**
   * Load cart from database
   */
  const loadCartFromDatabase = async () => {
    try {
      if (user && user.id) {
        const items = await CartModel.getItems(user.id);
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
      // Fallback to storage
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load cart from AsyncStorage (fallback)
   */
  const loadCart = async () => {
    try {
      const storedCart = await cartStorage.getCart();
      setCartItems(storedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = async (product, quantity = 1) => {
    try {
      if (user && user.id) {
        // Add to database
        await CartModel.addItem(user.id, product);
        // Reload cart from database
        await loadCartFromDatabase();
      } else {
        // No user, update state only
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (item) => item.id === product.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return updatedItems;
          } else {
            return [...prevItems, { ...product, quantity }];
          }
        });
        // Save to storage
        await saveCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  /**
   * Save cart to AsyncStorage (fallback)
   */
  const saveCart = async () => {
    try {
      await cartStorage.saveCart(cartItems);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (productId) => {
    try {
      if (user && user.id) {
        // Find cart item
        const item = cartItems.find(i => i.id === productId);
        if (item && item.cartId) {
          await CartModel.removeItem(item.cartId);
          await loadCartFromDatabase();
        }
      } else {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== productId)
        );
        await saveCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  /**
   * Update item quantity
   */
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (user && user.id) {
        const item = cartItems.find(i => i.id === productId);
        if (item && item.cartId) {
          await CartModel.updateQuantity(item.cartId, quantity);
          await loadCartFromDatabase();
        }
      } else {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
        await saveCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  /**
   * Increment item quantity
   */
  const incrementQuantity = async (productId) => {
    const item = cartItems.find(i => i.id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + 1);
    }
  };

  /**
   * Decrement item quantity
   */
  const decrementQuantity = async (productId) => {
    const item = cartItems.find(i => i.id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity - 1);
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    try {
      if (user && user.id) {
        await CartModel.clear(user.id);
      }
      setCartItems([]);
      await cartStorage.clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  /**
   * Get cart item count
   */
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  /**
   * Get cart total price
   */
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  /**
   * Check if product is in cart
   */
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  /**
   * Get item quantity in cart
   */
  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  /**
   * Create order from cart
   */
  const createOrder = async (userId, shippingAddress, paymentMethodId = null) => {
    try {
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!userId || !user || !user.id) {
        throw new Error('User not logged in');
      }

      // Create order in database
      const order = await OrderModel.create(user.id, cartItems, shippingAddress, paymentMethodId);

      // Save order locally as backup
      await ordersStorage.addOrder(order);

      return { success: true, order };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  };

  // Context value
  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    isInCart,
    getItemQuantity,
    createOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom hook to use Cart Context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
