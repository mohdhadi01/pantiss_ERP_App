import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Timeline } from '../../../components/ui/Timeline';
import { Icon } from '../../../components/ui/Icon';
import type { Requisition } from '../data/procurementData';

// Types, status labels and seed data live in ../data/procurementData.ts —
// re-exported here so the view can keep importing everything from Parts.
export {
  STATUS_LABELS,
  statusLabel,
  procurementStamp,
  PROJECT_AREA,
  initialRequisitions,
  purchaseOrderHistory,
} from '../data/procurementData';
export type { ProcurementStatus, ProcQuote, ProcAuditEntry, Requisition } from '../data/procurementData';

/** Chip tones for the 6-stage status model. */
export const chipTones: Record<Requisition['status'], 'info' | 'warning' | 'violet' | 'brand' | 'success'> = {
  'Quotation review': 'info',
  Approved: 'warning',
  'PO Created': 'violet',
  'PO Sent': 'brand',
  'Invoice Reminder Sent': 'warning',
  'Payment slip uploaded': 'success',
};


/** Letter-avatar area tile (web procurement drill step 1). */
export const ProcAreaCard: React.FC<{
  name: string;
  color: string;
  projects: number;
  done: number;
  total: number;
  value: number;
  onPress: () => void;
}> = ({ name, color, projects, done, total, value, onPress }) => {
  const { theme } = useTheme();
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Pressable onPress={onPress} style={styles.areaCardWrap}>
      <Card padding={16} style={styles.areaCard}>
        <View style={styles.areaTop}>
          <View style={[styles.areaTile, { backgroundColor: `${color}1A` }]}>
            <Text style={[styles.areaTileText, { color }]}>{name.charAt(0)}</Text>
          </View>
          <View style={styles.areaTitle}>
            <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.areaMeta, { color: theme.colors.textSubtle }]}>
              {projects} project{projects !== 1 ? 's' : ''} · {total} request{total !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <ProgressBar value={pct} color={color} height={5} />
        <Text style={[styles.areaMeta, { color: theme.colors.textSubtle }]}>
          {done}/{total} complete
        </Text>
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
  const pct = total ? Math.round((done / total) * 100) : 0;
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
              {pending > 0 ? <StatusChip status={`${pending} pending`} tone="info" dot={false} /> : null}
              {done > 0 ? <StatusChip status={`${done} done`} tone="success" dot={false} /> : null}
            </View>
          </View>
        </View>
        <ProgressBar value={pct} height={5} color={theme.colors.financeAccent} />
        <Text style={[styles.areaValue, { color: theme.colors.textMuted }]}>Total procurement value {formatRupees(value)}</Text>
      </Card>
    </Pressable>
  );
};

