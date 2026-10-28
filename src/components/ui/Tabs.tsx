import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon, IconSource } from './Icon';

export interface TabItem {
  key: string;
  label: string;
  icon?: IconSource;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Accent color for the active pill (module accent — emerald for Finance, brand blue for HR). */
  accent?: string;
  /** `soft` = web segmented accent-soft; `elevated` = web hr-tabs white card style. */
  variant?: 'soft' | 'elevated';
  style?: StyleProp<ViewStyle>;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeKey, onChange, accent, variant = 'soft', style }) => {
  const { theme } = useTheme();
  const activeColor = accent ?? theme.colors.brandPrimary;
  const activeSoft = variant === 'elevated' ? theme.colors.moduleBg : `${toSoftBg(activeColor)}`;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.row, style]}
      keyboardShouldPersistTaps="handled"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.tab,
              {
                backgroundColor: active ? activeSoft : 'transparent',
                borderColor: active ? theme.colors.borderStrong : 'transparent',
                opacity: pressed ? 0.85 : 1,
                ...(variant === 'elevated' && active ? (theme.shadows.sm as object) : {}),
              },
            ]}
          >
            {item.icon ? (
              <Icon name={item.icon} size={15} color={active ? activeColor : theme.colors.textMuted} strokeWidth={1.9} />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: active ? activeColor : theme.colors.textMuted, fontWeight: active ? '600' : '500' },
              ]}
            >
              {item.label}
            </Text>
            {typeof item.count === 'number' ? (
              <View
                style={[
                  styles.count,
                  { backgroundColor: active ? activeColor : theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: active ? '#ffffff' : theme.colors.textMuted },
                  ]}
                >
                  {item.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

/** Derives a 10% soft background from any hex accent (web `{color}-500/10`). */
function toSoftBg(hex: string): string {
  if (hex.startsWith('#') && hex.length === 7) return `${hex}1A`;
  if (hex.startsWith('#') && hex.length === 9) return hex;
  return 'rgba(128, 144, 168, 0.12)';
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 12.5,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
