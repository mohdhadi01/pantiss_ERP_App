import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon, IconSource } from './Icon';

export interface MetricCardProps {
  /** Small caption. Rendered under the value when `icon` is set (web finance KPI),
   *  above the value otherwise (web HR `cxo-metric`). */
  label: string;
  /** Big number / short text. */
  value: string | number;
  /** Bottom note line (web `mt-3 text-[10px]`). */
  subtitle?: string;
  /** 40px tinted icon tile (web `size-10 rounded-xl bg-{accent}-500/10`). */
  icon?: IconSource;
  iconColor?: string;
  /** Hex accent that also derives the icon-tile tint at 10%. */
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  /** Web finance cards show a top-right ArrowUpRight. */
  arrow?: boolean;
  onPress?: () => void;
  /** Value color override (e.g. emerald expenditure values on the web). */
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Web-parity KPI card. Value uses tabular-nums + tight tracking like the web's
 * `text-2xl font-semibold tracking-[-0.04em]`.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  iconColor,
  accentColor,
  trend,
  trendValue,
  arrow = false,
  onPress,
  valueColor,
  style,
}) => {
  const { theme } = useTheme();

  const accent = iconColor ?? accentColor ?? theme.colors.brandPrimary;
  const tileBg =
    accentColor && accentColor.startsWith('#')
      ? `${accentColor}1A`
      : theme.colors.surfaceMuted;

  const trendColor =
    trend === 'up'
      ? theme.colors.success
      : trend === 'down'
        ? theme.colors.danger
        : theme.colors.textMuted;

  const labelEl = (
    <Text numberOfLines={2} style={[styles.label, { color: theme.colors.textMuted }]}>
      {label}
    </Text>
  );

  const valueEl = (
    <Text
      numberOfLines={1}
      style={[
        styles.value,
        theme.fontStyles.metric,
        { color: valueColor ?? theme.colors.text },
      ]}
    >
      {value}
    </Text>
  );

  const noteEl =
    subtitle || trendValue ? (
      <View style={styles.noteRow}>
        {trendValue ? (
          <View style={styles.trendRow}>
            <Icon
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'}
              size={13}
              color={trendColor}
            />
            <Text style={[styles.noteText, { color: trendColor }]}>{trendValue}</Text>
          </View>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={2} style={[styles.noteText, { color: theme.colors.textSubtle }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: theme.radii.card,
          backgroundColor: theme.colors.moduleBg,
          borderColor: theme.colors.border,
          opacity: pressed && onPress ? 0.92 : 1,
          ...(theme.shadows.card as object),
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        {icon ? (
          <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
            <Icon name={icon} size={18} color={accent} strokeWidth={1.8} />
          </View>
        ) : (
          labelEl
        )}
        {arrow ? (
          <Icon name="ArrowUpRight" size={15} color={theme.colors.textSubtle} />
        ) : null}
      </View>

      {icon ? <View style={{ marginTop: 18 }}>{valueEl}</View> : valueEl}
      {icon ? labelEl : null}

      {noteEl ? <View style={{ marginTop: 10 }}>{noteEl}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 20,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 4,
  },
  value: {
    marginTop: 4,
  },
  noteRow: {
    gap: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  noteText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
});
