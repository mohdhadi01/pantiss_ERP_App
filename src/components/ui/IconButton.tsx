import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export interface IconButtonProps {
  icon: string;
  size?: number;
  iconSize?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'outline' | 'ghost' | 'solid';
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 40,
  iconSize = 18,
  color,
  onPress,
  style,
  variant = 'outline',
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  const getVariantStyles = (pressed: boolean) => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent',
          borderColor: 'transparent',
        };
      case 'outline':
      default:
        return {
          backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surfaceSoft,
          borderColor: theme.colors.border,
        };
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || icon}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: 12,
          ...getVariantStyles(pressed),
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={color || theme.colors.textMuted}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
