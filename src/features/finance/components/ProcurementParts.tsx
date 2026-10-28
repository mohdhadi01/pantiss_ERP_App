import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Icon } from '../../../components/ui/Icon';
import { Requisition } from './ProcurementView';

/** Letter-avatar area tile (web procurement drill step 1). */
export const ProcAreaCard: React.FC<{
  name: string;
  color: string;
  done: number;
  total: number;
  value: number;
  onPress: () => void;
}> = ({ name, color, done, total, value, onPress }) => {
  const { theme } = useTheme();
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Pressable onPress={onPress}>
      <Card padding={16} style={styles.areaCard}>
        <View style={styles.areaTop}>
          <View style={[styles.areaTile, { backgroundColor: `${color}1A` }]}>
            <Text style={[styles.areaTileText, { color }]}>{name.charAt(0)}</Text>
          </View>
          <View style={styles.areaTitle}>
            <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.areaMeta, { color: theme.colors.textSubtle }]}>
              {done}/{total} complete
            </Text>
          </View>
        </View>
        <ProgressBar value={pct} color={color} height={5} />
        <Text style={[styles.areaValue, { color: theme.colors.textMuted }]}>
          Total procurement value {formatRupees(value)}
        </Text>
      </Card>
    </Pressable>
  );
};

/** Landmark-tile project card (web drill step 2). */
export const ProcProjectCard: React.FC<{
  project: string;
  total: number;
  pending: number;
  done: number;
  value: number;
  onPress: () => void;
}> = ({ project, total, pending, done, value, onPress }) => {
  const { theme } = useTheme();
  const pct = total ? Math.round(((total - pending) / total) * 100) : 0;
  return (
    <Pressable onPress={onPress}>
      <Card padding={16} style={styles.areaCard}>
        <View style={styles.areaTop}>
          <View style={[styles.areaTile, { backgroundColor: theme.colors.infoSoft }]}>
            <Icon name="Landmark" size={17} color={theme.colors.infoText} strokeWidth={1.8} />
          </View>
          <View style={styles.areaTitle}>
            <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{project}</Text>
            <View style={styles.pillRow}>
              <StatusChip status={`${total} requests`} tone="neutral" dot={false} />
              <StatusChip status={`${pending} pending`} tone={pending ? 'warning' : 'success'} dot={false} />
              <StatusChip status={`${done} done`} tone="success" dot={false} />
            </View>
          </View>
        </View>
        <ProgressBar value={pct} height={5} color={theme.colors.financeAccent} />
        <Text style={[styles.areaValue, { color: theme.colors.textMuted }]}>Total procurement value {formatRupees(value)}</Text>
      </Card>
    </Pressable>
  );
};

/** Vendor quotation mini-card (compare modal). */
export const QuoteCard: React.FC<{
  vendor: string;
  amount: number;
  leadTime: string;
  rating: string;
  lowest: boolean;
}> = ({ vendor, amount, leadTime, rating, lowest }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.quoteCard,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: lowest ? theme.colors.financeAccent : theme.colors.border,
          borderWidth: lowest ? 2 : 1,
        },
      ]}
    >
      <View style={styles.quoteTop}>
        <Text style={[styles.quoteVendor, { color: theme.colors.text }]}>{vendor}</Text>
        {lowest ? <StatusChip status="Lowest quote" tone="success" dot={false} /> : null}
      </View>
      <Text style={[styles.quoteAmount, { color: theme.colors.financeAccent }]}>{formatRupees(amount)}</Text>
      <Text style={[styles.quoteMeta, { color: theme.colors.textSubtle }]}>Delivery {leadTime} · Rating {rating}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  areaCard: { flexGrow: 1, flexBasis: 280, gap: 10 },
  areaTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  areaTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  areaTileText: { fontSize: 16, fontWeight: '700' },
  areaTitle: { flex: 1, minWidth: 0, gap: 4 },
  areaName: { fontSize: 13.5, fontWeight: '600' },
  areaMeta: { fontSize: 10.5 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  areaValue: { fontSize: 11, fontVariant: ['tabular-nums'] },
  quoteCard: { borderRadius: 14, padding: 14, gap: 6, flexGrow: 1, flexBasis: 170 },
  quoteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  quoteVendor: { fontSize: 12.5, fontWeight: '600', flexShrink: 1 },
  quoteAmount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  quoteMeta: { fontSize: 10.5 },
});

export type RequisitionStatus = Requisition['status'];
