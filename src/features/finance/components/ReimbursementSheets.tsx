import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import {
  CentreExpense,
  EmployeeBill,
  BillStatus,
  SheetStat,
  billsForCenterMonth,
  expenseDocuments,
  expenseIcon,
  expenseColor,
} from './ReimbursementParts';

const CHECK_LINES = [
  'Tour approval and travel dates matched',
  'Original bill copies attached',
  'Eligibility checked against TA/DA policy',
  'Duplicate claim check completed',
];

const billTone = (status: BillStatus) =>
  status === 'Approved' ? 'success' : status === 'Verified' ? 'info' : status === 'Query raised' ? 'warning' : 'neutral';

export const TaDaReviewSheet: React.FC<{
  expense: CentreExpense | null;
  visible: boolean;
  onClose: () => void;
}> = ({ expense, visible, onClose }) => {
  const { theme } = useTheme();
  const source = expense ? billsForCenterMonth(expense.centerId, expense.month) : [];
  const [bills, setBills] = useState<EmployeeBill[]>(source);
  const [selectedId, setSelectedId] = useState(source[0]?.id ?? '');
  const [seed, setSeed] = useState(expense?.id ?? '');
  if (expense && expense.id !== seed) {
    setSeed(expense.id);
    setBills(billsForCenterMonth(expense.centerId, expense.month));
    setSelectedId(billsForCenterMonth(expense.centerId, expense.month)[0]?.id ?? '');
  }
  if (!expense) return null;

  const selectedBill = bills.find((bill) => bill.id === selectedId) ?? bills[0];
  const claimedTotal = bills.reduce((sum, bill) => sum + bill.claimed, 0);
  const eligibleTotal = bills.reduce((sum, bill) => sum + bill.eligible, 0);

  const updateStatus = (status: BillStatus) => {
    if (!selectedBill) return;
    setBills((current) => current.map((bill) => (bill.id === selectedBill.id ? { ...bill, status } : bill)));
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label={`TA/DA bill verification · ${expense.month}`}
      title="Employee travel claims"
      description={`${expense.project} · ${expense.center}`}
      size="lg"
      footer={
        <View style={styles.footer}>
          <Button label="Close" variant="outline" size="sm" onPress={onClose} />
          <Button label="Raise query" variant="outline" size="sm" disabled={!selectedBill || selectedBill.status === 'Approved'} onPress={() => updateStatus('Query raised')} />
          {selectedBill && (selectedBill.status === 'Verified' || selectedBill.status === 'Approved') ? (
            <Button
              label={selectedBill.status === 'Approved' ? 'Approved' : 'Approve bill'}
              icon="CheckCircle2"
              variant="emerald"
              size="sm"
              disabled={selectedBill.status === 'Approved'}
              onPress={() => updateStatus('Approved')}
            />
          ) : (
            <Button label="Verify bill" icon="ShieldCheck" variant="primary" size="sm" disabled={!selectedBill} onPress={() => updateStatus('Verified')} />
          )}
        </View>
      }
    >
      <View style={styles.statRow}>
        <SheetStat label="Employee bills" value={String(bills.length)} />
        <SheetStat label="Claimed" value={formatRupees(claimedTotal)} />
        <SheetStat label="Eligible after check" value={formatRupees(eligibleTotal)} />
        <SheetStat label="Approved" value={String(bills.filter((bill) => bill.status === 'Approved').length)} />
      </View>

      <View style={styles.billList}>
        {bills.map((bill) => (
          <Pressable
            key={bill.id}
            onPress={() => setSelectedId(bill.id)}
            accessibilityRole="button"
            style={[styles.billRow, { borderColor: bill.id === selectedBill?.id ? '#7c3aed' : theme.colors.border, backgroundColor: bill.id === selectedBill?.id ? 'rgba(124, 58, 237, 0.05)' : 'transparent' }]}
          >
            <View style={[styles.billAvatar, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}>
              <Icon name="UserRound" size={14} color={theme.isDark ? '#c084fc' : '#7c3aed'} />
            </View>
            <View style={styles.billBody}>
              <Text style={[styles.billName, { color: theme.colors.text }]}>{bill.employee}</Text>
              <Text style={[styles.billSub, { color: theme.colors.textSubtle }]}>{bill.employeeId} · {bill.designation}</Text>
              <Text style={[styles.billSub, { color: theme.colors.textMuted }]}>{bill.route} · {bill.travelDate}</Text>
            </View>
            <View style={styles.billRight}>
              <Text style={[styles.billAmount, { color: theme.colors.text }]}>{formatRupees(bill.claimed)}</Text>
              <Text style={[styles.billEligible, { color: theme.colors.textSubtle }]}>Eligible {formatRupees(bill.eligible)}</Text>
              <StatusChip status={bill.status} tone={billTone(bill.status)} dot={false} />
              <Text style={[styles.reviewBills, { color: theme.colors.textMuted }]}>Review bills</Text>
            </View>
          </Pressable>
        ))}
        {bills.length === 0 ? (
          <Text style={[styles.emptyBills, { color: theme.colors.textSubtle }]}>No employee bills for this month.</Text>
        ) : null}
      </View>

      {selectedBill ? (
        <View style={[styles.detailPanel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSoft }]}>
          <View style={styles.detailHead}>
            <View style={styles.detailHeadText}>
              <Text style={[styles.detailId, { color: '#7c3aed' }]}>{selectedBill.id}</Text>
              <Text style={[styles.detailName, { color: theme.colors.text }]}>{selectedBill.employee}</Text>
              <Text style={[styles.billSub, { color: theme.colors.textSubtle }]}>{selectedBill.purpose}</Text>
            </View>
            <Icon name="Receipt" size={19} color="#7c3aed" />
          </View>
          <View style={styles.detailGrid}>
            <MiniSpec label="Route" value={selectedBill.route} />
            <MiniSpec label="Travel date" value={selectedBill.travelDate} />
            <MiniSpec label="Claimed" value={formatRupees(selectedBill.claimed)} />
            <MiniSpec label="Eligible" value={formatRupees(selectedBill.eligible)} />
          </View>
          <View style={styles.docHead}>
            <Text style={[styles.docTitle, { color: theme.colors.text }]}>Uploaded bills</Text>
            <Text style={[styles.docCount, { color: theme.colors.textSubtle }]}>{selectedBill.documents.length} files</Text>
          </View>
          {selectedBill.documents.map((document) => (
            <View key={document.name} style={[styles.docRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}>
              <Icon name="FileText" size={14} color={theme.colors.dangerText} />
              <View style={styles.docBody}>
                <Text numberOfLines={1} style={[styles.docName, { color: theme.colors.text }]}>{document.name}</Text>
                <Text style={[styles.docMeta, { color: theme.colors.textSubtle }]}>{document.kind} · {document.size}</Text>
              </View>
              <Icon name="Eye" size={13} color={theme.colors.textSubtle} />
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.checklist, { borderColor: theme.colors.border }]}>
        <View style={styles.checklistHead}>
          <Icon name="ShieldCheck" size={15} color={theme.colors.emerald} />
          <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>ERP verification checklist</Text>
        </View>
        {CHECK_LINES.map((line) => (
          <Text key={line} style={[styles.checkLine, { color: theme.colors.textMuted }]}>✓ {line}</Text>
        ))}
      </View>
    </ModalSheet>
  );
};

const MiniSpec: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.miniSpec, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={[styles.miniSpecLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.miniSpecValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

export const ExpenseBillReviewSheet: React.FC<{
  expense: CentreExpense | null;
  visible: boolean;
  onClose: () => void;
}> = ({ expense, visible, onClose }) => {
  const { theme } = useTheme();
  const [reviewStatus, setReviewStatus] = useState<BillStatus>('Submitted');
  const [seed, setSeed] = useState(expense?.id ?? '');
  if (expense && expense.id !== seed) {
    setSeed(expense.id);
    setReviewStatus('Submitted');
  }
  const documents =
    expense && expense.type !== 'TA/DA' ? expenseDocuments(expense.type, expense) : [];
  const [activeName, setActiveName] = useState(documents[0]?.name ?? '');
  const activeDocument = documents.find((document) => document.name === activeName) ?? documents[0];
  if (!expense || expense.type === 'TA/DA') return null;
  const vendor =
    expense.type === 'Rental'
      ? 'Center Premises Owner'
      : expense.type === 'Food'
        ? 'Approved Catering Partner'
        : 'State Electricity Distribution Company';
  const color = expenseColor[expense.type];

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label={`${expense.type} bill review · ${expense.month}`}
      title={`${expense.center} — ${expense.type}`}
      description={`${expense.project} · ${expense.id} · Submitted ${expense.submitted}`}
      size="lg"
      footer={
        <View style={styles.footer}>
          <View style={styles.footerStatus}>
            <Text style={[styles.footerStatusLabel, { color: theme.colors.textSubtle }]}>Review status</Text>
            <Text style={[styles.footerStatusValue, { color: theme.colors.text }]}>{reviewStatus}</Text>
          </View>
          <Button label="Raise query" variant="outline" size="sm" onPress={() => setReviewStatus('Query raised')} />
          {reviewStatus === 'Verified' || reviewStatus === 'Approved' ? (
            <Button
              label={reviewStatus === 'Approved' ? 'Bill approved' : 'Approve bill'}
              icon="CheckCircle2"
              variant="emerald"
              size="sm"
              disabled={reviewStatus === 'Approved'}
              onPress={() => setReviewStatus('Approved')}
            />
          ) : (
            <Button label="Verify documents" icon="ShieldCheck" variant="primary" size="sm" onPress={() => setReviewStatus('Verified')} />
          )}
        </View>
      }
    >
      <View style={styles.statRow}>
        <SheetStat label="Submitted amount" value={formatRupees(expense.amount)} />
        <SheetStat label="Bill period" value={expense.month} />
        <SheetStat label="Uploaded files" value={String(documents.length)} />
        <SheetStat label="Current status" value={reviewStatus} />
      </View>

      <View style={styles.docHead}>
        <View style={[styles.typeTile, { backgroundColor: `${color}1A` }]}>
          <Icon name={expenseIcon[expense.type]} size={16} color={color} strokeWidth={1.8} />
        </View>
        <View style={styles.docHeadText}>
          <Text style={[styles.docTitle, { color: theme.colors.text }]}>Uploaded bills</Text>
          <Text style={[styles.docCount, { color: theme.colors.textSubtle }]}>Select a file to inspect it</Text>
        </View>
      </View>
      {documents.map((document) => (
        <Pressable
          key={document.name}
          onPress={() => setActiveName(document.name)}
          accessibilityRole="button"
          style={[styles.docRow, { borderColor: document.name === activeDocument?.name ? theme.colors.brandPrimary : theme.colors.border, backgroundColor: theme.colors.surfaceSoft }]}
        >
          <Icon name="Receipt" size={14} color={theme.colors.dangerText} />
          <View style={styles.docBody}>
            <Text numberOfLines={1} style={[styles.docName, { color: theme.colors.text }]}>{document.kind}</Text>
            <Text numberOfLines={1} style={[styles.docMeta, { color: theme.colors.textSubtle }]}>{document.name}</Text>
          </View>
          <Icon name="Eye" size={13} color={theme.colors.textSubtle} />
        </Pressable>
      ))}

      {activeDocument ? (
        <View style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}>
          <View style={styles.previewHead}>
            <View style={styles.previewHeadText}>
              <Text style={[styles.previewBrand, { color: theme.colors.dangerText }]}>Pantiss Foundation</Text>
              <Text style={[styles.docMeta, { color: theme.colors.textSubtle }]}>Center expense verification</Text>
            </View>
            <StatusChip status="Uploaded" tone="emerald" dot={false} />
          </View>
          <View style={styles.previewCenter}>
            <Text style={[styles.previewKind, { color: theme.colors.textSubtle }]}>{activeDocument.kind}</Text>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>{expense.type} Bill</Text>
            <Text style={[styles.docMeta, { color: theme.colors.textSubtle }]}>{expense.month}</Text>
          </View>
          <View style={styles.previewGrid}>
            <MiniSpec label="Bill reference" value={activeDocument.reference} />
            <MiniSpec label="Vendor" value={vendor} />
            <MiniSpec label="Project" value={expense.project} />
            <MiniSpec label="Center" value={expense.center} />
          </View>
          <View style={[styles.previewAmount, { backgroundColor: theme.colors.surfaceSoft }]}>
            <View>
              <Text style={[styles.miniSpecLabel, { color: theme.colors.textSubtle }]}>Submitted amount</Text>
              <Text style={[styles.previewAmountValue, { color: theme.colors.text }]}>{formatRupees(expense.amount)}</Text>
            </View>
            <Text style={[styles.docMeta, { color: theme.colors.textSubtle }]}>Uploaded {activeDocument.uploaded}{'\n'}{activeDocument.size}</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.checklist, { borderColor: theme.colors.border }]}>
        <View style={styles.checklistHead}>
          <Icon name="ShieldCheck" size={15} color={theme.colors.emerald} />
          <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>Verification checklist</Text>
        </View>
        {['Bill period matches request', 'Vendor and project mapping checked', 'Amount agrees with supporting record', 'Duplicate payment check completed'].map((line) => (
          <Text key={line} style={[styles.checkLine, { color: theme.colors.textMuted }]}>✓ {line}</Text>
        ))}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  footerStatus: { flex: 1, minWidth: 0 },
  footerStatusLabel: { fontSize: 9.5 },
  footerStatusValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  billList: { gap: 10 },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  billAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  billBody: { flex: 1, minWidth: 0, gap: 2 },
  billName: { fontSize: 12.5, fontWeight: '700' },
  billSub: { fontSize: 10 },
  billRight: { alignItems: 'flex-end', gap: 4 },
  billAmount: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  billEligible: { fontSize: 9.5 },
  reviewBills: { fontSize: 9, fontWeight: '600', textDecorationLine: 'underline' },
  emptyBills: { fontSize: 12, textAlign: 'center', paddingVertical: 18 },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  detailHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  detailHeadText: { flex: 1, minWidth: 0 },
  detailId: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  detailName: { fontSize: 14.5, fontWeight: '700', marginTop: 4 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  miniSpec: { flexGrow: 1, flexBasis: '45%', minWidth: 110, borderRadius: 10, padding: 10, gap: 3 },
  miniSpecLabel: { fontSize: 9 },
  miniSpecValue: { fontSize: 11, fontWeight: '700' },
  docHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docHeadText: { flex: 1, minWidth: 0 },
  typeTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 12.5, fontWeight: '700' },
  docCount: { fontSize: 10 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  docBody: { flex: 1, minWidth: 0 },
  docName: { fontSize: 11, fontWeight: '600' },
  docMeta: { fontSize: 9.5, marginTop: 1 },
  checklist: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  checklistHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  checklistTitle: { fontSize: 12.5, fontWeight: '700' },
  checkLine: { fontSize: 11, lineHeight: 16 },
  preview: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 14 },
  previewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(128, 144, 168, 0.16)', paddingBottom: 12 },
  previewHeadText: { flex: 1, minWidth: 0 },
  previewBrand: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  previewCenter: { alignItems: 'center', gap: 4 },
  previewKind: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  previewTitle: { fontSize: 20, fontWeight: '700' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  previewAmount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderRadius: 10, padding: 14 },
  previewAmountValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: 4 },
});
