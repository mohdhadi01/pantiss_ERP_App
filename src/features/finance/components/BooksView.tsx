import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useBooksStore } from '../booksStore';
import { booksProjects, BookEntry } from '../booksData';
import { budgetCategories, allocationShares, BudgetCategory } from '../budgetCategories';
import { portfolioTotals, financeAreas, formatCurrency } from '../data';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

const OPENING_EXPENDITURE = 4250000; // brought forward from FY 2025–26

type SourceFilter = 'all' | 'tally' | 'manual' | 'not-exported' | 'exported';

const tallyPill = (entry: BookEntry): { status: string; tone: 'info' | 'success' | 'neutral' } =>
  entry.source === 'tally'
    ? { status: 'Tally import', tone: 'info' }
    : entry.exportedAt
      ? { status: 'Exported', tone: 'success' }
      : { status: 'Manual', tone: 'neutral' };

const REGISTER_COLUMNS: Array<DataColumn<BookEntry>> = [
  { key: 'date', label: 'Date / reference', flex: 1.2 },
  { key: 'payee', label: 'Payee / narration', flex: 2.2 },
  { key: 'head', label: 'Budget head', flex: 1.4, wideOnly: true },
  { key: 'amount', label: 'Amount', flex: 1.2, align: 'right' },
  { key: 'tally', label: 'Tally', flex: 1 },
];

