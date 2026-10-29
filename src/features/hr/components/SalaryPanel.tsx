import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { rupees } from '../helpers';

export const SalaryPanel: React.FC<{
  label: string;
  annual?: number;
  tone?: 'default' | 'highlight';
  caption?: string;
}> = ({ label, annual, tone = 'default', caption }) => {
  const { theme } = useTheme();
  const valid = annual !== undefined && Number.isFinite(annual) && annual > 0;
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: tone === 'highlight' ? theme.colors.successSoft : theme.colors.surfaceSoft,
          borderColor: tone === 'highlight' ? theme.colors.successBorder : theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: tone === 'highlight' ? theme.colors.successText : theme.colors.textSubtle }]}>
          {label}
        </Text>
        {caption ? <Text style={[styles.caption, { color: theme.colors.textSubtle }]}>{caption}</Text> : null}
      </View>
      <View style={styles.row}>
        <Text style={[styles.term, { color: theme.colors.textMuted }]}>Annual</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{valid ? rupees(annual!) : '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.term, { color: theme.colors.textMuted }]}>Monthly</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {valid ? rupees(Math.round(annual! / 12)) : '—'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  caption: {
    fontSize: 10.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  term: {
    fontSize: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
