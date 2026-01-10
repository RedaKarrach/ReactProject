import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import database from '../services/database';
import Header from '../components/Header';
import Button from '../components/Button';
import PaymentMethodCard from '../components/PaymentMethodCard';

const PaymentScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Get params from navigation (if coming from checkout)
  const { fromCheckout, onPaymentSelected } = route.params || {};

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      if (user?.id) {
        const methods = await database.paymentMethod.getPaymentMethods(user.id);
        setPaymentMethods(methods);
        
        // Auto-select default payment method
        const defaultMethod = methods.find(pm => pm.isDefault);
        if (defaultMethod) {
          setSelectedPaymentId(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const validateCardNumber = (number) => {
    // Remove spaces and validate
    const cleaned = number.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    
    return 'visa';
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryMonthChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryMonth(cleaned);
    }
  };

  const handleExpiryYearChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryYear(cleaned);
    }
  };

  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const validateForm = () => {
    if (!cardHolderName.trim()) {
      Alert.alert('Error', 'Please enter card holder name');
      return false;
    }

    if (!validateCardNumber(cardNumber)) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    const monthNum = parseInt(expiryMonth);
    if (!expiryMonth || expiryMonth.length !== 2 || monthNum < 1 || monthNum > 12) {
      Alert.alert('Error', 'Please enter a valid expiry month (01-12)');
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const yearNum = parseInt(expiryYear);
    
    if (!expiryYear || expiryYear.length !== 2) {
      Alert.alert('Error', 'Please enter a valid expiry year (YY)');
      return false;
    }
    
    // Check if card is expired
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      Alert.alert('Error', 'This card has expired');
      return false;
    }

    if (cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const cardType = detectCardType(cardNumber);
      const cleanedCardNumber = cardNumber.replace(/\s/g, '');

      const paymentData = {
        cardHolderName: cardHolderName.trim(),
        cardNumber: cleanedCardNumber,
        cardType,
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear: expiryYear,
        cvv,
        isDefault: paymentMethods.length === 0 ? true : isDefault,
      };

      await database.paymentMethod.addPaymentMethod(user.id, paymentData);
      
      Alert.alert('Success', 'Payment method added successfully');
      
      // Reset form
      setCardHolderName('');
      setCardNumber('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
      setIsDefault(false);
      setShowAddCard(false);
      
      // Reload payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
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
              await database.paymentMethod.deletePaymentMethod(paymentMethodId, user.id);
              await loadPaymentMethods();
              if (selectedPaymentId === paymentMethodId) {
                setSelectedPaymentId(null);
              }
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      await database.paymentMethod.setDefaultPaymentMethod(user.id, paymentMethodId);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleContinue = () => {
    if (!selectedPaymentId) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentId);
    
    if (fromCheckout && onPaymentSelected) {
      onPaymentSelected(selectedMethod);
      navigation.goBack();
    } else {
      Alert.alert('Success', 'Payment method selected');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Payment Methods" showBack onBack={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No payment methods added</Text>
            <Text style={styles.emptySubtext}>
              Add a payment method to make checkout easier
            </Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                paymentMethod={method}
                isSelected={selectedPaymentId === method.id}
                onSelect={() => setSelectedPaymentId(method.id)}
                onDelete={!fromCheckout ? handleDeletePaymentMethod : null}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddCard(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {fromCheckout && (
        <View style={styles.footer}>
          <Button
            title="Continue to Checkout"
            onPress={handleContinue}
            disabled={!selectedPaymentId}
          />
        </View>
      )}

      {/* Add Card Modal */}
      <Modal
        visible={showAddCard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddCard(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Card</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Holder Name</Text>
              <TextInput
                style={styles.input}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>Expiry Month</Text>
                <TextInput
                  style={styles.input}
                  value={expiryMonth}
                  onChangeText={handleExpiryMonthChange}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={[styles.formGroup, styles.flex1, styles.ml]}>
                <Text style={styles.label}>Expiry Year</Text>
                <TextInput
                  style={styles.input}
                  value={expiryYear}
                  onChangeText={handleExpiryYearChange}
                  placeholder="YY"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={[styles.formGroup, styles.flex1, styles.ml]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            {paymentMethods.length > 0 && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsDefault(!isDefault)}
              >
                <Ionicons
                  name={isDefault ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isDefault ? '#007AFF' : '#ccc'}
                />
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalFooter}>
              <Button
                title={loading ? 'Adding...' : 'Add Card'}
                onPress={handleAddPaymentMethod}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  methodsList: {
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginBottom: 80,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml: {
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalFooter: {
    marginTop: 24,
    marginBottom: 40,
  },
});

export default PaymentScreen;
