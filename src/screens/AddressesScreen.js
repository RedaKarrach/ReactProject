/**
 * AddressesScreen - Manage Shipping Addresses
 * 
 * @author Reda Karrach - Address Management
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

const ADDRESSES_KEY = '@addresses';

/**
 * AddressesScreen Component
 * Manages shipping addresses
 */
const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  /**
   * Load addresses from storage
   */
  const loadAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem(ADDRESSES_KEY);
      if (data) {
        setAddresses(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  /**
   * Save address
   */
  const saveAddress = async () => {
    if (!formData.name || !formData.phone || !formData.street || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let updatedAddresses;
      
      if (editingAddress) {
        // Update existing address
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr
        );
      } else {
        // Add new address
        const newAddress = {
          ...formData,
          id: Date.now().toString(),
        };
        updatedAddresses = [...addresses, newAddress];
      }

      // If this is set as default, remove default from others
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr =>
          addr.id === (editingAddress?.id || updatedAddresses[updatedAddresses.length - 1].id)
            ? addr
            : { ...addr, isDefault: false }
        );
      }

      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      closeModal();
      Alert.alert('Success', `Address ${editingAddress ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  /**
   * Delete address
   */
  const deleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
              setAddresses(updatedAddresses);
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  /**
   * Set default address
   */
  const setDefaultAddress = async (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  /**
   * Open modal for adding/editing
   */
  const openModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: addresses.length === 0,
      });
    }
    setModalVisible(true);
  };

  /**
   * Close modal
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingAddress(null);
  };

  /**
   * Render address item
   */
  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      
      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressPhone}>{item.phone}</Text>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.zipCode}
      </Text>
      {item.country && <Text style={styles.addressText}>{item.country}</Text>}

      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDefaultAddress(item.id)}
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
          onPress={() => deleteAddress(item.id)}
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
      <Text style={styles.emptyIcon}>📍</Text>
      <Text style={styles.emptyTitle}>No Addresses Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add a shipping address to make checkout faster
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="My Addresses" showBack onBackPress={() => navigation.goBack()} />
      
      {addresses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.addButtonContainer}>
        <Button
          title="+ Add New Address"
          onPress={() => openModal()}
          variant="primary"
          fullWidth
        />
      </View>

      {/* Add/Edit Address Modal */}
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
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Doe"
              />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.street}
                onChangeText={(text) => setFormData({ ...formData, street: text })}
                placeholder="123 Main Street, Apt 4B"
              />

              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="New York"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.state}
                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                    placeholder="NY"
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>ZIP Code</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.zipCode}
                    onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                    placeholder="10001"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholder="United States"
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
                  {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
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
                  onPress={saveAddress}
                >
                  <Text style={styles.saveButtonText}>
                    {editingAddress ? 'Update' : 'Save'}
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
  addressCard: {
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
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    marginTop: 16,
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
  halfWidth: {
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

export default AddressesScreen;
