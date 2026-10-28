import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  trendValue,
  accentColor,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.border,
          ...theme.shadows.card,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: theme.colors.textSubtle }]}>{label}</Text>
        {icon && (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: accentColor ? `${accentColor}1A` : theme.colors.surfaceMuted,
              },
            ]}
          >
            <Icon
              name={icon}
              size={18}
              color={iconColor || accentColor || theme.colors.brandPrimary}
            />
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>

      {(subtitle || trendValue) && (
        <View style={styles.bottomRow}>
          {trendValue && (
            <View style={styles.trendRow}>
              <Icon
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'}
                size={14}
                color={
                  trend === 'up'
                    ? theme.colors.emerald
                    : trend === 'down'
                    ? theme.colors.danger
                    : theme.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      trend === 'up'
                        ? theme.colors.emerald
                        : trend === 'down'
                        ? theme.colors.danger
                        : theme.colors.textMuted,
                  },
                ]}
              >
                {trendValue}
              </Text>
            </View>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flex: 1,
    minWidth: 150,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
  },
});
