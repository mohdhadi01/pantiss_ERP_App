import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 6,
  color,
  showLabel = false,
  style,
}) => {
  const { theme } = useTheme();
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const barColor = color || (percentage >= 80 ? theme.colors.emerald : percentage >= 50 ? theme.colors.brandPrimary : theme.colors.warning);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.labelText, { color: theme.colors.textMuted }]}>Progress</Text>
          <Text style={[styles.percentageText, { color: theme.colors.text }]}>{percentage}%</Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: height / 2,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              height,
              backgroundColor: barColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
