

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import database from '../services/database';
import Header from '../components/Header';
import Button from '../components/Button';


const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    getCartTotal,
    clearCart,
    createOrder,
  } = useCart();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const TAX_RATE = 0.08; // 8% tax

  // Load default payment method
  useEffect(() => {
    loadDefaultPaymentMethod();
  }, [user]);

  // Calculate shipping cost
  useEffect(() => {
    const total = getCartTotal() || 0;
    if (total === 0) {
      setShippingCost(0);
    } else if (total >= 100) {
      setShippingCost(0); // Free shipping over $100
    } else {
      setShippingCost(9.99); // Flat rate shipping
    }
  }, [cartItems]);

  const loadDefaultPaymentMethod = async () => {
    try {
      if (user?.id) {
        const paymentMethods = await database.paymentMethod.getPaymentMethods(user.id);
        const defaultMethod = paymentMethods.find(pm => pm.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod);
        }
      }
    } catch (error) {
      console.error('Error loading payment method:', error);
    }
  };

  const handlePaymentMethodPress = () => {
    navigation.navigate('Payment', {
      fromCheckout: true,
      onPaymentSelected: (paymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
      },
    });
  };

 
  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  
  const handleCheckout = async () => {
    // Check if cart is empty
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    // Check if user is logged in
    if (!user || !user.id) {
      Alert.alert('Not Logged In', 'Please log in to proceed with checkout', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Profile'),
        },
      ]);
      return;
    }

    // Check if payment method is selected
    if (!selectedPaymentMethod) {
      Alert.alert(
        'No Payment Method',
        'Please select a payment method to continue',
        [
          {
            text: 'Add Payment Method',
            onPress: handlePaymentMethodPress,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    const subtotal = getCartTotal() || 0;
    const tax = subtotal * TAX_RATE;
    const grandTotal = subtotal + shippingCost + tax;
    const shippingAddress = user.address || '123 Main St, New York, USA';

    Alert.alert(
      'Confirm Order',
      `SHIPPING ADDRESS:\n${shippingAddress}\n\nORDER SUMMARY:\nSubtotal: $${subtotal.toFixed(2)}\nShipping: ${shippingCost === 0 ? 'FREE' : '$' + shippingCost.toFixed(2)}\nTax (8%): $${tax.toFixed(2)}\nTotal: $${grandTotal.toFixed(2)}\n\nPAYMENT METHOD:\n${selectedPaymentMethod?.cardType?.toUpperCase() || 'CARD'} •••• ${selectedPaymentMethod?.cardNumber?.slice(-4) || '****'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            try {
              const result = await createOrder(
                user.id,
                {
                  address: user.address || '123 Main St',
                  city: 'New York',
                  country: 'USA',
                },
                selectedPaymentMethod.id
              );

              if (result.success) {
                // Clear cart after successful order
                await clearCart();
                
                Alert.alert(
                  'Success',
                  'Your order has been placed and payment processed!',
                  [
                    {
                      text: 'View Orders',
                      onPress: () => {
                        // Navigate directly to Orders tab (same level)
                        navigation.navigate('Orders');
                      },
                    },
                    {
                      text: 'Continue Shopping',
                      onPress: () => {
                        navigation.navigate('Home');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to place order. Please try again.');
              }
            } catch (error) {
              console.error('Checkout error:', error);
              Alert.alert('Error', 'An unexpected error occurred during checkout');
            }
          },
        },
      ]
    );
  };

 
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>${item.price ? item.price.toFixed(2) : '0.00'}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decrementQuantity(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => incrementQuantity(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.title)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  
  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIconText}>CART</Text>
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add some products to get started</Text>
      <Button
        title="Start Shopping"
        onPress={() => navigation.navigate('Home')}
        style={styles.shopButton}
      />
    </View>
  );

  
  const renderFooter = () => {
    if (cartItems.length === 0) return null;

    const subtotal = getCartTotal() || 0;
    const tax = subtotal * TAX_RATE;
    const grandTotal = subtotal + shippingCost + tax;
    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return (
      <View style={styles.footer}>
        {/* Payment Method Section */}
        <TouchableOpacity
          style={styles.paymentMethodContainer}
          onPress={handlePaymentMethodPress}
          activeOpacity={0.7}
        >
          <View style={styles.paymentMethodHeader}>
            <Ionicons name="card-outline" size={24} color="#5B21B6" />
            <Text style={styles.paymentMethodLabel}>Payment Method</Text>
          </View>
          
          {selectedPaymentMethod ? (
            <View style={styles.selectedPaymentInfo}>
              <Text style={styles.selectedPaymentText}>
                {selectedPaymentMethod.cardType?.toUpperCase()} •••• {selectedPaymentMethod.cardNumber?.slice(-4) || '****'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          ) : (
            <View style={styles.addPaymentPrompt}>
              <Text style={styles.addPaymentText}>Add payment method</Text>
              <Ionicons name="chevron-forward" size={20} color="#5B21B6" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal ({itemCount} items)</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={[styles.totalValue, shippingCost === 0 && styles.freeShipping]}>
              {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
            </Text>
          </View>
          
          {shippingCost > 0 && subtotal < 100 && (
            <Text style={styles.shippingNote}>
              Add ${(100 - subtotal).toFixed(2)} more for free shipping!
            </Text>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (8%)</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <Button
          title="Checkout"
          onPress={handleCheckout}
          fullWidth
          size="large"
          style={styles.checkoutButton}
        />

        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Shopping Cart" />
      
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyCart}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B21B6',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B21B6',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  emptyIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B21B6',
    letterSpacing: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 16,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalContainer: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  freeShipping: {
    color: '#059669',
    fontWeight: 'bold',
  },
  shippingNote: {
    fontSize: 12,
    color: '#059669',
    marginTop: -4,
    marginBottom: 8,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#f3f0ff',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B21B6',
  },
  clearButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 10,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  paymentMethodContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  selectedPaymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedPaymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  addPaymentPrompt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
  },
});

export default CartScreen;
