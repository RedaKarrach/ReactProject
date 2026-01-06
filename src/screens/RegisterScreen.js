/**
 * RegisterScreen - User Registration
 * 
 * @author Reda Karrach - Registration Logic
 * @author Achraf Oubakouz - Form UI Design
 * @author Sara Bellaly - Validation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';


const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Animations (mount + stagger)
  const cardAnim = useRef(new Animated.Value(0)).current; // opacity + translateY
  const avatarScale = useRef(new Animated.Value(0)).current; // bounce
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const inputAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.stagger(
          110,
          inputAnims.map((a) => Animated.timing(a, { toValue: 1, duration: 360, useNativeDriver: true }))
        ),
        Animated.timing(footerAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle registration
   */
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const result = await register(name.trim(), email.trim(), password);

      if (!result.success) {
        Alert.alert('Registration Failed', result.error || 'Please try again');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to login screen
   */
  const navigateToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backgroundDecorLeft} />
        <View style={styles.backgroundDecorRight} />

        <View style={styles.centered}>
          <View style={styles.card}>
            {/* Brand / Avatar */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>�️</Text>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us and start shopping</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                error={errors.name}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                error={errors.confirmPassword}
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                style={styles.registerButton}
              />

              <View style={styles.termsRow}>
                <Text style={styles.termsText}>By signing up you agree to our </Text>
                <TouchableOpacity onPress={() => Alert.alert('Terms', 'Open Terms & Privacy')}>
                  <Text style={styles.linkText}>Terms & Privacy</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                title="Sign In"
                onPress={navigateToLogin}
                variant="outline"
                size="small"
                style={styles.signInButton}
                textStyle={styles.signInText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  backgroundDecorLeft: {
    position: 'absolute',
    top: -120,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#6d28d9',
    opacity: 0.16,
    transform: [{ rotate: '15deg' }],
  },
  backgroundDecorRight: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#ff6b6b',
    opacity: 0.10,
    transform: [{ rotate: '-20deg' }],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -56,
    marginBottom: 12,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#5B21B6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 42,
    color: '#ffffff',
    fontWeight: '700',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    marginTop: 8,
  },
  registerButton: {
    marginTop: 8,
    backgroundColor: '#5B21B6',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  linkText: {
    fontSize: 12,
    color: '#C4B5FD',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  footer: {
    marginTop: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#d6ccff',
    marginRight: 8,
  },
  signInButton: {
    borderColor: '#5B21B6',
    borderWidth: 0,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#5B21B6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  signInText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default RegisterScreen;
