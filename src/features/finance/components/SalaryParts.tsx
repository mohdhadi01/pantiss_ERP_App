import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { SalaryRecord, salaryMonthLabel, salaryDateLabel } from '../salaryData';
import { formatRupees } from '../../../utils/formatCurrency';
import { Card } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline, TimelineItem } from '../../../components/ui/Timeline';
import { Icon } from '../../../components/ui/Icon';

const BreakdownRow: React.FC<{ label: string; value: string; accent?: string; bold?: boolean }> = ({ label, value, accent, bold }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.breakRow}>
      <Text style={[styles.breakLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.breakValue, { color: accent ?? theme.colors.text, fontWeight: bold ? '700' : '600' }]}>{value}</Text>
    </View>
  );
};

const AuthRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.breakRow}>
      <Text style={[styles.breakLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.authValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

/** Employee Salary Record — gross/deduction breakdown + finance authorization + history. */
export const SalaryRecordSheet: React.FC<{
  record: SalaryRecord | null;
  visible: boolean;
  onClose: () => void;
  history: SalaryRecord[];
}> = ({ record, visible, onClose, history }) => {
  const { theme } = useTheme();
  if (!record) return null;
  const deductions = record.pfDeduction + record.esiDeduction + record.tdsDeduction;
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
    <ModalSheet visible={visible} onClose={onClose} label="Payroll register" title={record.name} description={`${record.designation} · ${record.department} · ${salaryMonthLabel(record.month)}`} size="md">
      <View style={[styles.breakPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <BreakdownRow label="Basic + HRA" value={formatRupees(record.basicHra)} />
        <BreakdownRow label="Allowances" value={formatRupees(record.allowance)} />
        <BreakdownRow label="EPF" value={`− ${formatRupees(record.pfDeduction)}`} accent={theme.colors.dangerText} />
        <BreakdownRow label="ESIC" value={`− ${formatRupees(record.esiDeduction)}`} accent={theme.colors.dangerText} />
        <BreakdownRow label="TDS" value={`− ${formatRupees(record.tdsDeduction)}`} accent={theme.colors.dangerText} />
        <BreakdownRow label="Net salary" value={formatRupees(record.netPay)} accent={theme.colors.financeAccent} bold />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Finance Department Authorization</Text>
      <View style={[styles.breakPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <AuthRow label="Approval status" value={record.approvalStatus} />
        <AuthRow label="Finance approver" value={record.approvedBy ? `${record.approvedBy} · ${salaryDateLabel(record.approvedOn)}` : '—'} />
        <AuthRow label="Forwarded" value={record.forwardedAt ? `${record.forwardedBy ?? 'Finance'} · ${salaryDateLabel(record.forwardedAt.slice(0, 10))}` : 'Not forwarded'} />
        <AuthRow label="Payment status" value={record.status === 'Disbursed' ? `Disbursed · Ref ${record.reference ?? '—'}` : record.status} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Monthly Payment History</Text>
      <Timeline items={timeline} accent={theme.colors.financeAccent} />
    </ModalSheet>
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
  breakPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 9 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  breakLabel: { fontSize: 12 },
  breakValue: { fontSize: 12.5, fontVariant: ['tabular-nums'], textAlign: 'right' },
  authValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
  card: { gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700' },
  titleCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 13.5, fontWeight: '700' },
  sub: { fontSize: 11, marginTop: 1 },
  payRow: { flexDirection: 'row', gap: 10 },
  cell: { flex: 1 },
  cellValue: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cellLabel: { fontSize: 9.5, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
