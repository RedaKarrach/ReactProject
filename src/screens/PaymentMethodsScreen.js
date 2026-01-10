/**
 * PaymentMethodsScreen - Manage Payment Methods
 * 
 * @author Reda Karrach - Payment Management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Button from '../components/Button';

const PAYMENT_METHODS_KEY = '@payment_methods';

/**
 * PaymentMethodsScreen Component
 * Manages payment methods
 */
const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'card',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  /**
   * Load payment methods from storage
   */
  const loadPaymentMethods = async () => {
    try {
      const data = await AsyncStorage.getItem(PAYMENT_METHODS_KEY);
      if (data) {
        setPaymentMethods(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  /**
   * Save payment method
   */
  const savePaymentMethod = async () => {
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryMonth || !formData.expiryYear) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Basic validation
    if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Error', 'Invalid card number');
      return;
    }

    if (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      Alert.alert('Error', 'Invalid expiry month (1-12)');
      return;
    }

    try {
      let updatedMethods;
      
      if (editingMethod) {
        // Update existing method
        updatedMethods = paymentMethods.map(method =>
          method.id === editingMethod.id ? { ...formData, id: method.id } : method
        );
      } else {
        // Add new method
        const newMethod = {
          ...formData,
          id: Date.now().toString(),
        };
        updatedMethods = [...paymentMethods, newMethod];
      }

      // If this is set as default, remove default from others
      if (formData.isDefault) {
        updatedMethods = updatedMethods.map(method =>
          method.id === (editingMethod?.id || updatedMethods[updatedMethods.length - 1].id)
            ? method
            : { ...method, isDefault: false }
        );
      }

      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
      setPaymentMethods(updatedMethods);
      closeModal();
      Alert.alert('Success', `Payment method ${editingMethod ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  /**
   * Delete payment method
   */
  const deletePaymentMethod = (methodId) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
              await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
              setPaymentMethods(updatedMethods);
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  /**
   * Set default payment method
   */
  const setDefaultMethod = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }));
      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods));
      setPaymentMethods(updatedMethods);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  /**
   * Open modal for adding/editing
   */
  const openModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData(method);
    } else {
      setEditingMethod(null);
      setFormData({
        type: 'card',
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: paymentMethods.length === 0,
      });
    }
    setModalVisible(true);
  };

  /**
   * Close modal
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingMethod(null);
  };

  /**
   * Format card number for display
   */
  const formatCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    return '**** **** **** ' + cleaned.slice(-4);
  };

  /**
   * Get card type icon
   */
  const getCardIcon = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return '💳'; // Visa
    if (cleaned.startsWith('5')) return '💳'; // Mastercard
    if (cleaned.startsWith('3')) return '💳'; // Amex
    return '💳';
  };

  /**
   * Format card number input
   */
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setFormData({ ...formData, cardNumber: formatted });
  };

  /**
   * Render payment method item
   */
  const renderMethod = ({ item }) => (
    <View style={styles.methodCard}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{getCardIcon(item.cardNumber)}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNumber}>{formatCardNumber(item.cardNumber)}</Text>
          <Text style={styles.cardHolder}>{item.cardHolder}</Text>
          <Text style={styles.cardExpiry}>
            Expires: {item.expiryMonth}/{item.expiryYear}
          </Text>
        </View>
      </View>

      <View style={styles.methodActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDefaultMethod(item.id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deletePaymentMethod(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>No Payment Methods Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add a payment method for faster checkout
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Payment Methods" showBack onBackPress={() => navigation.goBack()} />
      
      {paymentMethods.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={paymentMethods}
          renderItem={renderMethod}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.addButtonContainer}>
        <Button
          title="+ Add Payment Method"
          onPress={() => openModal()}
          variant="primary"
          fullWidth
        />
      </View>

      {/* Add/Edit Payment Method Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.securityNote}>
                🔒 Your payment information is securely stored
              </Text>

              <Text style={styles.label}>Card Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />

              <Text style={styles.label}>Card Holder Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.cardHolder}
                onChangeText={(text) => setFormData({ ...formData, cardHolder: text.toUpperCase() })}
                placeholder="JOHN DOE"
                autoCapitalize="characters"
              />

              <View style={styles.row}>
                <View style={styles.expiryContainer}>
                  <Text style={styles.label}>Expiry Month *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryMonth}
                    onChangeText={(text) => setFormData({ ...formData, expiryMonth: text })}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={styles.expiryContainer}>
                  <Text style={styles.label}>Expiry Year *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryYear}
                    onChangeText={(text) => setFormData({ ...formData, expiryYear: text })}
                    placeholder="YY"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={styles.cvvContainer}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cvv}
                    onChangeText={(text) => setFormData({ ...formData, cvv: text })}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
                  {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={savePaymentMethod}
                >
                  <Text style={styles.saveButtonText}>
                    {editingMethod ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  listContent: {
    padding: 16,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  defaultBadge: {
    backgroundColor: '#5B21B6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardHolder: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#9ca3af',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  addButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  securityNote: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: '#166534',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryContainer: {
    flex: 1,
  },
  cvvContainer: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B21B6',
    borderColor: '#5B21B6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#5B21B6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PaymentMethodsScreen;
