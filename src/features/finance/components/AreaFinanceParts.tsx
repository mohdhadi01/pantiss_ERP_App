import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { FinanceStackNav } from '../../../navigation/types';
import { useTheme } from '../../../hooks/useTheme';
import { FinanceArea, FinanceProject, formatCurrency } from '../data';
import { useBooksStore } from '../booksStore';
import { BookEntry } from '../booksData';
import { budgetCategories } from '../budgetCategories';
import { projectTranches, trancheAmountLakhs } from '../data/tranchesData';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../../utils/formatDate';
import { exportCsv } from '../../../utils/exportCsv';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { Button } from '../../../components/ui/Button';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline, TimelineItem } from '../../../components/ui/Timeline';

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabelOf = (key: string) =>
  new Date(`${key}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

function buildMonthOptions(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let offset = -3; offset <= 8; offset += 1) {
    keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() + offset, 1)));
  }
  return keys;
}

const monthChipShort = (key: string) =>
  new Date(`${key}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

export const MonthlyOverview: React.FC<{ area: FinanceArea }> = ({ area }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<FinanceStackNav>();
  const { entries } = useBooksStore();
  const options = useMemo(() => buildMonthOptions(), []);
  const [month, setMonth] = useState(() => monthKey(new Date()));

  const scheduled = useMemo(
    () =>
      projectTranches
        .filter((t) => t.areaId === area.id && t.tentativeDate.startsWith(`${month}-`))
        .map((tranche) => {
          const project = area.projects.find((p) => p.id === tranche.projectId);
          return project ? { tranche, amount: trancheAmountLakhs(project, tranche) } : null;
        })
        .filter((item): item is { tranche: (typeof projectTranches)[number]; amount: number } => item !== null),
    [area, month],
  );

  const projectIdSet = useMemo(() => new Set(area.projects.map((p) => p.id)), [area]);
  const monthEntries = entries.filter((e) => e.date.startsWith(`${month}-`) && projectIdSet.has(e.projectId));
  const inflow = scheduled.reduce((sum, item) => sum + item.amount, 0);
  const outflow = monthEntries.reduce((sum, e) => sum + e.amount, 0) / 100000;
  const pending = scheduled.filter((item) => !item.tranche.invoiceId);
  const ready = pending.filter((item) => item.tranche.adminApproved).length;
  const pendingValue = pending.reduce((sum, item) => sum + item.amount, 0);
  const label = monthLabelOf(month);

  return (
    <View style={styles.monthlySection}>
      <View style={styles.monthlyHeader}>
        <View style={styles.monthlyHeaderText}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Monthly overview</Text>
          <Text style={[styles.monthlySub, { color: theme.colors.textSubtle }]}>
            Cashflow planning and upcoming billing for {area.name}.
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {options.map((key) => {
            const selected = key === month;
            return (
              <Pressable
                key={key}
                onPress={() => setMonth(key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.monthChip,
                  {
                    backgroundColor: selected ? theme.colors.financeAccent : theme.colors.moduleBg,
                    borderColor: selected ? theme.colors.financeAccent : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.monthChipText, { color: selected ? '#ffffff' : theme.colors.textMuted }]}
                >
                  {monthChipShort(key)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.monthlyGrid}>
        <Card padding={18} style={styles.monthlyCard}>
          <View style={styles.monthlyCardHead}>
            <View style={[styles.monthlyIconTile, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Icon name="WalletCards" size={18} color={theme.colors.financeAccent} strokeWidth={1.8} />
            </View>
            <View style={styles.monthlyCardHeadText}>
              <Text style={[styles.monthlyCardTitle, { color: theme.colors.text }]}>Monthly cashflow</Text>
              <Text style={[styles.monthlyCardSub, { color: theme.colors.textSubtle }]}>{label} · Forecast</Text>
            </View>
          </View>
          <Text style={[styles.monthlyValue, { color: theme.colors.text }]}>
            {formatCurrency(inflow - outflow, true)}
          </Text>
          <Text style={[styles.monthlyValueNote, { color: theme.colors.textMuted }]}>
            Scheduled inflows less recorded expenditure
          </Text>
          <View style={[styles.monthlyStats, { backgroundColor: theme.colors.surfaceSoft }]}>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyStatLabel, { color: theme.colors.textMuted }]}>Scheduled inflows</Text>
              <Text style={[styles.monthlyStatValue, { color: theme.colors.text }]}>
                {formatCurrency(inflow, true)}
              </Text>
            </View>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyStatLabel, { color: theme.colors.textMuted }]}>Recorded expenditure</Text>
              <Text style={[styles.monthlyStatValue, { color: theme.colors.text }]}>
                {formatCurrency(outflow, true)}
              </Text>
            </View>
          </View>
          <Text style={[styles.monthlyNote, { color: theme.colors.textSubtle }]}>
            Inflows follow tentative tranche dates, not confirmed receipts. Expenditure includes only entries
            recorded in Books.{monthEntries.length === 0 ? ' No expenditure recorded for this month.' : ''}
          </Text>
          <SheetLink label="View expenditure books" theme={theme} onPress={() => navigation.navigate('Books')} />
        </Card>

        <Card padding={18} style={styles.monthlyCard}>
          <View style={styles.monthlyCardHead}>
            <View style={[styles.monthlyIconTile, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Icon name="FileText" size={18} color={theme.colors.financeAccent} strokeWidth={1.8} />
            </View>
            <View style={styles.monthlyCardHeadText}>
              <Text style={[styles.monthlyCardTitle, { color: theme.colors.text }]}>Invoices to be raised</Text>
              <Text style={[styles.monthlyCardSub, { color: theme.colors.textSubtle }]}>
                Tranches scheduled for {label}
              </Text>
            </View>
          </View>
          <Text style={[styles.monthlyValue, { color: theme.colors.text }]}>
            {formatCurrency(pendingValue, true)}
          </Text>
          <Text style={[styles.monthlyValueNote, { color: theme.colors.textMuted }]}>
            {pending.length} {pending.length === 1 ? 'tranche awaiting an invoice' : 'tranches awaiting invoices'}
          </Text>
          <View style={[styles.monthlyStats, { backgroundColor: theme.colors.surfaceSoft }]}>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyStatLabel, { color: theme.colors.textMuted }]}>Ready to raise</Text>
              <Text style={[styles.monthlyStatValue, { color: theme.colors.text }]}>{ready}</Text>
            </View>
            <View style={styles.monthlyStat}>
              <Text style={[styles.monthlyStatLabel, { color: theme.colors.textMuted }]}>Awaiting approval</Text>
              <Text style={[styles.monthlyStatValue, { color: theme.colors.text }]}>{pending.length - ready}</Text>
            </View>
          </View>
          <Text style={[styles.monthlyNote, { color: theme.colors.textSubtle }]}>
            {pending.length
              ? 'Raise invoices against approved tranches. Tranches already linked to an invoice are excluded.'
              : 'No scheduled tranches are awaiting invoices this month.'}
          </Text>
          <SheetLink
            label="Review area invoices"
            theme={theme}
            onPress={() => navigation.navigate('Invoices')}
          />
        </Card>
      </View>
    </View>
  );
};

const SheetLink: React.FC<{ label: string; theme: ReturnType<typeof useTheme>['theme']; onPress: () => void }> = ({
  label,
  theme,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="link"
    style={({ pressed }) => [
      styles.sheetLink,
      { borderColor: theme.colors.border, opacity: pressed ? 0.8 : 1 },
    ]}
  >
    <Text style={[styles.sheetLinkText, { color: theme.colors.financeAccent }]}>{label}</Text>
    <Icon name="ArrowUpRight" size={15} color={theme.colors.financeAccent} />
  </Pressable>
);

export const ProjectLedgerSheet: React.FC<{ project: FinanceProject | null; onClose: () => void }> = ({
  project,
  onClose,
}) => {
  const { theme } = useTheme();
  const { entries } = useBooksStore();
  const [query, setQuery] = useState('');
  const [component, setComponent] = useState('all');
  const [notice, setNotice] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setQuery('');
      setComponent('all');
      setNotice('');
      setExpandedId(null);
    }
  }, [project?.id]);

  if (!project) return null;

  const projectEntries = entries.filter((e) => e.projectId === project.id);
  const q = query.trim().toLowerCase();
  const visible = projectEntries
    .filter((e) => component === 'all' || e.head === component)
    .filter((e) => `${e.payee} ${e.reference} ${e.narration} ${e.id}`.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const openingDetail = projectEntries.filter((e) => e.openingIncluded).reduce((sum, e) => sum + e.amount, 0);
  const additional = projectEntries.filter((e) => !e.openingIncluded).reduce((sum, e) => sum + e.amount, 0);

  const handleExport = async () => {
    const result = await exportCsv(`ledger-${project.id}.csv`, ['Date', 'Reference', 'Payee', 'Component', 'Narration', 'Amount (INR)', 'Source'], visible.map((e) => [e.date, e.reference, e.payee, e.head, e.narration, e.amount, e.source === 'tally' ? 'Tally import' : 'Manual entry']));
    setNotice(result.message);
  };

  return (
    <ModalSheet
      visible
      onClose={onClose}
      label="Project finances"
      title={project.name}
      description={`${project.id} · ${project.donor} · ${project.location}`}
      size="xl"
    >
      <View>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
          Component-wise expenditure ledger
        </Text>
        <Text style={[styles.ledgerIntro, { color: theme.colors.textMuted }]}>
          Review every recorded Books entry and expand an expenditure to inspect its details and audit history.
        </Text>
      </View>

      <View style={styles.ledgerStatsRow}>
        {[
          ['Opening expenditure', formatRupees(Math.round(project.spent * 100000))],
          ['Additional expenditure', formatRupees(Math.round(additional))],
          ['Total expenditure', formatRupees(Math.round(project.spent * 100000 + additional))],
        ].map(([statLabel, value]) => (
          <View key={statLabel} style={[styles.ledgerStat, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[styles.ledgerStatLabel, { color: theme.colors.textMuted }]}>{statLabel}</Text>
            <Text style={[styles.ledgerStatValue, { color: theme.colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ledgerFilters}>
        <TextField value={query} onChangeText={setQuery} placeholder="Payee, reference or narration" containerStyle={styles.ledgerSearch} />
        <SelectField
          value={component}
          onChange={setComponent}
          options={[{ value: 'all', label: 'All components' }, ...budgetCategories.map((c) => ({ value: c, label: c }))]}
          placeholder="Component"
          containerStyle={styles.ledgerComponent}
        />
      </View>

      <View style={styles.ledgerCountRow}>
        <Text style={[styles.ledgerCount, { color: theme.colors.textMuted }]}>
          {visible.length} entries · {formatRupees(Math.round(visible.reduce((sum, e) => sum + e.amount, 0)))} in this view
        </Text>
        <Button label="Export entries" icon="Download" variant="outline" size="sm" onPress={handleExport} disabled={!visible.length} />
      </View>
      {notice ? <Text style={[styles.ledgerNotice, { color: theme.colors.successText }]}>{notice}</Text> : null}

      <View style={styles.ledgerList}>
        {visible.map((entry) => (
          <LedgerEntry
            key={entry.id}
            entry={entry}
            expanded={expandedId === entry.id}
            onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          />
        ))}
        {!visible.length ? (
          <Text style={[styles.ledgerEmpty, { color: theme.colors.textMuted }]}>
            No recorded expenditure matches this component and the current filters.
          </Text>
        ) : null}
      </View>

      <Text style={[styles.ledgerFootnote, { color: theme.colors.textSubtle }]}>
        Only recorded events are shown. Approval and payment evidence are not attached to this Books record.
      </Text>
    </ModalSheet>
  );
};

const LedgerEntry: React.FC<{
  entry: BookEntry;
  expanded: boolean;
  onToggle: () => void;
}> = ({ entry, expanded, onToggle }) => {
  const { theme } = useTheme();
  const events: TimelineItem[] = (entry.audit?.length
    ? entry.audit.map((event) => ({
        key: event.id,
        title: event.action,
        actor: event.actor,
        detail: event.detail,
        time: formatDateTime(event.at),
      }))
    : [
        {
          key: entry.id,
          title: 'Expenditure recorded',
          actor: entry.source === 'tally' ? 'Tally import' : 'Manual entry',
          detail: `${entry.head} · ${formatRupees(entry.amount)} paid to ${entry.payee}`,
          time: formatDate(entry.date),
        },
      ]);

  return (
    <View style={[styles.entryCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.moduleBg }]}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }} style={styles.entryHead}>
        <View style={styles.entryMain}>
          <Text style={[styles.entryPayee, { color: theme.colors.text }]} numberOfLines={1}>{entry.payee}</Text>
          <Text style={[styles.entryMeta, { color: theme.colors.textMuted }]}>
            {entry.date} · {entry.reference} · {entry.head}
          </Text>
        </View>
        <View style={styles.entryRight}>
          <Text style={[styles.entryAmount, { color: theme.colors.text }]}>{formatRupees(entry.amount)}</Text>
          <Text style={[styles.entryCta, { color: theme.colors.financeAccent }]}>Details &amp; audit trail</Text>
        </View>
      </Pressable>
      {expanded ? (
        <View style={[styles.entryBody, { borderTopColor: theme.colors.border }]}>
          <View style={styles.entryFields}>
            {[
              ['Entry ID', entry.id],
              ['Component', entry.head],
              ['Payment date', entry.date],
              ['Voucher / reference', entry.reference],
              ['Source', entry.source === 'tally' ? 'Tally import' : 'Manual entry'],
              ['Accounting treatment', entry.openingIncluded ? 'Included in opening expenditure' : 'Additional expenditure'],
            ].map(([fieldLabel, value]) => (
              <View key={fieldLabel} style={styles.entryField}>
                <Text style={[styles.entryFieldLabel, { color: theme.colors.textMuted }]}>{fieldLabel}</Text>
                <Text style={[styles.entryFieldValue, { color: theme.colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.entryNarration}>
            <Text style={[styles.entryFieldLabel, { color: theme.colors.textMuted }]}>Narration</Text>
            <Text style={[styles.entryNarrationText, { color: theme.colors.text }]}>{entry.narration}</Text>
          </View>
          <Text style={[styles.entryAuditTitle, { color: theme.colors.text }]}>Expenditure audit trail</Text>
          <Timeline accent={theme.colors.financeAccent} items={events} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  monthlySection: { gap: 14 },
  monthlyHeader: { gap: 10 },
  monthlyHeaderText: { gap: 3 },
  monthlySub: { fontSize: 12, lineHeight: 16 },
  chipRow: { gap: 8, paddingVertical: 2 },
  monthChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  monthChipText: { fontSize: 11.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  monthlyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  monthlyCard: { flexGrow: 1, flexBasis: 300, gap: 6 },
  monthlyCardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  monthlyIconTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  monthlyCardHeadText: { flex: 1, minWidth: 0, gap: 2 },
  monthlyCardTitle: { fontSize: 14, fontWeight: '600' },
  monthlyCardSub: { fontSize: 11.5 },
  monthlyValue: { fontSize: 28, fontWeight: '600', letterSpacing: -0.9, fontVariant: ['tabular-nums'] },
  monthlyValueNote: { fontSize: 11.5, marginTop: 2 },
  monthlyStats: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
  },
  monthlyStat: { flex: 1, minWidth: 0, gap: 4 },
  monthlyStatLabel: { fontSize: 11.5 },
  monthlyStatValue: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  monthlyNote: { fontSize: 11.5, lineHeight: 17, marginBottom: 8 },
  sheetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  sheetLinkText: { fontSize: 12.5, fontWeight: '500' },
  ledgerIntro: { fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  ledgerStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ledgerStat: { flexGrow: 1, flexBasis: '30%', minWidth: 140, borderRadius: 12, padding: 13, gap: 4 },
  ledgerStatLabel: { fontSize: 11 },
  ledgerStatValue: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ledgerFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ledgerSearch: { flexGrow: 1, flexBasis: 200 },
  ledgerComponent: { flexGrow: 1, flexBasis: 150 },
  ledgerCountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  ledgerCount: { fontSize: 12.5, flexShrink: 1 },
  ledgerNotice: { fontSize: 12, fontWeight: '500' },
  ledgerList: { gap: 10 },
  ledgerEmpty: { fontSize: 12.5 },
  ledgerFootnote: { fontSize: 11, lineHeight: 15 },
  entryCard: { borderWidth: 1, borderRadius: 14 },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  entryMain: { flex: 1, minWidth: 0, gap: 2 },
  entryPayee: { fontSize: 13, fontWeight: '600' },
  entryMeta: { fontSize: 11 },
  entryRight: { alignItems: 'flex-end', gap: 2 },
  entryAmount: { fontSize: 13.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  entryCta: { fontSize: 10.5, fontWeight: '500' },
  entryBody: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14, gap: 14 },
  entryFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  entryField: { flexGrow: 1, flexBasis: '46%', minWidth: 130, gap: 2 },
  entryFieldLabel: { fontSize: 11 },
  entryFieldValue: { fontSize: 12.5, fontVariant: ['tabular-nums'] },
  entryNarration: { gap: 4 },
  entryNarrationText: { fontSize: 12.5, lineHeight: 18 },
  entryAuditTitle: { fontSize: 13, fontWeight: '600' },
});
