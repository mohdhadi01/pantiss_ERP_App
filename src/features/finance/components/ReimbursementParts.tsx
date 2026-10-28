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

// ─── Web-aligned centre expense model (FinanceOperationsViews.tsx:307-343) ────
export type ExpenseType = 'Rental' | 'Food' | 'Electricity' | 'TA/DA';
export type BillStatus = 'Submitted' | 'Verified' | 'Approved' | 'Query raised';

export interface BillDocument {
  name: string;
  kind: string;
  size: string;
}

export interface EmployeeBill {
  id: string;
  employee: string;
  employeeId: string;
  designation: string;
  travelDate: string;
  route: string;
  purpose: string;
  claimed: number;
  eligible: number;
  status: BillStatus;
  documents: BillDocument[];
}

export interface CentreExpense {
  id: string;
  center: string;
  centerId: string;
  project: string;
  month: string;
  type: ExpenseType;
  amount: number;
  submitted: string;
  documents: number;
  status: 'Ready' | 'Clarification';
}

export const EXPENSE_TYPES: ExpenseType[] = ['Rental', 'Food', 'Electricity', 'TA/DA'];

export const expenseIcon: Record<ExpenseType, string> = {
  Rental: 'Building2',
  Food: 'Salad',
  Electricity: 'Lightbulb',
  'TA/DA': 'MapPin',
};

export const expenseColor: Record<ExpenseType, string> = {
  Rental: '#2563eb',
  Food: '#ea580c',
  Electricity: '#d97706',
  'TA/DA': '#7c3aed',
};

/** Employee TA/DA bills (web taDaEmployeeBills, amounts converted to rupees). */
export const TADA_BILLS: EmployeeBill[] = [
  { id: 'TADA-2681', employee: 'Ananya Mishra', employeeId: 'EMP-0142', designation: 'Center Manager', travelDate: '22 Jul 2026', route: 'Angul – Bhubaneswar', purpose: 'Monthly project review', claimed: 18000, eligible: 17000, status: 'Submitted', documents: [{ name: 'train-ticket-2207.pdf', kind: 'Travel ticket', size: '428 KB' }, { name: 'hotel-invoice-2207.pdf', kind: 'Accommodation', size: '612 KB' }, { name: 'travel-claim-form.pdf', kind: 'Signed claim', size: '284 KB' }] },
  { id: 'TADA-2678', employee: 'Rahul Behera', employeeId: 'EMP-0198', designation: 'Mobilization Officer', travelDate: '18 Jul 2026', route: 'Angul – Chhendipada', purpose: 'Candidate mobilization camp', claimed: 12000, eligible: 12000, status: 'Verified', documents: [{ name: 'bus-tickets-july.pdf', kind: 'Travel tickets', size: '318 KB' }, { name: 'field-visit-approval.pdf', kind: 'Tour approval', size: '196 KB' }] },
  { id: 'TADA-2669', employee: 'Priyanka Sahu', employeeId: 'EMP-0231', designation: 'Placement Officer', travelDate: '11 Jul 2026', route: 'Angul – Cuttack', purpose: 'Employer partnership meeting', claimed: 21000, eligible: 19000, status: 'Query raised', documents: [{ name: 'cab-invoice-1107.pdf', kind: 'Travel invoice', size: '355 KB' }, { name: 'meeting-approval.pdf', kind: 'Tour approval', size: '174 KB' }] },
  { id: 'TADA-2704', employee: 'Sourav Das', employeeId: 'EMP-0108', designation: 'Technical Trainer', travelDate: '02 Aug 2026', route: 'Bhubaneswar – Puri', purpose: 'Industry exposure visit', claimed: 24000, eligible: 24000, status: 'Submitted', documents: [{ name: 'vehicle-hire-invoice.pdf', kind: 'Travel invoice', size: '540 KB' }, { name: 'visit-sanction.pdf', kind: 'Tour approval', size: '205 KB' }] },
  { id: 'TADA-2701', employee: 'Neha Pattnaik', employeeId: 'EMP-0216', designation: 'MIS Executive', travelDate: '01 Aug 2026', route: 'Bhubaneswar – Khordha', purpose: 'Center data verification', claimed: 11000, eligible: 11000, status: 'Verified', documents: [{ name: 'bus-ticket-0108.pdf', kind: 'Travel ticket', size: '188 KB' }, { name: 'field-order.pdf', kind: 'Tour approval', size: '164 KB' }] },
  { id: 'TADA-2641', employee: 'Manas Ranjan', employeeId: 'EMP-0184', designation: 'Center Coordinator', travelDate: '20 Jul 2026', route: 'Keonjhar – Barbil', purpose: 'Training center inspection', claimed: 16000, eligible: 16000, status: 'Submitted', documents: [{ name: 'travel-voucher.pdf', kind: 'Travel voucher', size: '326 KB' }, { name: 'inspection-order.pdf', kind: 'Tour approval', size: '214 KB' }] },
  { id: 'TADA-2618', employee: 'Ritika Sharma', employeeId: 'EMP-0166', designation: 'Programme Officer', travelDate: '15 Jul 2026', route: 'Dibrugarh – Tinsukia', purpose: 'Mobile clinic supervision', claimed: 26000, eligible: 23000, status: 'Submitted', documents: [{ name: 'taxi-invoice.pdf', kind: 'Travel invoice', size: '462 KB' }, { name: 'daily-allowance-form.pdf', kind: 'DA claim', size: '248 KB' }] },
  { id: 'TADA-2594', employee: 'Abhishek Kumar', employeeId: 'EMP-0254', designation: 'Enterprise Mentor', travelDate: '09 Jul 2026', route: 'Ranchi – Khunti', purpose: 'Entrepreneur mentoring visit', claimed: 14000, eligible: 14000, status: 'Approved', documents: [{ name: 'bus-ticket.pdf', kind: 'Travel ticket', size: '182 KB' }, { name: 'tour-diary.pdf', kind: 'Tour diary', size: '296 KB' }] },
];

