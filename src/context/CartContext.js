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
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load cart from storage on initialization
   */
  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Save cart to storage whenever it changes
   */
  useEffect(() => {
    if (!loading) {
      saveCart();
    }
  }, [cartItems]);

  /**
   * Load cart from AsyncStorage
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
   * Save cart to AsyncStorage
   */
  const saveCart = async () => {
    try {
      await cartStorage.saveCart(cartItems);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Increment item quantity
   */
  const incrementQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /**
   * Decrement item quantity
   */
  const decrementQuantity = (productId) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity - 1;
            if (newQuantity <= 0) {
              return null; // Mark for removal
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item !== null); // Remove null items
    });
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    setCartItems([]);
    await cartStorage.clearCart();
  };

  /**
   * Get cart item count
   */
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Get cart total price
   */
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
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
  const createOrder = async (userId, shippingAddress) => {
    try {
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const orderData = {
        userId,
        items: cartItems,
        total: getCartTotal(),
        shippingAddress,
        itemCount: getCartItemCount(),
      };

      // Call API to create order
      const order = await orderAPI.createOrder(orderData);

      // Save order locally
      await ordersStorage.addOrder(order);

      // Clear cart after successful order
      await clearCart();

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
