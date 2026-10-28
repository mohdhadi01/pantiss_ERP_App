import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useAuth } from '../../../hooks/useAuth';
import { useSalaryRecords } from '../useSalaryRecords';
import {
  payrollMonths,
  salaryKey,
  salaryMonthLabel,
  salaryTotals,
  salaryWorkflowLabel,
  SalaryRecord,
  canForwardSalary,
  isFinanceEligible,
} from '../salaryData';
import { financeAreas } from '../data';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner, HeroGlassCard } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Tabs } from '../../../components/ui/Tabs';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { SalaryRecordSheet, SalaryMobileCard, MonthTrackingCard } from './SalaryParts';

type FilterKey = 'all' | 'pending' | 'ready' | 'forwarded' | 'disbursed';

const projectNameOf = (id?: string) => {
  if (!id) return 'Unassigned';
  return financeAreas.flatMap((area) => area.projects).find((project) => project.id === id)?.name ?? id;
};

export const SalaryView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { user } = useAuth();
  const actor = user ? `${user.name} (${user.roleLabel})` : 'Finance Manager';
  const [selectedMonth, setSelectedMonth] = useState(payrollMonths[0]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [scopeAreaId, setScopeAreaId] = useState('all');
  const [scopeProjectId, setScopeProjectId] = useState('all');
  const [activeRecord, setActiveRecord] = useState<SalaryRecord | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);

  const { allRecords, forwardForPayment, forwardMultiple, approveSalary, rejectSalary, savePayment } =
    useSalaryRecords('finance');

  const monthlyRecords = useMemo(
    () => allRecords.filter((r) => r.month === selectedMonth),
    [allRecords, selectedMonth],
  );
  const totals = useMemo(() => salaryTotals(monthlyRecords), [monthlyRecords]);

  const scopeAreas = useMemo(() => {
    const ids = Array.from(new Set(monthlyRecords.map((r) => r.projectId).filter(Boolean))) as string[];
    return financeAreas
      .filter((area) => area.projects.some((p) => ids.includes(p.id)))
      .map((area) => ({ area, count: monthlyRecords.filter((r) => area.projects.some((p) => p.id === r.projectId)).length }));
  }, [monthlyRecords]);

  const scopeProjects = useMemo(() => {
    const area = financeAreas.find((a) => a.id === scopeAreaId);
    const projects = area ? area.projects : financeAreas.flatMap((a) => a.projects);
    return projects
      .filter((p) => monthlyRecords.some((r) => r.projectId === p.id))
      .map((p) => ({ project: p, count: monthlyRecords.filter((r) => r.projectId === p.id).length }));
  }, [monthlyRecords, scopeAreaId]);

  const scoped = useMemo(
    () =>
      monthlyRecords.filter((r) => {
        const matchesProject =
          scopeProjectId === 'all' ||
          r.projectId === scopeProjectId ||
          (scopeProjectId === 'none' && !r.projectId);
        const matchesArea =
          scopeAreaId === 'all' ||
          financeAreas.find((a) => a.id === scopeAreaId)?.projects.some((p) => p.id === r.projectId) ||
          false;
        const matchesScope = scopeProjectId === 'all' ? matchesArea : matchesProject;
        return matchesScope;
      }),
    [monthlyRecords, scopeAreaId, scopeProjectId],
  );

  const isReady = (rec: SalaryRecord) => rec.status === 'Pending' && !rec.forwardedAt;
  const readyAll = useMemo(() => scoped.filter((rec) => canForwardSalary(rec)), [scoped]);
  const readyAllTotal = readyAll.reduce((sum, rec) => sum + rec.netPay, 0);
  const counts = useMemo(
    () => ({
      all: scoped.length,
      pending: scoped.filter((r) => r.approvalStatus === 'Pending approval').length,
      ready: scoped.filter(isReady).length,
      forwarded: scoped.filter((r) => Boolean(r.forwardedAt) && r.status === 'Pending').length,
      disbursed: scoped.filter((r) => r.status === 'Disbursed').length,
    }),
    [scoped],
  );

  const filtered = useMemo(
    () =>
      scoped.filter((rec) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          `${rec.name} ${rec.id} ${rec.designation} ${rec.department}`.toLowerCase().includes(q);
        if (filter === 'pending') return matchesSearch && rec.approvalStatus === 'Pending approval';
        if (filter === 'ready') return matchesSearch && isReady(rec);
        if (filter === 'forwarded') return matchesSearch && Boolean(rec.forwardedAt) && rec.status === 'Pending';
        if (filter === 'disbursed') return matchesSearch && rec.status === 'Disbursed';
        return matchesSearch;
      }),
    [scoped, search, filter],
  );

  const forwardable = useMemo(() => filtered.filter((r) => canForwardSalary(r)), [filtered]);
  const forwardableTotal = forwardable.reduce((sum, r) => sum + r.netPay, 0);

  const exportCsv = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const cell = (value: string | number) => `"${String(value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
    const header = [
      'Month', 'Project', 'Employee ID', 'Employee', 'Designation', 'Department', 'Bank', 'Account No',
      'Gross', 'EPF', 'ESIC', 'TDS', 'Net Pay', 'Approval Status', 'Approved By', 'Workflow', 'Payment Date', 'Bank Reference',
    ];
    const rows = filtered.map((record) => [
      salaryMonthLabel(selectedMonth),
      projectNameOf(record.projectId),
      record.id,
      record.name,
      record.designation,
      record.department,
      record.bankName,
      record.bankAccount,
      record.basicHra + record.allowance,
      record.pfDeduction,
      record.esiDeduction,
      record.tdsDeduction,
      record.netPay,
      record.approvalStatus,
      record.approvedBy ?? '',
      salaryWorkflowLabel(record),
      record.paidOn ?? '',
      record.reference ?? '',
    ]);
    const csv = [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    Share.share({ title: 'Salary register (CSV)', message: csv }).catch(() => {});
  };

  const monthSummaries = useMemo(
    () => payrollMonths.map((m) => salaryTotals(scoped.filter((r) => r.month === m))),
    [scoped],
  );

  const runWorkflow = (fn: () => Promise<void>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    fn().catch(() => {});
  };

  const columns: Array<DataColumn<SalaryRecord>> = [
    { key: 'employee', label: 'Employee', flex: 1.8 },
    { key: 'gross', label: 'Gross Pay', flex: 1, align: 'right', wideOnly: true },
    { key: 'deductions', label: 'Deductions', flex: 1, align: 'right', wideOnly: true },
    { key: 'net', label: 'Net Salary', flex: 1.1, align: 'right' },
    { key: 'approval', label: 'Approval Status', flex: 1.6 },
    { key: 'forwarding', label: 'Payment Forwarding', flex: 1.4, wideOnly: true },
    { key: 'actions', label: 'Actions', flex: 1.2, align: 'right' },
  ];

  const rowActions = (rec: SalaryRecord) => (
    <View style={styles.actionsRow}>
      {isFinanceEligible(rec) && rec.approvalStatus !== 'Approved' ? (
        <IconBtn icon="Check" color={theme.colors.successText} label={`Approve ${rec.name}`} onPress={() => runWorkflow(() => approveSalary(salaryKey(rec), actor))} />
      ) : null}
      {rec.status !== 'Disbursed' && rec.approvalStatus !== 'Rejected' ? (
        <IconBtn icon="XCircle" color={theme.colors.dangerText} label={`Reject ${rec.name}`} onPress={() => runWorkflow(() => rejectSalary(salaryKey(rec)))} />
      ) : null}
      {canForwardSalary(rec) ? (
        <IconBtn icon="Send" color={theme.colors.financeAccent} label={`Forward ${rec.name}`} onPress={() => runWorkflow(() => forwardForPayment(salaryKey(rec), actor))} />
      ) : null}
      <IconBtn
        icon="Eye"
        color={theme.colors.textMuted}
        label={`View ${rec.name}`}
        onPress={() => {
          setActiveRecord(rec);
          setRecordOpen(true);
        }}
      />
    </View>
  );

  const renderCell = (rec: SalaryRecord, col: DataColumn<SalaryRecord>) => {
    switch (col.key) {
      case 'employee':
        return (
          <View style={styles.employeeCell}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.financeAccentSoft }]}>
              <Text style={[styles.avatarText, { color: theme.colors.financeAccent }]}>
                {rec.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </Text>
            </View>
            <View style={styles.employeeText}>
              <Text numberOfLines={1} style={[styles.employeeName, { color: theme.colors.text }]}>{rec.name}</Text>
              <Text style={[styles.employeeSub, { color: theme.colors.textSubtle }]}>{rec.id} · {rec.designation}</Text>
            </View>
          </View>
        );
      case 'gross':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(rec.basicHra + rec.allowance)}</Text>;
      case 'deductions':
        return <Text style={[styles.numText, { color: theme.colors.dangerText }]}>−{formatRupees(rec.pfDeduction + rec.esiDeduction + rec.tdsDeduction)}</Text>;
      case 'net':
        return <Text style={[styles.numText, { color: theme.colors.financeAccent, fontWeight: '700' }]}>{formatRupees(rec.netPay)}</Text>;
      case 'approval':
        return (
          <View>
            <StatusChip status={rec.approvalStatus} tone={rec.approvalStatus === 'Approved' ? 'success' : 'warning'} />
            {rec.approvedBy ? (
              <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                {rec.approvedBy} · {formatDate(rec.approvedOn ?? '')}
              </Text>
            ) : null}
          </View>
        );
      case 'forwarding':
        return <StatusChip status={rec.forwardedAt ? 'Forwarded' : 'Not forwarded'} tone={rec.forwardedAt ? 'info' : 'neutral'} />;
      case 'actions':
        return rowActions(rec);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.salary}
        badge={{ icon: 'Coins', label: 'Payroll & Payment Authorizations' }}
        title="Salary Approvals & Payment Forwarding"
        description="Verify if monthly salaries are approved across projects, authorize pending requests, and forward them directly to the Finance Payment Desk for disbursement."
        right={
          <HeroGlassCard label="Payroll month">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthChips}>
              {payrollMonths.map((m) => {
                const active = m === selectedMonth;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setSelectedMonth(m)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.monthChip,
                      { backgroundColor: active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.1)', borderColor: active ? '#ffffff' : 'rgba(255, 255, 255, 0.16)' },
                    ]}
                  >
                    <Text style={[styles.monthChipText, { color: active ? '#065f46' : '#d1fae5' }]}>{salaryMonthLabel(m)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </HeroGlassCard>
        }
      />

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Total Payroll" value={formatRupees(totals.net)} subtitle={`${totals.employees} employees · Gross ${formatRupees(totals.gross)}`} icon="Coins" accentColor={theme.colors.financeAccent} arrow />
        <MetricCard style={styles.metricCard} label="Pending Approval" value={String(counts.pending)} subtitle={counts.pending ? 'Awaiting Finance review' : 'All salaries approved'} icon="Clock3" accentColor={theme.colors.warning} arrow />
        <MetricCard style={styles.metricCard} label="Ready to Forward" value={String(readyAll.length)} subtitle={readyAll.length ? `${formatRupees(readyAllTotal)} approved & ready` : 'None waiting to forward'} icon="Send" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Disbursed / Paid" value={formatRupees(totals.paid)} subtitle={`${totals.paidCount} of ${totals.employees} paid`} icon="CheckCircle2" accentColor={theme.colors.emerald} arrow />
      </View>

      <View style={styles.scopeBlock}>
        <Text style={[styles.scopeTitle, { color: theme.colors.textMuted }]}>Scope — center & project</Text>
        <View style={styles.scopeRow}>
          <ScopeChip icon="Building2" label="All areas" active={scopeAreaId === 'all'} onPress={() => { setScopeAreaId('all'); setScopeProjectId('all'); }} theme={theme} />
          {scopeAreas.map(({ area, count }) => (
            <ScopeChip key={area.id} icon="Building2" label={`${area.shortName} (${count})`} active={scopeAreaId === area.id} onPress={() => { setScopeAreaId(area.id); setScopeProjectId('all'); }} theme={theme} color={area.color} />
          ))}
        </View>
        <View style={styles.scopeRow}>
          <ScopeChip icon="FolderKanban" label="All projects" active={scopeProjectId === 'all'} onPress={() => setScopeProjectId('all')} theme={theme} />
          {scopeProjects.map(({ project, count }) => (
            <ScopeChip key={project.id} icon="FolderKanban" label={`${project.name} (${count})`} active={scopeProjectId === project.id} onPress={() => setScopeProjectId(project.id)} theme={theme} />
          ))}
        </View>
      </View>

      <SectionCard
        title="Employee Salaries"
        description="Approve, forward and disburse monthly payroll against project cost centers."
        action={
          <View style={[styles.registerBadge, { backgroundColor: theme.colors.financeAccentSoft }]}>
            <Text style={[styles.registerBadgeText, { color: theme.colors.financeAccent }]}>
              {scopeProjectId === 'all' ? 'All projects' : projectNameOf(scopeProjectId)} · {salaryMonthLabel(selectedMonth)}
            </Text>
          </View>
        }
        footer={
          <View style={styles.registerFooter}>
            <Button
              label={`Forward All Approved (${forwardable.length} · ${formatRupees(forwardableTotal)})`}
              icon="Send"
              variant="emerald"
              size="sm"
              disabled={forwardable.length === 0}
              onPress={() => runWorkflow(() => forwardMultiple(forwardable.map((r) => salaryKey(r)), actor))}
            />
            <Button label="Export CSV" icon="Download" variant="outline" size="sm" disabled={filtered.length === 0} onPress={exportCsv} />
          </View>
        }
      >
        <Tabs
          items={[
            { key: 'all', label: `All Employees (${counts.all})` },
            { key: 'pending', label: `Pending Approval (${counts.pending})` },
            { key: 'ready', label: `Ready to Forward (${counts.ready})` },
            { key: 'forwarded', label: `Forwarded to Payments (${counts.forwarded})` },
            { key: 'disbursed', label: `Disbursed (${counts.disbursed})` },
          ]}
          activeKey={filter}
          onChange={(key) => setFilter(key as FilterKey)}
          accent={theme.colors.financeAccent}
        />
        <TextField value={search} onChangeText={setSearch} placeholder="Search by employee name, PAN-EMP ID, designation, or department..." />

        <DataTable
          columns={columns}
          rows={filtered}
          keyExtractor={(rec) => salaryKey(rec)}
          renderCell={renderCell}
          renderMobileCard={(rec) => <SalaryMobileCard record={rec} actions={rowActions(rec)} onPress={() => { setActiveRecord(rec); setRecordOpen(true); }} />}
          emptyIcon="Coins"
          emptyTitle="No salaries in this bucket"
          emptyDescription="Adjust the payroll month, scope or filter to see employee records."
        />
      </SectionCard>

      <SectionCard
        title="Month-wise payment tracking"
        description="Compare this project's payroll and open any month to review its employees."
        action={<Icon name="CalendarDays" size={20} color={theme.colors.financeAccent} />}
      >
        <View style={styles.trackGrid}>
          {payrollMonths.map((m, index) => {
            const summary = monthSummaries[index];
            return (
              <MonthTrackingCard
                key={m}
                monthLabel={salaryMonthLabel(m)}
                paidAmount={formatRupees(summary.paid)}
                paidCount={summary.paidCount}
                employees={summary.employees}
                outstanding={formatRupees(summary.outstanding)}
                active={m === selectedMonth}
                onPress={() => setSelectedMonth(m)}
              />
            );
          })}
        </View>
      </SectionCard>

      <SalaryRecordSheet
        record={activeRecord}
        visible={recordOpen}
        onClose={() => setRecordOpen(false)}
        history={activeRecord ? allRecords.filter((r) => r.id === activeRecord.id) : []}
      />
    </View>
  );
};

const IconBtn: React.FC<{ icon: string; color: string; label: string; onPress: () => void }> = ({ icon, color, label, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={styles.iconBtn}>
    <Icon name={icon} size={16} color={color} />
  </Pressable>
);

const ScopeChip: React.FC<{
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  color?: string;
}> = ({ icon, label, active, onPress, theme, color }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    style={[
      styles.scopeChip,
      {
        borderColor: active ? theme.colors.financeAccent : theme.colors.border,
        backgroundColor: active ? theme.colors.financeAccentSoft : 'transparent',
      },
    ]}
  >
    <Icon name={icon} size={13} color={active ? theme.colors.financeAccent : color ?? theme.colors.textSubtle} />
    <Text numberOfLines={1} style={[styles.scopeChipText, { color: active ? theme.colors.financeAccent : theme.colors.textMuted }]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { gap: 16 },
  monthChips: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  monthChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  monthChipText: { fontSize: 11.5, fontWeight: '600', textAlign: 'center' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  scopeBlock: { gap: 8 },
  scopeTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  scopeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scopeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, maxWidth: 240 },
  scopeChipText: { fontSize: 11.5, fontWeight: '600', flexShrink: 1 },
  registerBadge: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  registerBadgeText: { fontSize: 10.5, fontWeight: '700' },
  registerFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  employeeCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  employeeText: { flex: 1, minWidth: 0 },
  employeeName: { fontSize: 13, fontWeight: '600' },
  employeeSub: { fontSize: 10.5, marginTop: 1 },
  cellSub: { fontSize: 10, marginTop: 3 },
  numText: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: undefined },
});