export const billsForCenterMonth = (centerId: string, month: string): EmployeeBill[] => {
  const map: Record<string, string[]> = {
    'CEN-ANG-01|July 2026': ['TADA-2681', 'TADA-2678', 'TADA-2669'],
    'CEN-BBS-02|August 2026': ['TADA-2704', 'TADA-2701'],
    'CEN-KEO-01|July 2026': ['TADA-2641'],
    'CEN-DIB-01|July 2026': ['TADA-2618'],
    'CEN-RAN-01|July 2026': ['TADA-2594'],
  };
  const ids = map[`${centerId}|${month}`] ?? [];
  return TADA_BILLS.filter((bill) => ids.includes(bill.id));
};

/** Non-TA/DA supporting documents (web getCenterBillDocuments). */
export const expenseDocuments = (type: Exclude<ExpenseType, 'TA/DA'>, request: CentreExpense): Array<BillDocument & { reference: string; uploaded: string }> => {
  const period = request.month.toLowerCase().replace(' ', '-');
  const documents: Record<Exclude<ExpenseType, 'TA/DA'>, Array<BillDocument & { reference: string; uploaded: string }>> = {
    Rental: [
      { name: `rent-invoice-${period}.pdf`, kind: 'Monthly rent invoice', reference: `RNT/${request.id.slice(-4)}`, uploaded: request.submitted, size: '486 KB' },
      { name: 'registered-lease-agreement.pdf', kind: 'Lease agreement', reference: 'LEASE/2026/041', uploaded: '05 Apr 2026', size: '1.8 MB' },
      { name: 'landlord-bank-and-pan.pdf', kind: 'Vendor KYC and bank proof', reference: 'KYC/VND/118', uploaded: '05 Apr 2026', size: '642 KB' },
    ],
    Food: [
      { name: `food-vendor-invoice-${period}.pdf`, kind: 'Food vendor invoice', reference: `FD/${request.id.slice(-4)}`, uploaded: request.submitted, size: '728 KB' },
      { name: 'trainee-meal-attendance.xlsx', kind: 'Meal attendance register', reference: 'ATT/MEAL/0726', uploaded: request.submitted, size: '214 KB' },
      { name: 'approved-menu-rate-card.pdf', kind: 'Approved menu and rate card', reference: 'RATE/FOOD/026', uploaded: '01 Jul 2026', size: '392 KB' },
      { name: 'food-delivery-challans.pdf', kind: 'Daily delivery challans', reference: 'DC/FOOD/0726', uploaded: request.submitted, size: '1.2 MB' },
    ],
    Electricity: [
      { name: `electricity-bill-${period}.pdf`, kind: 'Utility bill', reference: `ELEC/${request.id.slice(-4)}`, uploaded: request.submitted, size: '364 KB' },
      { name: 'meter-reading-photograph.jpg', kind: 'Meter reading evidence', reference: 'MTR/PHOTO/0726', uploaded: request.submitted, size: '1.1 MB' },
      { name: 'previous-payment-receipt.pdf', kind: 'Previous payment receipt', reference: 'ELEC/PAID/0626', uploaded: '08 Jul 2026', size: '284 KB' },
    ],
  };
  return documents[type];
};

