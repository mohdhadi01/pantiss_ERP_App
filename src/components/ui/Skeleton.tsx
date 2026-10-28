import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Pulsing placeholder block shown while stores hydrate (web skeleton shimmer equivalent). */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, radius = 8, style }) => {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceMuted,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
};

/** Full KPI-card skeleton used while dashboard data loads. */
export const SkeletonCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.moduleBg,
          padding: 20,
          gap: 12,
          flex: 1,
          minWidth: 140,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <Skeleton width={40} height={40} radius={12} />
        <Skeleton width={16} height={16} />
      </View>
      <Skeleton width="60%" height={24} radius={6} />
      <Skeleton width="40%" height={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
