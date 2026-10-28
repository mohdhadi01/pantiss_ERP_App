import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { SalaryRecord, salaryMonthLabel, salaryDateLabel, salaryMoney } from '../salaryData';
import { formatRupees } from '../../../utils/formatCurrency';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline, TimelineItem } from '../../../components/ui/Timeline';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

const BreakdownRow: React.FC<{ label: string; value: string; accent?: string; bold?: boolean; last?: boolean }> = ({ label, value, accent, bold, last }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.breakRow, last && styles.breakRowLast]}>
      <Text style={[styles.breakLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.breakValue, { color: accent ?? theme.colors.text, fontWeight: bold ? '700' : '600' }]}>{value}</Text>
    </View>
  );
};

const AuthRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.breakRow, last && styles.breakRowLast]}>
      <Text style={[styles.breakLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.authValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const BreakdownGroup: React.FC<{ title: string; rows: Array<[string, number, boolean?]>; total: number; totalLabel: string }> = ({ title, rows, total, totalLabel }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.groupPanel, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.groupTitle, { color: theme.colors.textSubtle }]}>{title}</Text>
      {rows.map(([label, amount, negative], index) => (
        <BreakdownRow
          key={label}
          label={label}
          value={`${negative ? '− ' : ''}${salaryMoney(amount)}`}
          accent={negative ? theme.colors.dangerText : undefined}
          last={index === rows.length - 1}
        />
      ))}
      <View style={[styles.groupTotal, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.groupTotalLabel, { color: theme.colors.text }]}>{totalLabel}</Text>
        <Text style={[styles.groupTotalValue, { color: theme.colors.text }]}>{salaryMoney(total)}</Text>
      </View>
    </View>
  );
};

