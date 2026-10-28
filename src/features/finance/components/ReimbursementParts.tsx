import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { Card } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface CentreExpense {
  id: string;
  center: string;
  project: string;
  month: string;
  type: 'TA/DA' | 'Office Ops' | 'Utilities';
  amount: number;
  submittedBy: string;
  status: 'Ready' | 'Clarification';
  employees: Array<{ name: string; days: number; amount: number; bills: number }>;
}

/** Centre expense batch card (web Centre Reimbursement tab). */
export const CentreExpenseCard: React.FC<{ expense: CentreExpense; onReview: () => void }> = ({ expense, onReview }) => {
  const { theme } = useTheme();
  return (
    <Card padding={16} style={styles.centreCard}>
      <View style={styles.centreTop}>
        <View style={styles.centreTitleCol}>
          <Text style={[styles.centreName, { color: theme.colors.text }]}>{expense.center}</Text>
          <Text style={[styles.centreSub, { color: theme.colors.brandPrimary }]}>{expense.project}</Text>
          <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>
            {expense.month} · {expense.employees.length} employees · Submitted by {expense.submittedBy}
          </Text>
        </View>
        <View style={styles.centreRight}>
          <StatusChip status={expense.status} tone={expense.status === 'Ready' ? 'success' : 'warning'} />
          <Text style={[styles.centreAmount, { color: theme.colors.financeAccent }]}>{formatRupees(expense.amount)}</Text>
        </View>
      </View>
      <View style={styles.centreFooter}>
        <StatusChip status={expense.type} tone="brand" dot={false} />
        <Button label={`Review ${expense.type}`} icon="Eye" variant="outline" size="sm" onPress={onReview} />
      </View>
    </Card>
  );
};

export interface Claim {
  id: string;
  claimant: string;
  employeeId: string;
  project: string;
  center: string;
  category: string;
  purpose: string;
  date: string;
  amount: number;
  billsCount: number;
  status: 'Approved' | 'Pending approval' | 'Settled';
  bankRef?: string;
}

/** Claim review overlay with audit timeline (web Staff Reimbursement). */
export const ClaimReviewSheet: React.FC<{
  claim: Claim | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSettle: (id: string) => void;
}> = ({ claim, visible, onClose, onApprove, onSettle }) => {
  const { theme } = useTheme();
  if (!claim) return null;
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Staff reimbursement"
      title={`${claim.id} · ${claim.claimant}`}
      description={`${claim.project} · ${claim.center}`}
      size="md"
      footer={
        <>
          {claim.status === 'Pending approval' ? <Button label="Approve Claim" icon="Check" variant="primary" onPress={() => onApprove(claim.id)} /> : null}
          {claim.status === 'Approved' ? <Button label="Disburse Settlement" icon="Coins" variant="emerald" onPress={() => onSettle(claim.id)} /> : null}
          <Button label="Close" variant="outline" onPress={onClose} />
        </>
      }
    >
      <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <Row label="Status" value={<StatusChip status={claim.status} />} />
        <Row label="Claim amount" value={<Text style={[styles.rowValue, { color: theme.colors.financeAccent }]}>{formatRupees(claim.amount)}</Text>} />
        <Row label="Category" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{claim.category}</Text>} />
        <Row label="Receipts attached" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{claim.billsCount} bills</Text>} />
        <Row label="Raised on" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDate(claim.date)}</Text>} />
        {claim.bankRef ? (
          <Row label="UTR" value={<Text style={[styles.rowValue, { color: theme.colors.successText }]}>{claim.bankRef}</Text>} />
        ) : null}
      </View>
      <Text style={[styles.purpose, { color: theme.colors.textMuted }]}>{claim.purpose}</Text>
      <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Claim Audit</Text>
      <Timeline
        accent={theme.colors.financeAccent}
        items={[
          { key: '1', title: 'Claim submitted', actor: `${claim.claimant} (${claim.employeeId})`, detail: `${claim.billsCount} bills · ${claim.category}`, time: formatDate(claim.date) },
          { key: '2', title: 'Project verification', actor: 'Project Manager', detail: 'Bills matched against advance utilization' },
          claim.status === 'Settled'
            ? { key: '3', title: 'Disbursed to bank account', actor: 'Finance Disbursement Desk', detail: `UTR ${claim.bankRef ?? '—'}`, color: theme.colors.emerald }
            : { key: '3', title: claim.status === 'Approved' ? 'Approved for payout' : 'Awaiting finance verification', actor: 'Finance Desk', color: theme.colors.warning },
        ]}
      />
    </ModalSheet>
  );
};

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      {value}
    </View>
  );
};

/** Stacked claim card (<1024px). */
export const ClaimMobileCard: React.FC<{ claim: Claim; onView: () => void }> = ({ claim, onView }) => {
  const { theme } = useTheme();
  return (
    <Card padding={14} style={styles.mobileCard}>
      <View style={styles.mobileTop}>
        <View style={styles.mobileBody}>
          <Text style={[styles.mobileName, { color: theme.colors.text }]}>{claim.claimant}</Text>
          <Text style={[styles.mobileSub, { color: theme.colors.brandPrimary }]}>{claim.id} · {formatDate(claim.date)}</Text>
          <Text style={[styles.mobileSub, { color: theme.colors.textSubtle }]} numberOfLines={2}>{claim.purpose}</Text>
        </View>
        <View style={styles.mobileRight}>
          <StatusChip status={claim.status} />
          <Text style={[styles.mobileAmount, { color: theme.colors.financeAccent }]}>{formatRupees(claim.amount)}</Text>
        </View>
      </View>
      <View style={styles.mobileFooter}>
        <Text style={[styles.mobileMeta, { color: theme.colors.textSubtle }]}>
          {claim.category} · {claim.billsCount} receipts
        </Text>
        <Pressable onPress={onView} accessibilityRole="button" style={styles.viewBtn}>
          <Text style={[styles.viewBtnText, { color: theme.colors.financeAccent }]}>View</Text>
          <Icon name="ArrowRight" size={13} color={theme.colors.financeAccent} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  centreCard: { gap: 12 },
  centreTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  centreTitleCol: { flex: 1, minWidth: 0 },
  centreName: { fontSize: 14.5, fontWeight: '700' },
  centreSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  centreMeta: { fontSize: 11, marginTop: 2 },
  centreRight: { alignItems: 'flex-end', gap: 6 },
  centreAmount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  centreFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 11.5 },
  rowValue: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
  purpose: { fontSize: 12, lineHeight: 17 },
  auditTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
  mobileCard: { gap: 10 },
  mobileTop: { flexDirection: 'row', gap: 10 },
  mobileBody: { flex: 1, minWidth: 0, gap: 5 },
  mobileName: { fontSize: 13.5, fontWeight: '700' },
  mobileSub: { fontSize: 11, marginTop: 1 },
  mobileRight: { alignItems: 'flex-end', gap: 6 },
  mobileAmount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  mobileFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileMeta: { fontSize: 11 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewBtnText: { fontSize: 12, fontWeight: '600' },
});
