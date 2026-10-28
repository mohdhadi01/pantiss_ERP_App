import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'emerald' | 'violet' | 'brand';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone,
  variant,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const effectiveTone: BadgeTone = (
    variant === 'primary' ? 'brand' : (variant as BadgeTone) || tone || 'neutral'
  );

  const getToneColors = (): { bg: string; text: string; border: string } => {
    switch (effectiveTone) {
      case 'success':
      case 'emerald':
        return {
          bg: theme.colors.emeraldSoft,
          text: theme.colors.emerald,
          border: 'rgba(16, 185, 129, 0.25)',
        };
      case 'warning':
        return {
          bg: theme.colors.warningSoft,
          text: theme.colors.warning,
          border: 'rgba(245, 158, 11, 0.25)',
        };
      case 'danger':
        return {
          bg: theme.colors.dangerSoft,
          text: theme.colors.danger,
          border: 'rgba(239, 68, 68, 0.25)',
        };
      case 'info':
      case 'brand':
        return {
          bg: theme.colors.brandSoft,
          text: theme.colors.brandPrimary,
          border: theme.colors.brandRing,
        };
      case 'violet':
        return {
          bg: 'rgba(124, 58, 237, 0.12)',
          text: theme.isDark ? '#c084fc' : '#7c3aed',
          border: 'rgba(124, 58, 237, 0.25)',
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surfaceSoft,
          text: theme.colors.textMuted,
          border: theme.colors.border,
        };
    }
  };

  const colors = getToneColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 9,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 10 : 11,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
