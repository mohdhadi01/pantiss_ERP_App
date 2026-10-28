import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { GradientPreset, barGradients } from '../../theme/gradients';

export interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  /** Solid fill color; wins over `gradient` when both are set. */
  color?: string;
  /** Web bars use gradients (`from-red-600 to-rose-400`, `from-emerald-600 to-teal-400`). */
  gradient?: GradientPreset;
  /** Neutral track color override (defaults to theme border). */
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 7,
  color,
  gradient,
  trackColor,
  showLabel = false,
  label,
  style,
}) => {
  const { theme } = useTheme();
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const fillColor = color ?? theme.colors.brandPrimary;

  return (
    <View style={[styles.container, style]}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text numberOfLines={1} style={[styles.labelText, { color: theme.colors.textMuted }]}>
            {label ?? 'Progress'}
          </Text>
          <Text style={[styles.percentageText, { color: theme.colors.text }]}>{percentage}%</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: trackColor ?? theme.colors.surfaceMuted,
          },
        ]}
      >
        {gradient ? (
          <LinearGradient
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
            style={[styles.fill, { width: `${percentage}%`, borderRadius: height / 2 }]}
          />
        ) : (
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: fillColor, borderRadius: height / 2 }]} />
        )}
      </View>
    </View>
  );
};

/** Convenience: web `bg-gradient-to-r from-emerald-600 to-teal-400` bar. */
export const EmeraldBar: React.FC<Omit<ProgressBarProps, 'gradient'>> = (props) => (
  <ProgressBar gradient={barGradients.emerald} {...props} />
);

/** Convenience: web `bg-gradient-to-r from-red-600 to-rose-400` bar. */
export const RedBar: React.FC<Omit<ProgressBarProps, 'gradient'>> = (props) => (
  <ProgressBar gradient={barGradients.red} {...props} />
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    gap: 12,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
