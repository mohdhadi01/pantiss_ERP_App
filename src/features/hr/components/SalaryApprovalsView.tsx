import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useSalaryRecords } from '../../finance/useSalaryRecords';
import {
  payrollMonths,
  salaryKey,
  salaryMonthLabel,
  salaryWorkflowLabel,
  isFinanceEligible,
  SalaryRecord,
} from '../../finance/salaryData';
import { exportCsv } from '../csv';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';

const HR_ACTOR = 'Ritika Sen (HR Manager)';

type StageFilter = 'all' | 'awaiting-admin' | 'ready-hr' | 'released' | 'returned';

export const SalaryApprovalsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [selectedMonth, setSelectedMonth] = useState(payrollMonths[0]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<StageFilter>('all');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');

  const { records, reviewByHR } = useSalaryRecords('hr');

  const monthlyRecords = records.filter((r) => r.month === selectedMonth);
  const counts = {
    awaitingAdmin: monthlyRecords.filter((r) => r.adminApproval === 'Pending').length,
    ready: monthlyRecords.filter((r) => r.adminApproval === 'Approved' && r.hrApproval === 'Pending').length,
    released: monthlyRecords.filter((r) => r.adminApproval === 'Approved' && r.hrApproval === 'Approved').length,
    returned: monthlyRecords.filter((r) => r.hrApproval === 'Rejected').length,
  };
  const readyMoney = monthlyRecords
    .filter((r) => r.adminApproval === 'Approved' && r.hrApproval === 'Pending')
    .reduce((sum, r) => sum + r.netPay, 0);

  const filtered = monthlyRecords.filter((rec) => {
    const q = search.trim().toLowerCase();
    const matches =
      rec.name.toLowerCase().includes(q) ||
      rec.id.toLowerCase().includes(q) ||
      rec.designation.toLowerCase().includes(q);
    const isReady = rec.adminApproval === 'Approved' && rec.hrApproval === 'Pending';
    const isReleased = rec.adminApproval === 'Approved' && rec.hrApproval === 'Approved';
    const stageOK =
      stage === 'all'
        ? true
        : stage === 'awaiting-admin'
          ? rec.adminApproval === 'Pending'
          : stage === 'ready-hr'
            ? isReady
            : stage === 'released'
              ? isReleased
              : rec.hrApproval === 'Rejected';
    return matches && stageOK;
  });

  const reviewRecord = reviewId ? monthlyRecords.find((r) => salaryKey(r) === reviewId) : undefined;
  const reviewable = (rec?: SalaryRecord) => Boolean(rec && rec.adminApproval === 'Approved' && rec.hrApproval === 'Pending');

  const decide = (rec: SalaryRecord, decision: 'Approved' | 'Rejected') => {
    Haptics.notificationAsync(
      decision === 'Approved' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
    reviewByHR(salaryKey(rec), decision, HR_ACTOR, note.trim());
    setFeedback(
      decision === 'Approved'
        ? `${rec.name}’s salary is approved by HR and now visible in Finance.`
        : `${rec.name}’s salary was returned with your reason. It remains outside Finance.`,
    );
    setReviewId(null);
    setNote('');
  };

  const handleExport = () => {
    exportCsv(`hr-approvals-${selectedMonth}`, [
      ['Employee', 'ID', 'Month', 'Net pay', 'Admin', 'HR', 'Finance'],
      ...filtered.map((r) => [
        r.name,
        r.id,
        r.month,
        r.netPay,
        r.adminApproval,
        r.hrApproval,
        isFinanceEligible(r) ? salaryWorkflowLabel(r) : 'Not released',
      ]),
    ]).catch(() => {});
  };

  const columns: DataColumn<SalaryRecord>[] = [
    { key: 'employee', label: 'Employee', flex: 1.4 },
    { key: 'net', label: 'Net salary', width: 110, align: 'right' },
    { key: 'admin', label: 'Admin approval', flex: 1.2 },
    { key: 'hr', label: 'HR approval', flex: 1.2 },
    { key: 'finance', label: 'Finance status', flex: 1 },
    { key: 'action', label: 'Action', width: 128 },
  ];

  return (
    <View style={styles.container}>
      <Card padding={16} style={styles.workflow}>
        <View style={[styles.workflowIcon, { backgroundColor: theme.colors.brandSoft }]}>
          <Icon name="ShieldCheck" size={18} color={theme.colors.brandPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.steps}>
          {['1. Admin approval', '2. HR approval', '3. Finance processing'].map((step, index) => {
            const active = index === 1;
            return (
              <View
                key={step}
                style={[
                  styles.stepPill,
                  {
                    backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                    borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.stepText, { color: active ? '#ffffff' : theme.colors.textMuted }]}
                >
                  {step}
                </Text>
                {index < 2 ? <Icon name="ChevronRight" size={14} color={theme.colors.textSubtle} /> : null}
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard label="Awaiting Admin" value={counts.awaitingAdmin} subtitle="HR approval is locked" style={styles.metric} />
        <MetricCard label="Ready for HR approval" value={counts.ready} subtitle={`${formatRupees(readyMoney)} net salary`} style={styles.metric} />
        <MetricCard label="Released to Finance" value={counts.released} subtitle="Admin and HR have approved" style={styles.metric} />
        <MetricCard label="Returned by HR" value={counts.returned} subtitle="Held outside Finance" style={styles.metric} />
      </View>

      {feedback ? (
        <Card padding={14} flat style={[styles.noticeBanner, { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.successBorder }]}>
          <Text style={[styles.noticeText, { color: theme.colors.successText }]}>{feedback}</Text>
        </Card>
      ) : null}

      <SectionCard
        title="Salary approval register"
        description="Approve after Admin clearance. Finance receives only HR-approved records."
        action={<Button label="Export" variant="outline" size="sm" icon="Download" onPress={handleExport} />}
      >
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search payroll by employee or role…" />
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <SelectField
              label="Payroll month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={payrollMonths.map((m) => ({ value: m, label: salaryMonthLabel(m) }))}
            />
          </View>
          <View style={styles.filterCell}>
            <SelectField
              label="Stage"
              value={stage}
              onChange={(v) => setStage(v as StageFilter)}
              options={[
                { value: 'all', label: 'All stages' },
                { value: 'awaiting-admin', label: 'Awaiting Admin clearance' },
                { value: 'ready-hr', label: 'Ready for HR' },
                { value: 'released', label: 'Released to Finance' },
                { value: 'returned', label: 'Returned by HR' },
              ]}
            />
          </View>
        </View>
        <DataTable
          columns={columns}
          rows={filtered}
          keyExtractor={(row) => salaryKey(row)}
          emptyTitle="No salary records match"
          emptyDescription="Adjust the search, month or stage filters."
          emptyIcon="Wallet"
          renderCell={(rec, column) => {
            switch (column.key) {
              case 'employee':
                return (
                  <View style={styles.personRow}>
                    <Avatar name={rec.name} size={32} />
                    <View style={styles.personMain}>
                      <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{rec.name}</Text>
                      <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                        {rec.designation} · {rec.id}
                      </Text>
                    </View>
                  </View>
                );
              case 'net':
                return <Text style={[styles.money, { color: theme.colors.text }]}>{formatRupees(rec.netPay)}</Text>;
              case 'admin':
                return (
                  <View style={styles.stack4}>
                    <StatusChip status={`Admin ${rec.adminApproval}`} tone={rec.adminApproval === 'Approved' ? 'success' : rec.adminApproval === 'Rejected' ? 'danger' : 'warning'} />
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {rec.adminApprovedBy ?? 'Awaiting Admin'} · {rec.adminApprovedOn ? formatDate(rec.adminApprovedOn) : '—'}
                    </Text>
                  </View>
                );
              case 'hr':
                return (
                  <View style={styles.stack4}>
                    <StatusChip status={`HR ${rec.hrApproval}`} tone={rec.hrApproval === 'Approved' ? 'success' : rec.hrApproval === 'Rejected' ? 'danger' : 'warning'} />
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {rec.hrApprovedBy ?? 'Awaiting HR review'}{rec.hrApprovedOn ? ` · ${formatDate(rec.hrApprovedOn)}` : ''}
                    </Text>
                  </View>
                );
              case 'finance':
                return (
                  <Text style={[styles.cellText, { color: isFinanceEligible(rec) ? theme.colors.text : theme.colors.textSubtle }]}>
                    {isFinanceEligible(rec) ? salaryWorkflowLabel(rec) : 'Not released'}
                  </Text>
                );
              default:
                return (
                  <Button
                    label={reviewable(rec) ? 'Review salary' : 'View details'}
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setNote('');
                      setReviewId(salaryKey(rec));
                    }}
                  />
                );
            }
          }}
          renderMobileCard={(rec) => (
            <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
              <View style={styles.cardTopRow}>
                <Avatar name={rec.name} size={36} />
                <View style={styles.cardTopMain}>
                  <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{rec.name}</Text>
                  <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                    {rec.designation} · {rec.id}
                  </Text>
                </View>
                <View style={styles.netAmountCol}>
                  <Text style={[styles.money, { color: theme.colors.text }]}>{formatRupees(rec.netPay)}</Text>
                  <Text style={[styles.netLabel, { color: theme.colors.textSubtle }]}>net salary</Text>
                </View>
              </View>

              <View style={[styles.cardBottomRow, { borderTopColor: theme.colors.border }]}>
                <View style={styles.chipRow}>
                  <StatusChip
                    status={`Admin ${rec.adminApproval}`}
                    tone={rec.adminApproval === 'Approved' ? 'success' : rec.adminApproval === 'Rejected' ? 'danger' : 'warning'}
                  />
                  <StatusChip
                    status={`HR ${rec.hrApproval}`}
                    tone={rec.hrApproval === 'Approved' ? 'success' : rec.hrApproval === 'Rejected' ? 'danger' : 'warning'}
                  />
                </View>
                <Button
                  label={reviewable(rec) ? 'Review' : 'View details'}
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setNote('');
                    setReviewId(salaryKey(rec));
                  }}
                />
              </View>
            </View>
          )}
        />
      </SectionCard>

      {reviewRecord ? (
        <ModalSheet
          key={reviewId ?? 'review'}
          visible
          onClose={() => setReviewId(null)}
          label={`HR salary review · ${salaryMonthLabel(reviewRecord.month)}`}
          title={reviewRecord.name}
          description={`${reviewRecord.designation} · ${reviewRecord.location} · ${reviewRecord.workingDays} days`}
          size="md"
          footer={
            reviewable(reviewRecord) ? (
              <>
                <Button
                  label="Return salary"
                  variant="outline"
                  icon="XCircle"
                  disabled={!note.trim()}
                  onPress={() => decide(reviewRecord, 'Rejected')}
                />
                <Button
                  label="Approve & release to Finance"
                  variant="primary"
                  icon="CheckCircle2"
                  onPress={() => decide(reviewRecord, 'Approved')}
                />
              </>
            ) : undefined
          }
        >
          <View style={[styles.decisionRow, isMd && styles.decisionRowWide]}>
            <DecisionCard
              title="Admin decision"
              status={`Admin ${reviewRecord.adminApproval}`}
              actor={reviewRecord.adminApprovedBy ?? 'Awaiting Admin'}
              date={reviewRecord.adminApprovedOn ? formatDate(reviewRecord.adminApprovedOn) : '—'}
            />
            <DecisionCard
              title="HR decision"
              status={`HR ${reviewRecord.hrApproval}`}
              actor={reviewRecord.hrApprovedBy ?? 'Awaiting HR review'}
              date={reviewRecord.hrApprovedOn ? formatDate(reviewRecord.hrApprovedOn) : '—'}
            />
          </View>

          <View style={[styles.breakdown, { borderColor: theme.colors.border }]}>
            {[
              { label: 'Basic + HRA', value: reviewRecord.basicHra },
              { label: 'Allowances', value: reviewRecord.allowance },
              { label: 'EPF', value: reviewRecord.pfDeduction },
              { label: 'ESIC', value: reviewRecord.esiDeduction },
              { label: 'TDS', value: reviewRecord.tdsDeduction },
            ].map((row) => (
              <View key={row.label} style={[styles.breakdownRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
                <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>{formatRupees(row.value)}</Text>
              </View>
            ))}
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>Net salary</Text>
              <Text style={[styles.breakdownValue, styles.netBold, { color: theme.colors.brandPrimary }]}>
                {formatRupees(reviewRecord.netPay)}
              </Text>
            </View>
          </View>

          {reviewable(reviewRecord) ? (
            <TextField
              label="Review note / reason for return"
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="A reason is required when returning a salary."
              hint="A note is required when returning a salary to Admin."
            />
          ) : reviewRecord.adminApproval !== 'Approved' ? (
            <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warningBorder }]}>
              <View style={styles.lockedRow}>
                <Icon name="Lock" size={15} color={theme.colors.warningText} />
                <Text style={[styles.lockedText, { color: theme.colors.warningText }]}>
                  HR approval is locked until Admin approves this salary.
                </Text>
              </View>
            </Card>
          ) : (
            <Text style={[styles.decidedNote, { color: theme.colors.textMuted }]}>
              {reviewRecord.hrReason || 'HR review recorded.'}{' '}
              {isFinanceEligible(reviewRecord)
                ? 'This record is available to Finance for processing.'
                : 'This record has not been released to Finance.'}
            </Text>
          )}
        </ModalSheet>
      ) : null}
    </View>
  );
};

const DecisionCard: React.FC<{ title: string; status: string; actor: string; date: string }> = ({
  title,
  status,
  actor,
  date,
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.decisionCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.decisionTitle, { color: theme.colors.textSubtle }]}>{title}</Text>
      <StatusChip status={status} />
      <Text style={[styles.decisionMeta, { color: theme.colors.textMuted }]}>{actor}</Text>
      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  workflow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  workflowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stepText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 170,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  filterCell: {
    flexGrow: 1,
    flexBasis: 220,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  personMain: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  cellTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cellSub: {
    fontSize: 10.5,
  },
  money: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stack4: {
    gap: 4,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTopMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  netAmountCol: {
    alignItems: 'flex-end',
    gap: 1,
  },
  netLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  decisionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  decisionRowWide: {
    flexWrap: 'nowrap',
  },
  decisionCard: {
    flexGrow: 1,
    flexBasis: 200,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  decisionTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  decisionMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdown: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  netBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockedBanner: {
    gap: 8,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  returnReason: {
    fontSize: 11,
    lineHeight: 16,
  },
  noticeBanner: {
    gap: 4,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  cellText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  decidedNote: {
    fontSize: 12,
    lineHeight: 17,
  },
});