export const BooksView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { entries, addEntry } = useBooksStore();
  const [areaId, setAreaId] = useState('all');
  const [projectId, setProjectId] = useState('all');
  const [search, setSearch] = useState('');
  const [headFilter, setHeadFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  // New voucher form
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [head, setHead] = useState<BudgetCategory>(budgetCategories[0]);
  const [voucherProject, setVoucherProject] = useState(booksProjects[0].id);

  const totalSpent = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries]);

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const project = booksProjects.find((p) => p.id === e.projectId);
        const q = search.toLowerCase();
        const matchesSearch =
          e.payee.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.narration.toLowerCase().includes(q) ||
          e.reference.toLowerCase().includes(q);
        const matchesHead = headFilter === 'all' || e.head === headFilter;
        const matchesArea = areaId === 'all' || project?.areaId === areaId;
        const matchesProject = projectId === 'all' || e.projectId === projectId;
        const matchesFrom = !fromDate || e.date >= fromDate;
        const matchesTo = !toDate || e.date <= toDate;
        const matchesSource =
          sourceFilter === 'all' ||
          (sourceFilter === 'tally' && e.source === 'tally') ||
          (sourceFilter === 'manual' && e.source === 'manual') ||
          (sourceFilter === 'not-exported' && e.source === 'manual' && !e.exportedAt) ||
          (sourceFilter === 'exported' && Boolean(e.exportedAt));
        return matchesSearch && matchesHead && matchesArea && matchesProject && matchesFrom && matchesTo && matchesSource;
      }),
    [entries, search, headFilter, areaId, projectId, fromDate, toDate, sourceFilter],
  );

  const areaOptions = [
    { value: 'all', label: 'All thematic areas' },
    ...financeAreas.map((a) => ({ value: a.id, label: a.name })),
  ];
  const projectOptions = [
    { value: 'all', label: 'All projects' },
    ...booksProjects.filter((p) => areaId === 'all' || p.areaId === areaId).map((p) => ({ value: p.id, label: p.name })),
  ];

  const handleAddVoucher = async () => {
    const numAmount = parseFloat(amount);
    if (!payee.trim() || isNaN(numAmount) || numAmount <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await addEntry({
      projectId: voucherProject,
      head,
      date: new Date().toISOString().slice(0, 10),
      payee: payee.trim(),
      reference: `REF-${Date.now().toString(36).toUpperCase()}`,
      narration: narration.trim() || 'Project expenditure voucher',
      amount: numAmount,
      source: 'manual',
    });
    setPayee('');
    setAmount('');
    setNarration('');
    setModalOpen(false);
  };

  const renderRegisterCell = (entry: BookEntry, col: DataColumn<BookEntry>) => {
    const project = booksProjects.find((p) => p.id === entry.projectId);
    const pill = tallyPill(entry);
    switch (col.key) {
      case 'date':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(entry.date)}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.brandPrimary }]}>{entry.id} · {entry.reference}</Text>
          </View>
        );
      case 'payee':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{entry.payee}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]} numberOfLines={1}>{entry.narration}</Text>
          </View>
        );
      case 'head':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{entry.head}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{project?.name ?? entry.projectId}</Text>
          </View>
        );
      case 'amount':
        return <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(entry.amount)}</Text>;
      case 'tally':
        return <StatusChip status={pill.status} tone={pill.tone} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Card padding={20}>
        <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>Project accounting</Text>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Books</Text>
        <Text style={[styles.pageDesc, { color: theme.colors.textMuted }]}>
          Every expenditure, against the right project and budget.
        </Text>
        <View style={styles.headingButtons}>
          <Button label="Tally setup" icon="Settings2" variant="outline" size="sm" />
          <Button label="Record expenditure" icon="Plus" variant="outline" size="sm" onPress={() => setModalOpen(true)} />
          <Pressable style={({ pressed }) => [styles.invertedBtn, { backgroundColor: theme.colors.text, opacity: pressed ? 0.85 : 1 }]}>
            <Icon name="Upload" size={14} color={theme.colors.background} />
            <Text style={[styles.invertedText, { color: theme.colors.background }]}>Import from Tally</Text>
          </Pressable>
        </View>
      </Card>

      <View style={styles.scopeBar}>
        <SelectField value={areaId} onChange={(v) => { setAreaId(v); setProjectId('all'); }} options={areaOptions} placeholder="Thematic area" containerStyle={styles.scopeSelect} />
        <SelectField value={projectId} onChange={setProjectId} options={projectOptions} placeholder="Project" containerStyle={styles.scopeSelect} />
        <View style={[styles.fyPill, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Text style={[styles.fyPillText, { color: theme.colors.textMuted }]}>FY 2026–27 · INR</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Approved budget" value={formatCurrency(portfolioTotals.approved)} subtitle={`${portfolioTotals.projects} projects`} icon="WalletCards" accentColor={theme.colors.financeAccent} />
        <MetricCard style={styles.metricCard} label="Opening expenditure" value={formatRupees(OPENING_EXPENDITURE)} subtitle="Brought forward · FY 2025–26" icon="BookOpen" accentColor={theme.colors.info} />
        <MetricCard style={styles.metricCard} label="Books detail (incl. imports)" value={formatRupees(totalSpent)} subtitle={`${entries.length} vouchers recorded`} icon="FileText" accentColor={theme.colors.teal} />
        <MetricCard style={styles.metricCard} label="Available after commitments" value={formatRupees(Math.round(portfolioTotals.available * 100000))} subtitle="Net of committed POs" icon="CircleDollarSign" accentColor={theme.colors.violet} />
      </View>

      <View style={[styles.twoCol, isMd && styles.twoColWide]}>
        <SectionCard title="Budget allocation" description="Recorded spend against each approved cost head." style={isMd ? styles.colHalf : undefined}>
          <View style={styles.headsList}>
            {budgetCategories.map((cat) => {
              const allocation = portfolioTotals.approved * allocationShares[cat];
              const spent = allocation * (portfolioTotals.spent / portfolioTotals.approved);
              return (
                <View key={cat} style={styles.headItem}>
                  <Text style={[styles.headName, { color: theme.colors.text }]}>{cat}</Text>
                  <View style={styles.headAmtRow}>
                    <Text style={[styles.headAmtStrong, { color: theme.colors.financeAccent }]}>
                      {formatCurrency(spent)} recorded
                    </Text>
                    <Text style={[styles.headAmt, { color: theme.colors.textSubtle }]}>
                      / {formatCurrency(allocation)} allocated
                    </Text>
                  </View>
                  <ProgressBar value={(spent / allocation) * 100} height={6} color={theme.colors.financeAccent} style={styles.headBar} />
                </View>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard
          title="Bring your Tally books here"
          description="Exchange vouchers with Tally without breaking your existing accounting workflow."
          style={isMd ? styles.colHalf : undefined}
          action={<StatusChip status="XML exchange" tone="brand" dot={false} />}
        >
          <View style={styles.tallyRows}>
            <TallyRow label="Company" value="Pantiss Foundation HQ" />
            <TallyRow label="Connection" value="Manual import · no live sync" />
            <TallyRow label="Imported lines" value={`${entries.filter((e) => e.source === 'tally').length} voucher lines`} />
            <TallyRow label="Last import" value="12 Aug 2026" />
          </View>
          <View style={styles.tallyButtons}>
            <Button label="Import from Tally" icon="Upload" variant="outline" size="sm" />
            <Button label={`Export ${entries.filter((e) => e.source === 'manual' && !e.exportedAt).length} new manual entries to Tally`} icon="Download" variant="emerald" size="sm" />
            <Button label="Manage ledger mappings" icon="Settings2" variant="ghost" size="sm" />
          </View>
        </SectionCard>
      </View>

      <SectionCard
        title="Expenditure register"
        description="Search, filter and audit every voucher in the books."
        action={<Button label="Export CSV" icon="Download" variant="outline" size="sm" />}
      >
        <View style={styles.filterWrap}>
          <TextField value={search} onChangeText={setSearch} placeholder="Payee or reference…" containerStyle={styles.filterSearch} />
          <SelectField
            value={headFilter}
            onChange={setHeadFilter}
            options={[{ value: 'all', label: 'All budget heads' }, ...budgetCategories.map((c) => ({ value: c, label: c }))]}
            placeholder="Budget head"
            containerStyle={styles.filterSelect}
          />
          <TextField value={fromDate} onChangeText={setFromDate} placeholder="From (YYYY-MM-DD)" containerStyle={styles.filterSelect} />
          <TextField value={toDate} onChangeText={setToDate} placeholder="To (YYYY-MM-DD)" containerStyle={styles.filterSelect} />
          <SelectField
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as SourceFilter)}
            options={[
              { value: 'all', label: 'All entries' },
              { value: 'tally', label: 'Imported from Tally' },
              { value: 'manual', label: 'Manual entries' },
              { value: 'not-exported', label: 'Not exported' },
              { value: 'exported', label: 'Exported' },
            ]}
            placeholder="Source"
            containerStyle={styles.filterSelect}
          />
        </View>

        <DataTable
          columns={REGISTER_COLUMNS}
          rows={filtered}
          keyExtractor={(entry) => entry.id}
          renderCell={renderRegisterCell}
          renderMobileCard={(entry) => (
            <View style={[styles.mobileVoucher, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
              <View style={styles.mobileVoucherTop}>
                <View style={styles.mobileVoucherBody}>
                  <Text style={[styles.cellMain, { color: theme.colors.text }]}>{entry.payee}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.brandPrimary }]}>{entry.id} · {formatDate(entry.date)}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]} numberOfLines={2}>{entry.narration}</Text>
                </View>
                <Text style={[styles.amountText, { color: theme.colors.emerald }]}>{formatRupees(entry.amount)}</Text>
              </View>
              <View style={styles.mobileVoucherFooter}>
                <StatusChip status={tallyPill(entry).status} tone={tallyPill(entry).tone} />
                <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{entry.head}</Text>
              </View>
            </View>
          )}
          emptyIcon="BookOpen"
          emptyTitle="No vouchers match"
          emptyDescription="Adjust the filters to find expenditure entries in the books."
        />
      </SectionCard>

      <ModalSheet
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        label="Project accounting"
        title="Record Expenditure Voucher"
        description="Post a manual voucher into the books for the selected project."
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setModalOpen(false)} />
            <Button label="Save Voucher to Ledger" variant="emerald" onPress={handleAddVoucher} />
          </>
        }
      >
        <SelectField
          label="Project"
          value={voucherProject}
          onChange={setVoucherProject}
          options={booksProjects.map((p) => ({ value: p.id, label: p.name }))}
        />
        <SelectField
          label="Budget cost head"
          value={head}
          onChange={(v) => setHead(v as BudgetCategory)}
          options={budgetCategories.map((c) => ({ value: c, label: c }))}
        />
        <TextField label="Payee / vendor name" value={payee} onChangeText={setPayee} placeholder="e.g. Apex Tooling Systems" />
        <TextField label="Amount (INR ₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 148500" />
        <TextField label="Narration & detail" value={narration} onChangeText={setNarration} multiline placeholder="Reason for expenditure…" />
      </ModalSheet>
    </View>
  );
};

const TallyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.tallyRow}>
      <Text style={[styles.tallyRowLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.tallyRowValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  pageTitle: { fontSize: 32, fontWeight: '600', letterSpacing: -1.3, marginTop: 4 },
  pageDesc: { fontSize: 12.5, marginTop: 4 },
  headingButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  invertedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 13, borderRadius: 9 },
  invertedText: { fontSize: 12, fontWeight: '600' },
  scopeBar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  scopeSelect: { flexGrow: 1, flexBasis: 200 },
  fyPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  fyPillText: { fontSize: 11.5, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: '46%' },
  twoCol: { gap: 12 },
  twoColWide: { flexDirection: 'row', alignItems: 'flex-start' },
  colHalf: { flex: 1 },
  headsList: { gap: 12 },
  headItem: {
    gap: 7,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 144, 168, 0.12)',
  },
  headAmtRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
  },
  headAmtStrong: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  headBar: { marginTop: 2 },
  headName: { fontSize: 12.5, fontWeight: '600' },
  headAmt: { fontSize: 11, fontVariant: ['tabular-nums'] },
  tallyRows: { gap: 0 },
  tallyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128, 144, 168, 0.16)' },
  tallyRowLabel: { fontSize: 11.5 },
  tallyRowValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  tallyButtons: { gap: 8, marginTop: 12 },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  filterSearch: { flexGrow: 1, flexBasis: 220 },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  amountText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  mobileVoucher: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  mobileVoucherTop: { flexDirection: 'row', gap: 10 },
  mobileVoucherBody: { flex: 1, minWidth: 0, gap: 2 },
  mobileVoucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