/** Employee Salary Record — net highlight, earnings/deductions, authorization + history. */
export const SalaryRecordSheet: React.FC<{
  record: SalaryRecord | null;
  visible: boolean;
  onClose: () => void;
  history: SalaryRecord[];
}> = ({ record, visible, onClose, history }) => {
  const { theme } = useTheme();
  if (!record) return null;
  const timeline: TimelineItem[] = history.map((monthRecord) => ({
    key: monthRecord.month,
    title: salaryMonthLabel(monthRecord.month),
    actor: monthRecord.status === 'Disbursed' ? `Paid via ${monthRecord.bankName}` : monthRecord.forwardedBy ?? 'Awaiting finance action',
    detail: monthRecord.status === 'Disbursed' ? `Net ${formatRupees(monthRecord.netPay)} · Ref ${monthRecord.reference ?? '—'}` : `Status: ${monthRecord.status}`,
    time: monthRecord.paidOn ? `Paid ${salaryDateLabel(monthRecord.paidOn)}` : undefined,
    color:
      monthRecord.status === 'Disbursed'
        ? theme.colors.emerald
        : monthRecord.status === 'Hold'
          ? theme.colors.danger
          : theme.colors.warning,
  }));

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Employee Salary Record"
      title={record.name}
      description={`${record.id} · ${salaryMonthLabel(record.month)}`}
      size="md"
      footer={
        <View style={styles.sheetFooter}>
          <Text numberOfLines={1} style={[styles.footerBank, { color: theme.colors.textMuted }]}>
            Bank: {record.bankName} (A/C: ...{record.bankAccount.slice(-4)})
          </Text>
          <Button label="Close details" variant="outline" size="sm" onPress={onClose} />
        </View>
      }
    >
      <View style={[styles.netHighlight, { backgroundColor: theme.colors.emeraldSoft, borderColor: theme.colors.successBorder }]}>
        <Text style={[styles.netLabel, { color: theme.colors.textMuted }]}>Net Payable Salary · {salaryMonthLabel(record.month)}</Text>
        <Text style={[styles.netValue, { color: theme.colors.text }]}>{formatRupees(record.netPay)}</Text>
        <Text style={[styles.netBank, { color: theme.colors.textMuted }]}>
          {record.bankName} · Account: {record.bankAccount} · IFSC: {record.ifsc}
        </Text>
      </View>

      <View style={styles.groupRow}>
        <BreakdownGroup
          title="Earnings"
          rows={[
            ['Basic pay + HRA', record.basicHra],
            ['Allowances', record.allowance],
          ]}
          total={record.basicHra + record.allowance}
          totalLabel="Total Earnings"
        />
        <BreakdownGroup
          title="Deductions"
          rows={[
            ['EPF (Provident Fund)', record.pfDeduction, true],
            ['ESIC (Employee State Insurance)', record.esiDeduction, true],
            ['TDS (Tax Deducted at Source)', record.tdsDeduction, true],
          ]}
          total={record.pfDeduction + record.esiDeduction + record.tdsDeduction}
          totalLabel="Total Deductions"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Finance Department Authorization</Text>
      <View style={[styles.breakPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <AuthRow label="Approval status" value={record.approvalStatus} />
        <AuthRow label="Finance approver" value={record.approvedBy ? `${record.approvedBy} · ${salaryDateLabel(record.approvedOn)}` : '—'} />
        <AuthRow label="Forwarded" value={record.forwardedAt ? `${record.forwardedBy ?? 'Finance'} · ${salaryDateLabel(record.forwardedAt.slice(0, 10))}` : 'Not forwarded'} />
        <AuthRow label="Payment status" value={record.status === 'Disbursed' ? `Disbursed · Ref ${record.reference ?? '—'}` : record.status} last />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Monthly Payment History</Text>
      <Timeline items={timeline} accent={theme.colors.financeAccent} />
    </ModalSheet>
  );
};

/** Month-wise payment tracking card (web SalaryView.tsx:614-645). */
export const MonthTrackingCard: React.FC<{
  monthLabel: string;
  paidAmount: string;
  paidCount: number;
  employees: number;
  outstanding: string;
  active: boolean;
  onPress: () => void;
}> = ({ monthLabel, paidAmount, paidCount, employees, outstanding, active, onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={styles.trackWrap}>
      <View
        style={[
          styles.trackCard,
          {
            borderColor: active ? theme.colors.financeAccent : theme.colors.border,
            backgroundColor: active ? theme.colors.financeAccentSoft : theme.colors.moduleBg,
          },
        ]}
      >
        <View style={styles.trackTop}>
          <Text style={[styles.trackMonth, { color: theme.colors.text }]}>{monthLabel}</Text>
          <Icon name="ArrowUpRight" size={14} color={theme.colors.textMuted} />
        </View>
        <Text style={[styles.trackAmount, { color: theme.colors.text }]}>{paidAmount}</Text>
        <Text style={[styles.trackCaption, { color: theme.colors.textMuted }]}>
          Paid · {paidCount}/{employees} employees
        </Text>
        <ProgressBar value={employees ? Math.round((paidCount / employees) * 100) : 0} height={5} color={theme.colors.financeAccent} style={styles.trackProgress} />
        <Text style={[styles.trackOutstanding, { color: theme.colors.textMuted }]}>
          {employees ? `${outstanding} outstanding` : 'No payroll records'}
        </Text>
      </View>
    </Pressable>
  );
};

/** Stacked salary card (<1024px). */
export const SalaryMobileCard: React.FC<{
  record: SalaryRecord;
  actions?: React.ReactNode;
  onPress: () => void;
}> = ({ record, actions, onPress }) => {
  const { theme } = useTheme();
  const forwarded = Boolean(record.forwardedAt);
  return (
    <Pressable onPress={onPress}>
      <Card padding={14} style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.financeAccentSoft }]}>
            <Text style={[styles.avatarText, { color: theme.colors.financeAccent }]}>
              {record.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{record.name}</Text>
            <Text style={[styles.sub, { color: theme.colors.textSubtle }]}>{record.id} · {record.designation}</Text>
          </View>
          <StatusChip
            status={record.approvalStatus}
            tone={record.approvalStatus === 'Approved' ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.payRow}>
          <Cell label="Gross" value={formatRupees(record.basicHra + record.allowance)} />
          <Cell label="Deductions" value={formatRupees(record.pfDeduction + record.esiDeduction + record.tdsDeduction)} />
          <Cell label="Net" value={formatRupees(record.netPay)} accent={theme.colors.financeAccent} />
        </View>
        <View style={styles.metaRow}>
          <Icon name={forwarded ? 'Send' : 'Clock'} size={13} color={forwarded ? theme.colors.infoText : theme.colors.textSubtle} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
            {forwarded ? 'Forwarded to payments' : 'Not forwarded'} · {record.bankName}
          </Text>
        </View>
        {actions ? <View style={styles.actionsRow}>{actions}</View> : null}
      </Card>
    </Pressable>
  );
};

const Cell: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.cell}>
      <Text style={[styles.cellValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
      <Text style={[styles.cellLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  breakPanel: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 4 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 34, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128, 144, 168, 0.10)' },
  breakRowLast: { borderBottomWidth: 0 },
  breakLabel: { fontSize: 12, flex: 1, minWidth: 0 },
  breakValue: { fontSize: 12.5, fontVariant: ['tabular-nums'], textAlign: 'right' },
  authValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
  netHighlight: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 6 },
  netLabel: { fontSize: 11.5 },
  netValue: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  netBank: { fontSize: 10.5 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  groupPanel: { flexGrow: 1, flexBasis: 240, borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  groupTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  groupTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 8, marginTop: 4 },
  groupTotalLabel: { fontSize: 12, fontWeight: '700' },
  groupTotalValue: { fontSize: 12.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sheetFooter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  footerBank: { fontSize: 11, flex: 1, minWidth: 0 },
  trackWrap: { flexGrow: 1, flexBasis: 220 },
  trackCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 3 },
  trackTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  trackMonth: { fontSize: 12.5, fontWeight: '600' },
  trackAmount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: 8 },
  trackCaption: { fontSize: 11 },
  trackProgress: { marginTop: 10 },
  trackOutstanding: { fontSize: 11, marginTop: 8 },
  card: { gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700' },
  titleCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 13.5, fontWeight: '700' },
  sub: { fontSize: 11, marginTop: 1 },
  payRow: { flexDirection: 'row', gap: 14, paddingTop: 2 },
  cell: { flex: 1, gap: 3 },
  cellValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cellLabel: { fontSize: 9.5, marginTop: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
