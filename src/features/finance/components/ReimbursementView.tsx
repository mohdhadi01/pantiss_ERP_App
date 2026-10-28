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
import {
  CentreExpenseCard,
  ClaimReviewSheet,
  ClaimMobileCard,
  SheetStat,
  CentreExpense,
  Claim,
  ExpenseType,
  EXPENSE_TYPES,
  billsForCenterMonth,
} from './ReimbursementParts';
import { TaDaReviewSheet, ExpenseBillReviewSheet } from './ReimbursementSheets';

const CENTRE_EXPENSES: CentreExpense[] = [
  { id: 'CTR-RENT-0182', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 142000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-FOOD-0181', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Food', amount: 96000, submitted: '02 Aug 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-ELEC-0178', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Electricity', amount: 28000, submitted: '01 Aug 2026', documents: 2, status: 'Clarification' },
  { id: 'CTR-TADA-0175', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'TA/DA', amount: 64000, submitted: '31 Jul 2026', documents: 6, status: 'Ready' },
  { id: 'CTR-RENT-0191', center: 'Bhubaneswar Technical Center', centerId: 'CEN-BBS-02', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 162000, submitted: '03 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0186', center: 'Bhubaneswar Technical Center', centerId: 'CEN-BBS-02', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'TA/DA', amount: 78000, submitted: '02 Aug 2026', documents: 8, status: 'Ready' },
  { id: 'CTR-RENT-0174', center: 'Keonjhar Skills Center', centerId: 'CEN-KEO-01', project: 'Project Udaan', month: 'August 2026', type: 'Rental', amount: 118000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0167', center: 'Keonjhar Skills Center', centerId: 'CEN-KEO-01', project: 'Project Udaan', month: 'July 2026', type: 'TA/DA', amount: 48000, submitted: '30 Jul 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-RENT-0168', center: 'Dibrugarh Health Training Unit', centerId: 'CEN-DIB-01', project: 'Swasthya Mobile Clinics', month: 'August 2026', type: 'Rental', amount: 136000, submitted: '30 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0158', center: 'Dibrugarh Health Training Unit', centerId: 'CEN-DIB-01', project: 'Swasthya Mobile Clinics', month: 'July 2026', type: 'TA/DA', amount: 88000, submitted: '28 Jul 2026', documents: 7, status: 'Clarification' },
  { id: 'CTR-RENT-0159', center: 'Ranchi Enterprise Hub', centerId: 'CEN-RAN-01', project: 'Saksham Women Enterprise', month: 'August 2026', type: 'Rental', amount: 124000, submitted: '29 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0151', center: 'Ranchi Enterprise Hub', centerId: 'CEN-RAN-01', project: 'Saksham Women Enterprise', month: 'July 2026', type: 'TA/DA', amount: 56000, submitted: '27 Jul 2026', documents: 5, status: 'Ready' },
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
  { id: 'CLM-2026-401', claimant: 'Sunita Majhi', employeeId: 'PAN-EMP-0104', project: 'Samriddhi Livelihoods Programme', center: 'Koraput District', category: 'Inter-District Travel', purpose: 'Koraput Field Cluster Tribal SHG Mobilization Travel', date: '2026-10-06', amount: 14200, billsCount: 5, status: 'Pending Verification' },
  { id: 'CLM-2026-402', claimant: 'Ranjan Kumar Jena', employeeId: 'PAN-EMP-0103', project: 'PMKVY 4.0 Odisha Skills', center: 'Angul Center', category: 'Field Mobilization', purpose: 'NSDC Trainer of Trainers Certification Workshop — Cuttack', date: '2026-09-29', amount: 22800, billsCount: 7, status: 'Finance Approved' },
  { id: 'CLM-2026-403', claimant: 'Bishnu Charan Das', employeeId: 'PAN-EMP-0105', project: 'Household Welfare Survey', center: 'Bhubaneswar HQ', category: 'Accommodation & Food', purpose: 'District Monitoring Survey Accommodation & Per Diem', date: '2026-09-22', amount: 18500, billsCount: 4, status: 'Disbursed', bankUtr: 'HDFCR5104925', payoutDate: '25 Sep 2026' },
];

const STEPS = ['1 · Project', '2 · Center', '3 · Expense review'];
const CENTRE_TABS = ['Center approvals', 'Procurement approvals', 'Salary approvals'];
const CLAIM_CATEGORIES = ['Inter-District Travel', 'Field Mobilization', 'Accommodation & Food', 'Printing & Supplies', 'Emergency Float'];
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
  const [monthFilter, setMonthFilter] = useState('All months');
  const [typeFilter, setTypeFilter] = useState<'All' | ExpenseType>('All');
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
  const [empId, setEmpId] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Inter-District Travel');
  const [billsAttached, setBillsAttached] = useState(false);

  const kpis = useMemo(() => {
    const pending = claims.filter((c) => c.status === 'Pending Verification');
    const approved = claims.filter((c) => c.status === 'Finance Approved');
    const disbursed = claims.filter((c) => c.status === 'Disbursed');
    return {
      pendingCount: pending.length,
      approvedTotal: approved.reduce((sum, c) => sum + c.amount, 0),
      approvedCount: approved.length,
      disbursedTotal: disbursed.reduce((sum, c) => sum + c.amount, 0),
    };
  }, [claims]);

  const centreStats = useMemo(() => {
    const projects = new Set(CENTRE_EXPENSES.map((e) => e.project)).size;
    const centers = new Set(CENTRE_EXPENSES.map((e) => e.centerId)).size;
    const value = CENTRE_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
    const tadaBills = CENTRE_EXPENSES.reduce((sum, e) => (e.type === 'TA/DA' ? sum + billsForCenterMonth(e.centerId, e.month).length : sum), 0);
    return { projects, centers, value, tadaBills };
  }, []);

  const filteredExpenses = CENTRE_EXPENSES.filter((e) => {
    const matchesMonth = monthFilter === 'All months' || e.month === monthFilter;
    const matchesType = typeFilter === 'All' || e.type === typeFilter;
    return matchesMonth && matchesType;
  });
  const months = useMemo(() => ['All months', ...Array.from(new Set(CENTRE_EXPENSES.map((e) => e.month)))], []);

  const filteredClaims = useMemo(
    () =>
      claims.filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = c.claimant.toLowerCase().includes(q) || c.employeeId.toLowerCase().includes(q) || c.project.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      }),
    [claims, search, statusFilter, categoryFilter],
  );

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Finance Approved' as const } : c)));
  };

  const handleDisburse = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'Disbursed' as const, bankUtr: `HDFCR5${Date.now().toString().slice(-8)}`, payoutDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
          : c,
      ),
    );
  };

  const handleSubmitClaim = () => {
    const numAmount = parseFloat(amount);
    if (!claimant.trim() || isNaN(numAmount) || numAmount <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next: Claim = {
      id: `CLM-2026-${404 + claims.length - 3}`,
      claimant: claimant.trim(),
      employeeId: empId.trim() || 'PAN-EMP-TEMP',
      project: 'PMKVY 4.0 Odisha Skills',
      center: costCenter.trim() || 'Keonjhar Center',
      category,
      purpose: purpose.trim() || 'Out-of-pocket field operational expenses',
      date: new Date().toISOString().slice(0, 10),
      amount: numAmount,
      billsCount: billsAttached ? 2 : 0,
      status: 'Pending Verification',
    };
    setClaims((prev) => [next, ...prev]);
    setClaimant('');
    setEmpId('');
    setCostCenter('');
    setPurpose('');
    setAmount('');
    setBillsAttached(false);
    setFormOpen(false);
  };

  const claimTone = (status: Claim['status']) => (status === 'Disbursed' ? 'success' : status === 'Finance Approved' ? 'info' : 'warning');

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
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.billsCount} files</Text>;
      case 'status':
        return <StatusChip status={claim.status} tone={claimTone(claim.status)} />;
      case 'actions':
        return (
          <Pressable
            onPress={() => {
              setReviewClaim(claim);
              setClaimOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Review claim ${claim.id}`}
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

          {centreTab === CENTRE_TABS[0] ? (
            <>
              <View style={styles.statGrid}>
                <SheetStat label="Projects with requests" value={String(centreStats.projects)} />
                <SheetStat label="Operating centers" value={String(centreStats.centers)} />
                <SheetStat label="Value awaiting review" value={formatRupees(centreStats.value)} />
                <SheetStat label="Employee TA/DA bills" value={String(centreStats.tadaBills)} />
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
              <View style={styles.filterRow}>
                <SelectField value={monthFilter} onChange={setMonthFilter} options={months.map((m) => ({ value: m, label: m }))} containerStyle={styles.filterSelect} />
                <View style={styles.typeChips}>
                  {(['All', ...EXPENSE_TYPES] as const).map((type) => {
                    const active = typeFilter === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setTypeFilter(type)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={[styles.typeChip, { backgroundColor: active ? theme.colors.financeAccent : theme.colors.surfaceSoft, borderColor: active ? theme.colors.financeAccent : theme.colors.border }]}
                      >
                        <Text style={[styles.typeChipText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{type}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              {filteredExpenses.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No expense requests found. Change the month or expense filter.</Text>
              ) : (
                <View style={[styles.list, isMd && styles.listWide]}>
                  {filteredExpenses.map((expense) => (
                    <CentreExpenseCard
                      key={expense.id}
                      expense={expense}
                      employeeCount={billsForCenterMonth(expense.centerId, expense.month).length}
                      onReview={() => setReviewExpense(expense)}
                    />
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
            description="Audited employee claims reimbursement pipeline with receipt verification, reporting manager pre-clearance, and automated bank disbursement."
            actions={[{ label: 'Submit Expense Claim', icon: 'Plus', variant: 'white', onPress: () => setFormOpen(true) }]}
          />

          <View style={styles.metricsGrid}>
            <MetricCard style={styles.metricCard} label="Pending Finance Verification" value={`${kpis.pendingCount} Claims`} subtitle="Manager-approved; awaiting voucher audit" icon="Clock" accentColor={theme.colors.warning} arrow />
            <MetricCard style={styles.metricCard} label={`Approved for Payout (${kpis.approvedCount})`} value={formatRupees(kpis.approvedTotal)} subtitle="Scheduled for weekly Thursday batch NEFT" icon="CheckCircle2" accentColor={theme.colors.info} arrow />
            <MetricCard style={styles.metricCard} label="Disbursed This Month" value={formatRupees(kpis.disbursedTotal)} subtitle="100% reconciled against bank vouchers" icon="CreditCard" accentColor={theme.colors.emerald} arrow />
            <MetricCard style={styles.metricCard} label="Avg Settlement Turnaround" value="2.8 Days" subtitle="From receipt submission to bank credit" icon="ShieldCheck" accentColor={theme.colors.violet} arrow />
          </View>

          <SectionCard
            title="Staff Reimbursement Claims Queue"
            description={`Showing ${filteredClaims.length} of ${claims.length} claims`}
          >
            <View style={styles.filterRow}>
              <TextField value={search} onChangeText={setSearch} placeholder="Search staff, ID, project..." containerStyle={styles.searchGrow} />
              <SelectField value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All Status' }, { value: 'Pending Verification', label: 'Pending Verification' }, { value: 'Finance Approved', label: 'Finance Approved' }, { value: 'Disbursed', label: 'Disbursed' }]} containerStyle={styles.filterSelect} />
              <SelectField value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All Expense Categories' }, ...CLAIM_CATEGORIES.map((c) => ({ value: c, label: c }))]} containerStyle={styles.filterSelect} />
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
              emptyTitle="No claims match your filters"
              emptyDescription="Try another search or clear your filters."
            />
          </SectionCard>
        </View>
      )}

      {reviewExpense && reviewExpense.type === 'TA/DA' ? (
        <TaDaReviewSheet
          key={reviewExpense.id}
          expense={reviewExpense}
          visible={Boolean(reviewExpense)}
          onClose={() => setReviewExpense(null)}
        />
      ) : (
        <ExpenseBillReviewSheet
          key={reviewExpense?.id ?? 'none'}
          expense={reviewExpense}
          visible={Boolean(reviewExpense)}
          onClose={() => setReviewExpense(null)}
        />
      )}

      <ClaimReviewSheet
        claim={reviewClaim}
        visible={claimOpen}
        onClose={() => setClaimOpen(false)}
        onApprove={(id) => {
          handleApprove(id);
          setClaimOpen(false);
        }}
        onDisburse={(id) => {
          handleDisburse(id);
          setClaimOpen(false);
        }}
      />

      <ModalSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        label="Expense Claim"
        title="Submit Staff Expense Reimbursement"
        description="Submit out-of-pocket expenses incurred during field operations with verified bills."
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setFormOpen(false)} />
            <Button label="Submit for Approval" variant="emerald" onPress={handleSubmitClaim} />
          </>
        }
      >
        <TextField label="Employee Name *" value={claimant} onChangeText={setClaimant} placeholder="e.g. Sunita Majhi" />
        <TextField label="Employee ID" value={empId} onChangeText={setEmpId} placeholder="e.g. PAN-EMP-0104" />
        <TextField label="Cost Center" value={costCenter} onChangeText={setCostCenter} placeholder="e.g. Koraput Regional Office" />
        <TextField label="Purpose & Expense Details" value={purpose} onChangeText={setPurpose} multiline placeholder="Describe trip details, dates, attendees or materials purchased..." />
        <TextField label="Claim Amount (₹) *" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 8450" />
        <SelectField
          label="Expense Category"
          value={category}
          onChange={setCategory}
          options={CLAIM_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Text style={[styles.attachLabel, { color: theme.colors.textMuted }]}>Attach Bills / Receipts (PDF or Images)</Text>
        <Pressable
          onPress={() => setBillsAttached((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ selected: billsAttached }}
          style={[styles.dropzone, { borderColor: theme.colors.emerald, backgroundColor: theme.colors.emeraldSoft }]}
        >
          <Icon name="Upload" size={17} color={theme.colors.emerald} />
          <View style={styles.dropzoneText}>
            <Text style={[styles.dropzoneTitle, { color: theme.colors.text }]}>
              {billsAttached ? '2 bills attached · Add more' : 'Upload invoice/voucher scans'}
            </Text>
            <Text style={[styles.dropzoneSub, { color: theme.colors.textSubtle }]}>PDF, JPG, PNG · up to 10 MB per bill</Text>
          </View>
        </Pressable>
        <Text style={[styles.attachNote, { color: theme.colors.textSubtle }]}>
          Demo build — attaching simulates taxi-invoice.pdf and hotel-invoice.pdf against this claim.
        </Text>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 14 },
  bigPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bigPill: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  bigPillText: { fontSize: 13, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  stepText: { fontSize: 11, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  typeChipText: { fontSize: 10.5, fontWeight: '700' },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  searchGrow: { flexGrow: 2, flexBasis: 220 },
  list: { gap: 12 },
  listWide: { flexDirection: 'row', flexWrap: 'wrap' },
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
  attachLabel: { fontSize: 11.5, fontWeight: '700', marginTop: 4 },
  dropzone: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', padding: 14 },
  dropzoneText: { flex: 1, minWidth: 0, gap: 2 },
  dropzoneTitle: { fontSize: 12, fontWeight: '700' },
  dropzoneSub: { fontSize: 10 },
  attachNote: { fontSize: 10.5, lineHeight: 15 },
});
