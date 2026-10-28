import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface StatusChipProps {
  status: string;
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, style }) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('live') || s.includes('approved') || s.includes('track') || s.includes('released')) {
      return { dot: theme.colors.emerald, bg: theme.colors.emeraldSoft, text: theme.colors.emerald };
    }
    if (s.includes('pending') || s.includes('review') || s.includes('watch') || s.includes('in progress')) {
      return { dot: theme.colors.warning, bg: theme.colors.warningSoft, text: theme.colors.warning };
    }
    if (s.includes('action') || s.includes('reject') || s.includes('overdue') || s.includes('critical') || s.includes('alert')) {
      return { dot: theme.colors.danger, bg: theme.colors.dangerSoft, text: theme.colors.danger };
    }
    return { dot: theme.colors.textMuted, bg: theme.colors.surfaceSoft, text: theme.colors.textMuted };
  };

  const colors = getStatusColor();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