/** Centre expense card — "{n} employee claims" for TA/DA, otherwise documents. */
export const CentreExpenseCard: React.FC<{ expense: CentreExpense; employeeCount: number; onReview: () => void }> = ({ expense, employeeCount, onReview }) => {
  const { theme } = useTheme();
  const color = expenseColor[expense.type];
  return (
    <Card padding={16} style={styles.centreCard}>
      <View style={styles.centreTop}>
        <View style={[styles.typeTile, { backgroundColor: `${color}1A` }]}>
          <Icon name={expenseIcon[expense.type]} size={17} color={color} strokeWidth={1.8} />
        </View>
        <View style={styles.centreTitleCol}>
          <Text style={[styles.centreName, { color: theme.colors.text }]}>{expense.type}</Text>
          <Text style={[styles.centreSub, { color: theme.colors.textSubtle }]}>{expense.month} · {expense.id}</Text>
          <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>{expense.center}</Text>
        </View>
        <View style={styles.centreRight}>
          <StatusChip status={expense.status} tone={expense.status === 'Ready' ? 'success' : 'warning'} />
          <Text style={[styles.centreAmount, { color: theme.colors.text }]}>{formatRupees(expense.amount)}</Text>
        </View>
      </View>
      <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>
        {expense.type === 'TA/DA'
          ? `${employeeCount} employee claims`
          : `${expense.documents} supporting documents`} · Submitted {expense.submitted}
      </Text>
      <Button
        label={expense.type === 'TA/DA' ? 'Review employee bills' : `Review ${expense.type}`}
        icon="Eye"
        variant="emerald"
        size="sm"
        onPress={onReview}
      />
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
  status: 'Pending Verification' | 'Finance Approved' | 'Disbursed';
  bankUtr?: string;
  payoutDate?: string;
}

/** Claim review overlay with audit timeline (web Review Claim Overlay). */
export const ClaimReviewSheet: React.FC<{
  claim: Claim | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDisburse: (id: string) => void;
}> = ({ claim, visible, onClose, onApprove, onDisburse }) => {
  const { theme } = useTheme();
  if (!claim) return null;
  const tone = claim.status === 'Disbursed' ? 'success' : claim.status === 'Finance Approved' ? 'info' : 'warning';
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Claim Audit"
      title={`Claim ${claim.id}`}
      description={`${claim.claimant} (${claim.employeeId}) · ${claim.project}`}
      size="md"
      footer={
        <View style={styles.sheetFooter}>
          <Button label="Close" variant="outline" size="sm" onPress={onClose} />
          {claim.status === 'Pending Verification' ? <Button label="Approve for Payout" icon="Check" variant="primary" size="sm" onPress={() => onApprove(claim.id)} /> : null}
          {claim.status === 'Finance Approved' ? <Button label="Disburse Reimbursement" icon="Coins" variant="emerald" size="sm" onPress={() => onDisburse(claim.id)} /> : null}
        </View>
      }
    >
      <View style={styles.statRow}>
        <SheetStat label="Claim Amount" value={formatRupees(claim.amount)} />
        <SheetStat label="Category" value={claim.category} />
        <SheetStat label="Status" value={claim.status} accent={theme.colors.successText} />
      </View>
      <View style={[styles.particulars, { borderColor: theme.colors.border }]}>
        <Text style={[styles.particularsTitle, { color: theme.colors.text }]}>Claim Particulars</Text>
        <Text style={[styles.particularsText, { color: theme.colors.textMuted }]}>{claim.purpose}</Text>
      </View>
      <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <Row label="Status" value={<StatusChip status={claim.status} tone={tone} />} />
        <Row label="Center" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{claim.center}</Text>} />
        <Row label="Receipts attached" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{claim.billsCount} bills</Text>} />
        <Row label="Raised on" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDate(claim.date)}</Text>} />
        {claim.bankUtr ? (
          <Row label="Bank UTR" value={<Text style={[styles.rowValue, { color: theme.colors.successText }]}>{claim.bankUtr}</Text>} />
        ) : null}
        {claim.payoutDate ? (
          <Row label="Paid on" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{claim.payoutDate}</Text>} />
        ) : null}
      </View>
      <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Claim Audit</Text>
      <Timeline
        accent={theme.colors.financeAccent}
        items={[
          { key: '1', title: 'Claim submitted', actor: `${claim.claimant} (${claim.employeeId})`, detail: `${claim.billsCount} bills · ${claim.category}`, time: formatDate(claim.date) },
          { key: '2', title: 'Project verification', actor: 'Reporting Manager', detail: 'Manager pre-clearance recorded for the claim' },
          claim.status === 'Disbursed'
            ? { key: '3', title: 'Disbursed to bank account', actor: 'Finance Disbursement Desk', detail: `Bank UTR ${claim.bankUtr ?? '—'}`, color: theme.colors.emerald }
            : claim.status === 'Finance Approved'
              ? { key: '3', title: 'Finance approved for payout', actor: 'Finance Desk', detail: 'Scheduled for the weekly Thursday NEFT batch', color: theme.colors.info }
              : { key: '3', title: 'Awaiting finance verification', actor: 'Finance Desk', detail: 'Voucher audit pending', color: theme.colors.warning },
        ]}
      />
    </ModalSheet>
  );
};

