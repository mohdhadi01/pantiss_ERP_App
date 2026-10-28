import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { CentreExpenseCard, ClaimReviewSheet, ClaimMobileCard, CentreExpense, Claim } from './ReimbursementParts';

const CENTRE_EXPENSES: CentreExpense[] = [
  {
    id: 'CTR-2026-301',
    center: 'Keonjhar Center',
    project: 'PMKVY 4.0 Odisha Skills',
    month: 'September 2026',
    type: 'TA/DA',
    amount: 46800,
    submittedBy: 'Subhashree Ray',
    status: 'Ready',
    employees: [
      { name: 'Ranjan Kumar Jena', days: 4, amount: 9600, bills: 3 },
      { name: 'Bikram Nayak', days: 3, amount: 7200, bills: 2 },
      { name: 'Sunil Patnaik', days: 6, amount: 14400, bills: 4 },
      { name: 'Manas Rout', days: 6, amount: 15600, bills: 5 },
    ],
  },
  {
    id: 'CTR-2026-302',
    center: 'Mayurbhanj District',
    project: 'Poshan Community Network',
    month: 'September 2026',
    type: 'TA/DA',
    amount: 32400,
    submittedBy: 'Kavita Soren',
    status: 'Clarification',
    employees: [
      { name: 'Sunita Majhi', days: 5, amount: 11500, bills: 4 },
      { name: 'Bishnu Charan Das', days: 4, amount: 9800, bills: 3 },
      { name: 'Pooja Barik', days: 4, amount: 11100, bills: 3 },
    ],
  },
  {
    id: 'CTR-2026-303',
    center: 'Bhubaneswar HQ',
    project: 'Household Welfare Survey',
    month: 'September 2026',
    type: 'Office Ops',
    amount: 18600,
    submittedBy: 'Kiran Pradhan',
    status: 'Ready',
    employees: [
      { name: 'Kiran Pradhan', days: 0, amount: 9200, bills: 6 },
      { name: 'Debashis Nayak', days: 0, amount: 9400, bills: 5 },
    ],
  },
];

const CENTRE_PROCUREMENT = [
  { id: 'PO-2026-051', center: 'Angul Center', item: 'Lab consumables & safety gear — Q3 restock', vendor: 'Apex Tooling Systems', value: 128000, status: 'Center approval pending' },
  { id: 'PO-2026-049', center: 'Koraput District', item: 'SHG mobilization field kits (40 units)', vendor: 'MTR Logistics', value: 86000, status: 'Approved' },
];

const CENTRE_SALARY = [
  { id: 'CTR-SAL-09-01', center: 'Keonjhar Center', employees: 2, gross: 126180, status: 'Approved' },
  { id: 'CTR-SAL-09-02', center: 'Mayurbhanj District', employees: 1, gross: 41880, status: 'Pending approval' },
];

const SAMPLE_CLAIMS: Claim[] = [
  { id: 'CLM-2026-401', claimant: 'Sunita Majhi', employeeId: 'PAN-EMP-0104', project: 'Samriddhi Livelihoods Programme', center: 'Koraput District', category: 'Travel & TA/DA', purpose: 'Koraput Field Cluster Tribal SHG Mobilization Travel', date: '2026-10-06', amount: 14200, billsCount: 5, status: 'Pending approval' },
  { id: 'CLM-2026-402', claimant: 'Ranjan Kumar Jena', employeeId: 'PAN-EMP-0103', project: 'PMKVY 4.0 Odisha Skills', center: 'Angul Center', category: 'Training & Certification', purpose: 'NSDC Trainer of Trainers Certification Workshop — Cuttack', date: '2026-09-29', amount: 22800, billsCount: 7, status: 'Approved' },
  { id: 'CLM-2026-403', claimant: 'Bishnu Charan Das', employeeId: 'PAN-EMP-0105', project: 'Household Welfare Survey', center: 'Bhubaneswar HQ', category: 'Fuel & Vehicle', purpose: 'District Monitoring Survey Vehicle Fuel & Per Diem', date: '2026-09-22', amount: 18500, billsCount: 4, status: 'Settled', bankRef: 'UTR-20260925-1049' },
];

const STEPS = ['1 · Project', '2 · Center', '3 · Expense review'];
const CENTRE_TABS = ['Center approvals', 'Procurement approvals', 'Salary approvals'];

