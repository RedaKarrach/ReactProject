/**
 * Button Component
 * 
 * @author Achraf Oubakouz - UI Design & Variants
 * @author Reda Karrach - Component Architecture
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';

/**
 * Button Component
 * Reusable button with multiple variants
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const styles = [buttonStyles.button];

    // Size styles
    if (size === 'small') {
      styles.push(buttonStyles.small);
    } else if (size === 'large') {
      styles.push(buttonStyles.large);
    }

    // Variant styles
    if (variant === 'primary') {
      styles.push(buttonStyles.primary);
    } else if (variant === 'secondary') {
      styles.push(buttonStyles.secondary);
    } else if (variant === 'outline') {
      styles.push(buttonStyles.outline);
    } else if (variant === 'danger') {
      styles.push(buttonStyles.danger);
    }

    // State styles
    if (disabled) {
      styles.push(buttonStyles.disabled);
    }

    // Full width
    if (fullWidth) {
      styles.push(buttonStyles.fullWidth);
    }

    // Custom style
    if (style) {
      styles.push(style);
    }

    return styles;
  };

  const getTextStyle = () => {
    const styles = [buttonStyles.text];

    // Size styles
    if (size === 'small') {
      styles.push(buttonStyles.textSmall);
    } else if (size === 'large') {
      styles.push(buttonStyles.textLarge);
    }

    // Variant styles
    if (variant === 'outline') {
      styles.push(buttonStyles.textOutline);
    }

    // Custom text style
    if (textStyle) {
      styles.push(textStyle);
    }

    return styles;
  };

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 20,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 2,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' ? '#2563eb' : '#fff'}
            size="small"
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  disabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
  textOutline: {
    color: '#2563eb',
  },
});

export default Button;
