import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BadgeTone } from './Badge';

export type StatusTone = BadgeTone;

export interface StatusChipProps {
  status: string;
  tone?: StatusTone;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TONE_KEYWORDS: { tone: StatusTone; words: string[] }[] = [
  {
    tone: 'success',
    words: ['active', 'live', 'approved', 'on track', 'released', 'complete', 'compliant', 'finalised', 'finalized', 'disbursed', 'reconciled', 'onboarded', 'accepted', 'filed', 'paid', 'ready', 'verified', 'exported', 'settled'],
  },
  {
    tone: 'warning',
    words: ['pending', 'awaiting', 'review', 'watch', 'in progress', 'screening', 'interview', 'applied', 'draft', 'onboarding', 'unassigned', 'not', 'clarification', 'in-transit', 'due', 'returned', 'hold'],
  },
  {
    tone: 'danger',
    words: ['rejected', 'missing', 'no punch', 'declined', 'closed', 'cancelled', 'canceled', 'overdue', 'action required', 'alert', 'failed', 'expired'],
  },
  {
    tone: 'info',
    words: ['forwarded', 'po created', 'po sent', 'scheduled', 'raised', 'imported', 'new'],
  },
  {
    tone: 'violet',
    words: ['offer released', 'quota'],
  },
];

export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  for (const { tone, words } of TONE_KEYWORDS) {
    if (words.some((w) => s.includes(w))) return tone;
  }
  return 'neutral';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, tone, dot = true, style }) => {
  const { theme } = useTheme();
  const effectiveTone = tone ?? statusTone(status);

  const toneColors: Record<StatusTone, { bg: string; text: string; border: string }> = {
    success: { bg: theme.colors.successSoft, text: theme.colors.successText, border: theme.colors.successBorder },
    warning: { bg: theme.colors.warningSoft, text: theme.colors.warningText, border: theme.colors.warningBorder },
    danger: { bg: theme.colors.dangerSoft, text: theme.colors.dangerText, border: theme.colors.dangerBorder },
    info: { bg: theme.colors.infoSoft, text: theme.colors.infoText, border: theme.colors.brandRing },
    violet: { bg: 'rgba(124, 58, 237, 0.12)', text: theme.isDark ? '#c084fc' : '#7c3aed', border: 'rgba(124, 58, 237, 0.25)' },
    emerald: { bg: theme.colors.emeraldSoft, text: theme.colors.emerald, border: theme.colors.successBorder },
    brand: { bg: theme.colors.brandSoft, text: theme.colors.brandPrimary, border: theme.colors.brandRing },
    neutral: { bg: theme.colors.surfaceSoft, text: theme.colors.textMuted, border: theme.colors.border },
  };

  const colors = toneColors[effectiveTone];
  const dotColor = effectiveTone === 'neutral' ? theme.colors.textMuted : colors.text;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <Text numberOfLines={1} style={[styles.text, { color: colors.text }]}>
        {status}
      </Text>
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
    paddingHorizontal: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