const CLAIM_COLUMNS: Array<DataColumn<Claim>> = [
  { key: 'id', label: 'Claim ID & Date', flex: 1.4 },
  { key: 'claimant', label: 'Claimant', flex: 1.4 },
  { key: 'project', label: 'Project & Center', flex: 1.8, wideOnly: true },
  { key: 'category', label: 'Category', flex: 1.2, wideOnly: true },
  { key: 'amount', label: 'Claim Amount', flex: 1.1, align: 'right' },
  { key: 'receipts', label: 'Receipts', flex: 0.8, align: 'center', wideOnly: true },
  { key: 'status', label: 'Status', flex: 1.1 },
  { key: 'actions', label: 'Actions', flex: 0.7, align: 'right' },
];

export const ReimbursementView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [topTab, setTopTab] = useState('centre');
  const [centreTab, setCentreTab] = useState(CENTRE_TABS[0]);
  const [monthFilter, setMonthFilter] = useState('September 2026');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reviewExpense, setReviewExpense] = useState<CentreExpense | null>(null);
  const [claims, setClaims] = useState(SAMPLE_CLAIMS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  // Submit claim form
  const [formOpen, setFormOpen] = useState(false);
  const [claimant, setClaimant] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & TA/DA');

  const kpis = useMemo(() => {
    const pending = claims.filter((c) => c.status === 'Pending approval');
    const approved = claims.filter((c) => c.status === 'Approved');
    const settled = claims.filter((c) => c.status === 'Settled');
    return {
      pendingCount: pending.length,
      approvedTotal: approved.reduce((sum, c) => sum + c.amount, 0),
      approvedCount: approved.length,
      settledTotal: settled.reduce((sum, c) => sum + c.amount, 0),
    };
  }, [claims]);

  const filteredExpenses = CENTRE_EXPENSES.filter((e) => {
    const matchesMonth = e.month === monthFilter;
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesMonth && matchesType;
  });

  const filteredClaims = useMemo(
    () =>
      claims.filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = c.claimant.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.purpose.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      }),
    [claims, search, statusFilter, categoryFilter],
  );

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Approved' as const } : c)));
  };

  const handleSettle = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Settled' as const, bankRef: `UTR-${Date.now().toString().slice(-8)}` } : c)));
  };

  const handleSubmitClaim = () => {
    const numAmount = parseFloat(amount);
    if (!claimant.trim() || isNaN(numAmount) || numAmount <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next: Claim = {
      id: `CLM-2026-${404 + claims.length - 3}`,
      claimant: claimant.trim(),
      employeeId: 'PAN-EMP-NEW',
      project: 'PMKVY 4.0 Odisha Skills',
      center: 'Keonjhar Center',
      category,
      purpose: purpose.trim() || 'Field expense claim',
      date: new Date().toISOString().slice(0, 10),
      amount: numAmount,
      billsCount: 0,
      status: 'Pending approval',
    };
    setClaims((prev) => [next, ...prev]);
    setClaimant('');
    setPurpose('');
    setAmount('');
    setFormOpen(false);
  };

  const renderClaimCell = (claim: Claim, col: DataColumn<Claim>) => {
    switch (col.key) {
      case 'id':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.brandPrimary }]}>{claim.id}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{new Date(claim.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          </View>
        );
      case 'claimant':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.claimant}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{claim.employeeId}</Text>
          </View>
        );
      case 'project':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.project}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{claim.center}</Text>
          </View>
        );
      case 'category':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{claim.category}</Text>;
      case 'amount':
        return <Text style={[styles.amountText, { color: theme.colors.financeAccent }]}>{formatRupees(claim.amount)}</Text>;
      case 'receipts':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.billsCount}</Text>;
      case 'status':
        return <StatusChip status={claim.status} />;
      case 'actions':
        return (
          <Pressable
            onPress={() => {
              setReviewClaim(claim);
              setClaimOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`View claim ${claim.id}`}
            style={styles.viewBtn}
          >
            <Icon name="Eye" size={15} color={theme.colors.financeAccent} />
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Tabs
        items={[
          { key: 'centre', label: 'Centre Reimbursement', icon: 'Building2' },
          { key: 'staff', label: 'Staff Reimbursement', icon: 'Receipt' },
        ]}
        activeKey={topTab}
        onChange={setTopTab}
        accent={theme.colors.financeAccent}
      />

      {topTab === 'centre' ? (
        <View style={styles.section}>
          <View style={styles.bigPillRow}>
            {CENTRE_TABS.map((label) => {
              const active = label === centreTab;
              return (
                <Pressable
                  key={label}
                  onPress={() => setCentreTab(label)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.bigPill,
                    { backgroundColor: active ? theme.colors.financeAccent : theme.colors.moduleBg, borderColor: active ? theme.colors.financeAccent : theme.colors.border, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={[styles.bigPillText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.stepRow}>
            {STEPS.map((label, index) => {
              const active = index === 2;
              return (
                <View key={label} style={[styles.stepPill, { backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surfaceMuted, borderColor: active ? theme.colors.brandPrimary : theme.colors.border }]}>
                  <Text style={[styles.stepText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{label}</Text>
                </View>
              );
            })}
          </View>

          {centreTab === CENTRE_TABS[0] ? (
            <>
              <View style={styles.filterRow}>
                <SelectField value={monthFilter} onChange={setMonthFilter} options={[{ value: 'September 2026', label: 'September 2026' }, { value: 'August 2026', label: 'August 2026' }]} containerStyle={styles.filterSelect} />
                <SelectField value={typeFilter} onChange={setTypeFilter} options={[{ value: 'all', label: 'All types' }, { value: 'TA/DA', label: 'TA/DA' }, { value: 'Office Ops', label: 'Office Ops' }, { value: 'Utilities', label: 'Utilities' }]} containerStyle={styles.filterSelect} />
              </View>
              {filteredExpenses.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No center expense batches for this month.</Text>
              ) : (
                <View style={styles.list}>
                  {filteredExpenses.map((expense) => (
                    <CentreExpenseCard key={expense.id} expense={expense} onReview={() => setReviewExpense(expense)} />
                  ))}
                </View>
              )}
            </>
          ) : null}

          {centreTab === CENTRE_TABS[1] ? (
            <View style={styles.list}>
              {CENTRE_PROCUREMENT.map((po) => (
                <Card key={po.id} padding={16} style={styles.centreCard}>
                  <View style={styles.centreTop}>
                    <View style={styles.centreTitleCol}>
                      <Text style={[styles.centreName, { color: theme.colors.text }]}>{po.item}</Text>
                      <Text style={[styles.centreSub, { color: theme.colors.brandPrimary }]}>{po.id} · {po.center}</Text>
                      <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>Supplier {po.vendor}</Text>
                    </View>
                    <View style={styles.centreRight}>
                      <StatusChip status={po.status} tone={po.status === 'Approved' ? 'success' : 'warning'} />
                      <Text style={[styles.centreAmount, { color: theme.colors.financeAccent }]}>{formatRupees(po.value)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          {centreTab === CENTRE_TABS[2] ? (
            <View style={styles.list}>
              {CENTRE_SALARY.map((batch) => (
                <Card key={batch.id} padding={16} style={styles.centreCard}>
                  <View style={styles.centreTop}>
                    <View style={styles.centreTitleCol}>
                      <Text style={[styles.centreName, { color: theme.colors.text }]}>{batch.center}</Text>
                      <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>{batch.id} · {batch.employees} employees</Text>
                    </View>
                    <View style={styles.centreRight}>
                      <StatusChip status={batch.status} tone={batch.status === 'Approved' ? 'success' : 'warning'} />
                      <Text style={[styles.centreAmount, { color: theme.colors.financeAccent }]}>{formatRupees(batch.gross)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <HeroBanner
            gradient={heroGradients.vendor}
            badge={{ icon: 'Receipt', label: 'Staff Expense Reimbursement & Travel Advance' }}
            title="Staff Expense Claims"
            description="Verify bills, approve payouts and settle travel advances against projects."
            actions={[{ label: 'Submit Expense Claim', icon: 'Plus', variant: 'white', onPress: () => setFormOpen(true) }]}
          />

          <View style={styles.metricsGrid}>
            <MetricCard style={styles.metricCard} label="Pending Finance Verification" value={String(kpis.pendingCount)} subtitle="In Review" icon="Clock" accentColor={theme.colors.warning} arrow />
            <MetricCard style={styles.metricCard} label={`Approved for Payout (${kpis.approvedCount})`} value={formatRupees(kpis.approvedTotal)} subtitle="Approved" icon="CheckCircle2" accentColor={theme.colors.info} arrow />
            <MetricCard style={styles.metricCard} label="Disbursed This Month" value={formatRupees(kpis.settledTotal)} subtitle="Settled" icon="CreditCard" accentColor={theme.colors.emerald} arrow />
            <MetricCard style={styles.metricCard} label="Avg Settlement Turnaround" value="2.8 Days" subtitle="SLA Met" icon="ShieldCheck" accentColor={theme.colors.violet} arrow />
          </View>

          <SectionCard title="Claims queue" description="Every staff claim with receipts, verification status and settlement trail.">
            <View style={styles.filterRow}>
              <TextField value={search} onChangeText={setSearch} placeholder="Search claims…" containerStyle={styles.searchGrow} />
              <SelectField value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All statuses' }, { value: 'Pending approval', label: 'Pending approval' }, { value: 'Approved', label: 'Approved' }, { value: 'Settled', label: 'Settled' }]} containerStyle={styles.filterSelect} />
              <SelectField value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All categories' }, { value: 'Travel & TA/DA', label: 'Travel & TA/DA' }, { value: 'Training & Certification', label: 'Training & Certification' }, { value: 'Fuel & Vehicle', label: 'Fuel & Vehicle' }]} containerStyle={styles.filterSelect} />
            </View>
            <DataTable
              columns={CLAIM_COLUMNS}
              rows={filteredClaims}
              keyExtractor={(claim) => claim.id}
              renderCell={renderClaimCell}
              renderMobileCard={(claim) => (
                <ClaimMobileCard
                  claim={claim}
                  onView={() => {
                    setReviewClaim(claim);
                    setClaimOpen(true);
                  }}
                />
              )}
              emptyIcon="Receipt"
              emptyTitle="No claims match"
              emptyDescription="Adjust the search or filters to see staff reimbursement claims."
            />
          </SectionCard>
        </View>
      )}

      <ModalSheet
        visible={Boolean(reviewExpense)}
        onClose={() => setReviewExpense(null)}
        label="Center approvals"
        title={reviewExpense ? `${reviewExpense.type} review · ${reviewExpense.center}` : ''}
        description={reviewExpense ? `${reviewExpense.project} · ${reviewExpense.month} · ${formatRupees(reviewExpense.amount)}` : undefined}
        size="md"
        footer={
          <>
            <Button label="Return for clarification" variant="outline" onPress={() => setReviewExpense(null)} />
            <Button label="Approve batch" variant="emerald" onPress={() => setReviewExpense(null)} />
          </>
        }
      >
        {reviewExpense ? (
          <View style={styles.billList}>
            {reviewExpense.employees.map((employee) => (
              <View key={employee.name} style={[styles.billRow, { borderColor: theme.colors.border }]}>
                <View style={styles.billBody}>
                  <Text style={[styles.cellMain, { color: theme.colors.text }]}>{employee.name}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                    {employee.days ? `${employee.days} days on duty · ` : ''}{employee.bills} bills attached
                  </Text>
                </View>
                <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(employee.amount)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ModalSheet>

      <ClaimReviewSheet
        claim={reviewClaim}
        visible={claimOpen}
        onClose={() => setClaimOpen(false)}
        onApprove={(id) => {
          handleApprove(id);
          setClaimOpen(false);
        }}
        onSettle={(id) => {
          handleSettle(id);
          setClaimOpen(false);
        }}
      />

      <ModalSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        label="Staff reimbursement"
        title="Submit Expense Claim"
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setFormOpen(false)} />
            <Button label="Submit claim" variant="emerald" onPress={handleSubmitClaim} />
          </>
        }
      >
        <TextField label="Claimant" value={claimant} onChangeText={setClaimant} placeholder="Employee name" />
        <TextField label="Expense purpose" value={purpose} onChangeText={setPurpose} multiline placeholder="Describe the travel or expense…" />
        <TextField label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 14200" />
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'Travel & TA/DA', label: 'Travel & TA/DA' },
            { value: 'Training & Certification', label: 'Training & Certification' },
            { value: 'Fuel & Vehicle', label: 'Fuel & Vehicle' },
          ]}
        />
      </ModalSheet>
    </View>
  );
};

import { Icon as Icon2 } from '../../../components/ui/Icon';

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 14 },
  bigPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bigPill: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  bigPillText: { fontSize: 13, fontWeight: '700' },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  stepText: { fontSize: 11, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  searchGrow: { flexGrow: 2, flexBasis: 220 },
  list: { gap: 12 },
  centreCard: { gap: 12 },
  centreTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  centreTitleCol: { flex: 1, minWidth: 0 },
  centreName: { fontSize: 14.5, fontWeight: '700' },
  centreSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  centreMeta: { fontSize: 11, marginTop: 2 },
  centreRight: { alignItems: 'flex-end', gap: 6 },
  centreAmount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  amountText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  viewBtn: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined },
  billList: { gap: 10 },
  billRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  billBody: { flex: 1, minWidth: 0 },
});