/** Full quotation card in the review sheet (web ProcurementReviewOverlay quote article). */
export const ReviewQuoteCard: React.FC<{
  quote: Requisition['quotes'][number];
  ceiling: number;
  selected: boolean;
  lowest: boolean;
  canSelect: boolean;
  onView: () => void;
  onSelect: () => void;
}> = ({ quote, ceiling, selected, lowest, canSelect, onView, onSelect }) => {
  const { theme } = useTheme();
  const below = quote.amount <= ceiling;
  return (
    <View
      style={[
        styles.reviewCard,
        {
          borderColor: selected ? theme.colors.emerald : theme.colors.border,
          backgroundColor: selected ? theme.colors.emeraldSoft : theme.colors.surfaceSoft,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={styles.reviewCardTop}>
        <View style={[styles.docTile, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Icon name="FileText" size={15} color={theme.colors.textMuted} />
        </View>
        <View style={styles.badgeRow}>
          {lowest ? <StatusChip status="Lowest price" tone="info" dot={false} /> : null}
          {selected ? <StatusChip status="Selected" tone="emerald" dot={false} /> : null}
        </View>
      </View>
      <Text style={[styles.quoteVendor, { color: theme.colors.text }]}>{quote.vendor}</Text>
      <Text style={[styles.quoteFile, { color: theme.colors.textSubtle }]}>{quote.id} · {quote.file}</Text>
      <Text style={[styles.quoteAmount, { color: theme.colors.text }]}>{formatRupees(quote.amount)}</Text>
      <Text style={[styles.quoteCeiling, { color: below ? theme.colors.emerald : theme.colors.dangerText }]}>
        {below
          ? `${formatRupees(ceiling - quote.amount)} below ceiling`
          : `${formatRupees(quote.amount - ceiling)} above ceiling`}
      </Text>
      <View style={styles.quoteGrid}>
        <Spec label="Delivery" value={`${quote.deliveryDays} days`} />
        <Spec label="Warranty" value={quote.warranty} />
        <Spec label="Technical score" value={`${quote.technicalScore}/100`} />
        <Spec label="Tax" value={quote.gstIncluded ? 'GST included' : 'GST extra'} />
      </View>
      <View style={styles.reviewActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onView}
          style={[styles.reviewBtn, styles.reviewBtnOutline, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
        >
          <Icon name="Eye" size={12} color={theme.colors.textMuted} />
          <Text style={[styles.reviewBtnText, { color: theme.colors.textMuted }]}>View quote</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canSelect}
          onPress={onSelect}
          style={[styles.reviewBtn, { backgroundColor: selected ? theme.colors.emerald : theme.colors.brandPrimary, opacity: canSelect ? 1 : 0.4 }]}
        >
          <Text style={[styles.reviewBtnText, { color: '#ffffff' }]}>{selected ? 'Selected' : 'Select quote'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

/** Compact quote tile inside expanded rows (web ProcurementRequestRow quotes grid). */
export const MiniQuoteCard: React.FC<{
  quote: Requisition['quotes'][number];
  ceiling: number;
  selected: boolean;
  lowest: boolean;
}> = ({ quote, ceiling, selected, lowest }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.miniCard, { borderColor: selected ? theme.colors.emerald : theme.colors.border, backgroundColor: selected ? theme.colors.emeraldSoft : theme.colors.surfaceMuted }]}>
      <View style={styles.quoteTop}>
        <Text numberOfLines={1} style={[styles.miniVendor, { color: theme.colors.text }]}>{quote.vendor}</Text>
        <View style={styles.badgeRow}>
          {lowest ? <StatusChip status="Lowest" tone="info" dot={false} /> : null}
          {selected ? <StatusChip status="Selected" tone="emerald" dot={false} /> : null}
        </View>
      </View>
      <Text style={[styles.miniAmount, { color: theme.colors.text }]}>{formatRupees(quote.amount)}</Text>
      <Text style={[styles.quoteCeiling, { color: quote.amount <= ceiling ? theme.colors.emerald : theme.colors.dangerText }]}>
        {quote.amount <= ceiling
          ? `${formatRupees(ceiling - quote.amount)} below ceiling`
          : `${formatRupees(quote.amount - ceiling)} above ceiling`}
      </Text>
      <View style={styles.miniGrid}>
        <Spec label="Delivery" value={`${quote.deliveryDays}d`} />
        <Spec label="Warranty" value={quote.warranty} />
        <Spec label="Tech score" value={`${quote.technicalScore}/100`} />
        <Spec label="GST" value={quote.gstIncluded ? 'Incl.' : 'Extra'} />
      </View>
      <Text numberOfLines={1} style={[styles.quoteFile, { color: theme.colors.textMuted }]}>{quote.file}</Text>
    </View>
  );
};

const Spec: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.specCol}>
      <Text style={[styles.specLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.specValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

/** Expandable "Quotations & Bill" + "Audit Trail" block (web rows 1207-1288). */
export const ProcExpanded: React.FC<{ req: Requisition }> = ({ req }) => {
  const { theme } = useTheme();
  const lowest = req.quotes.length ? Math.min(...req.quotes.map((q) => q.amount)) : NaN;
  return (
    <View style={[styles.expanded, { backgroundColor: theme.colors.surfaceSoft, borderTopColor: theme.colors.border }]}>
      <View style={styles.expSection}>
        <View style={styles.expHeader}>
          <View style={[styles.expIcon, { backgroundColor: theme.colors.infoSoft }]}>
            <Icon name="FileText" size={13} color={theme.colors.infoText} />
          </View>
          <Text style={[styles.expTitle, { color: theme.colors.text }]}>Quotations &amp; Bill</Text>
        </View>
        {req.quotes.length ? (
          <View style={styles.miniGridWrap}>
            {req.quotes.map((quote) => (
              <MiniQuoteCard
                key={quote.id}
                quote={quote}
                ceiling={req.budgetCeiling}
                selected={quote.id === req.selectedQuoteId}
                lowest={quote.amount === lowest}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.expNote, { color: theme.colors.textSubtle }]}>
            No quotations recorded. Budget ceiling: {formatRupees(req.budgetCeiling)}
          </Text>
        )}
        {req.paymentSlip ? (
          <View style={[styles.docRow, { borderColor: theme.colors.successBorder, backgroundColor: theme.colors.emeraldSoft }]}>
            <Icon name="Receipt" size={13} color={theme.colors.emerald} />
            <Text numberOfLines={1} style={[styles.docRowText, { color: theme.colors.text }]}>{req.paymentSlip}</Text>
            <StatusChip status="Payment slip" tone="emerald" dot={false} />
          </View>
        ) : null}
        {req.purchaseOrderNo ? (
          <View style={[styles.docRow, { borderColor: theme.colors.brandRing, backgroundColor: theme.colors.brandSoft }]}>
            <Icon name="FileText" size={13} color={theme.colors.brandPrimary} />
            <Text style={[styles.docRowText, { color: theme.colors.brandPrimary }]}>Purchase Order: {req.purchaseOrderNo}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.expSection}>
        <View style={styles.expHeader}>
          <View style={[styles.expIcon, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}>
            <Icon name="History" size={13} color={theme.isDark ? '#c084fc' : '#7c3aed'} />
          </View>
          <Text style={[styles.expTitle, { color: theme.colors.text }]}>Audit Trail</Text>
          <StatusChip status={`${req.audit.length} events`} tone="violet" dot={false} />
        </View>
        {req.audit.length ? (
          <Timeline
            items={[...req.audit].reverse().map((entry, index) => ({
              key: `${entry.action}-${index}`,
              title: entry.action,
              actor: entry.actor,
              detail: entry.detail,
              time: entry.date,
            }))}
            accent={theme.colors.emerald}
          />
        ) : (
          <Text style={[styles.expNote, { color: theme.colors.textSubtle }]}>No audit events yet.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  areaCard: { gap: 13 },
  areaCardWrap: { flexGrow: 1, flexBasis: 280 },
  areaTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  areaTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  areaTileText: { fontSize: 16, fontWeight: '700' },
  areaTitle: { flex: 1, minWidth: 0, gap: 5 },
  areaName: { fontSize: 13.5, fontWeight: '600' },
  areaMeta: { fontSize: 10.5 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  areaValue: { fontSize: 11.5, fontVariant: ['tabular-nums'], marginTop: 1 },
  reviewCard: { borderRadius: 14, padding: 16, gap: 6, flexGrow: 1, flexBasis: 220 },
  reviewCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  docTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end' },
  quoteVendor: { fontSize: 13, fontWeight: '700' },
  quoteFile: { fontSize: 9.5 },
  quoteAmount: { fontSize: 21, fontWeight: '700', fontVariant: ['tabular-nums'] },
  quoteCeiling: { fontSize: 10, fontWeight: '600' },
  quoteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  specCol: { minWidth: 92, flexBasis: '45%' },
  specLabel: { fontSize: 9, marginBottom: 2 },
  specValue: { fontSize: 11.5, fontWeight: '700' },
  reviewActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  reviewBtn: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  reviewBtnOutline: { borderWidth: 1 },
  reviewBtnText: { fontSize: 10.5, fontWeight: '700' },
  quoteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  miniCard: { borderRadius: 12, padding: 12, gap: 4, flexGrow: 1, flexBasis: 170, borderWidth: 1 },
  miniVendor: { fontSize: 11.5, fontWeight: '700', flexShrink: 1 },
  miniAmount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  miniGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  expanded: { borderTopWidth: 1, padding: 14, gap: 18, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  expSection: { gap: 10 },
  expHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  expTitle: { fontSize: 12.5, fontWeight: '700', flex: 1 },
  expNote: { fontSize: 11 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginTop: 4 },
  docRowText: { flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: '600' },
});
