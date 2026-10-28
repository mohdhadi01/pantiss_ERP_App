import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface FunnelBarsProps {
  stages: FunnelStage[];
  /** Max bar height in px (web funnel bars scale with the tallest stage). */
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Recruitment pipeline funnel — the web's `rec-funnel`: one column per stage,
 * vertical bar heights ∝ count, count above, label below.
 */
export const FunnelBars: React.FC<FunnelBarsProps> = ({ stages, maxHeight = 110, style }) => {
  const { theme } = useTheme();
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <View style={[styles.row, style]}>
      {stages.map((stage) => {
        const height = Math.max(8, Math.round((stage.count / max) * maxHeight));
        return (
          <View key={stage.key} style={styles.column}>
            <Text style={[styles.count, { color: theme.colors.text }]}>{stage.count}</Text>
            <View style={[styles.barSlot, { height: maxHeight }]}>
              <LinearGradient
                colors={[stage.color, `${stage.color}B3`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.bar, { height, backgroundColor: stage.color }]}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[styles.label, { color: theme.colors.textMuted }]}
            >
              {stage.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barSlot: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 26,
    borderRadius: 7,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