export const SheetStat: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.sheetStat, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.sheetStatLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.sheetStatValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
    </View>
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
          <StatusChip status={claim.status} tone={claim.status === 'Disbursed' ? 'success' : claim.status === 'Finance Approved' ? 'info' : 'warning'} />
          <Text style={[styles.mobileAmount, { color: theme.colors.financeAccent }]}>{formatRupees(claim.amount)}</Text>
        </View>
      </View>
      <View style={styles.mobileFooter}>
        <Text style={[styles.mobileMeta, { color: theme.colors.textSubtle }]}>
          {claim.category} · {claim.billsCount} bills
        </Text>
        <Pressable onPress={onView} accessibilityRole="button" style={styles.viewBtn}>
          <Text style={[styles.viewBtnText, { color: theme.colors.financeAccent }]}>Review Claim</Text>
          <Icon name="ArrowRight" size={13} color={theme.colors.financeAccent} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  centreCard: { gap: 12, flexGrow: 1, flexBasis: 240 },
  centreTop: { flexDirection: 'row', gap: 10 },
  typeTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  centreTitleCol: { flex: 1, minWidth: 0 },
  centreName: { fontSize: 14, fontWeight: '700' },
  centreSub: { fontSize: 11, marginTop: 2 },
  centreMeta: { fontSize: 11, marginTop: 2 },
  centreRight: { alignItems: 'flex-end', gap: 6 },
  centreAmount: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sheetFooter: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sheetStat: { flexGrow: 1, flexBasis: '30%', minWidth: 100, borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  sheetStatLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  sheetStatValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  particulars: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  particularsTitle: { fontSize: 12.5, fontWeight: '700' },
  particularsText: { fontSize: 12, lineHeight: 17 },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 11.5 },
  rowValue: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
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
