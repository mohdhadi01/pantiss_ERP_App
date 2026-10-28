import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'emerald';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label?: string;
  title?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconName,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  const displayLabel = label || title || '';
  const displayIcon = icon || iconName;

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) onPress();
  };

  const getVariantStyles = (pressed: boolean): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surfaceSoft,
            borderColor: theme.colors.border,
            borderWidth: 1,
          },
          text: {
            color: theme.colors.text,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
            borderColor: theme.colors.borderStrong,
            borderWidth: 1,
          },
          text: {
            color: theme.colors.text,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: pressed ? '#b91c1c' : theme.colors.danger,
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'emerald':
        return {
          container: {
            backgroundColor: pressed ? theme.colors.emeraldDark : theme.colors.emerald,
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: theme.colors.textMuted,
          },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: pressed ? theme.colors.brandHover : theme.colors.brandPrimary,
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          fontSize: 12,
          iconSize: 14,
        };
      case 'lg':
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 14,
          fontSize: 15,
          iconSize: 18,
        };
      case 'md':
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          fontSize: 13,
          iconSize: 16,
        };
    }
  };

  const sizeCfg = getSizeStyles();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => {
        const v = getVariantStyles(pressed);
        return [
          styles.button,
          {
            paddingVertical: sizeCfg.paddingVertical,
            paddingHorizontal: sizeCfg.paddingHorizontal,
            borderRadius: sizeCfg.borderRadius,
            opacity: disabled ? 0.5 : 1,
            ...v.container,
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const v = getVariantStyles(pressed);
        if (loading) {
          return <ActivityIndicator size="small" color={v.text.color} />;
        }

        return (
          <View style={styles.contentRow}>
            {displayIcon && iconPosition === 'left' && (
              <Icon
                name={displayIcon}
                size={sizeCfg.iconSize}
                color={v.text.color as string}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  fontSize: sizeCfg.fontSize,
                  color: v.text.color,
                },
              ]}
            >
              {displayLabel}
            </Text>
            {displayIcon && iconPosition === 'right' && (
              <Icon
                name={displayIcon}
                size={sizeCfg.iconSize}
                color={v.text.color as string}
              />
            )}
          </View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
