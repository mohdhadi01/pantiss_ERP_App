import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { financeAreas } from '../data';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface PaymentItem {
  id: string;
  type: 'Salary' | 'Vendor Invoice' | 'Expense Claim';
  beneficiary: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  approvedDate: string;
  status: 'Disbursed' | 'Ready for Release';
  utr?: string;
  areaId: string;
  project: string;
}

const initialPayments: PaymentItem[] = [
  { id: 'PAY-001', type: 'Vendor Invoice', beneficiary: 'Zenith Digital & Hardware Labs Pvt Ltd', bankName: 'Axis Bank', accountNumber: '•••• •••• 9201', amount: 148500, approvedDate: '2026-10-06', status: 'Ready for Release', areaId: 'skill-development', project: 'PMKVY 4.0 Odisha Skills' },
  { id: 'PAY-002', type: 'Salary', beneficiary: 'Subhashree Ray (State Project Manager)', bankName: 'HDFC Bank', accountNumber: '•••• •••• 1829', amount: 77500, approvedDate: '2026-10-05', status: 'Ready for Release', areaId: 'skill-development', project: 'PMKVY 4.0 Odisha Skills' },
  { id: 'PAY-003', type: 'Expense Claim', beneficiary: 'Sunita Majhi (Field Coordinator)', bankName: 'ICICI Bank', accountNumber: '•••• •••• 1928', amount: 14200, approvedDate: '2026-10-06', status: 'Ready for Release', areaId: 'livelihood', project: 'Samriddhi Livelihoods Programme' },
  { id: 'PAY-004', type: 'Vendor Invoice', beneficiary: 'Maa Tarini Rural Logistics Fleet', bankName: 'State Bank of India', accountNumber: '•••• •••• 8190', amount: 64200, approvedDate: '2026-10-02', status: 'Disbursed', utr: 'UTR-20261003-99124', areaId: 'livelihood', project: 'Samriddhi Livelihoods Programme' },
];

const HISTORY_COLUMNS: Array<DataColumn<PaymentItem>> = [
  { key: 'paidOn', label: 'Paid on', flex: 1.1 },
  { key: 'payment', label: 'Payment', flex: 2 },
  { key: 'amount', label: 'Amount', flex: 1.1, align: 'right' },
  { key: 'reference', label: 'Reference / receipt', flex: 1.5 },
  { key: 'view', label: '', flex: 0.6, align: 'right' },
];

export const PaymentsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [payments, setPayments] = useState(initialPayments);
  const [tab, setTab] = useState('topay');
  const [areaId, setAreaId] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [payItem, setPayItem] = useState<PaymentItem | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payRef, setPayRef] = useState('');
  const [detail, setDetail] = useState<PaymentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const toPay = useMemo(() => payments.filter((p) => p.status === 'Ready for Release'), [payments]);
  const history = useMemo(() => payments.filter((p) => p.status === 'Disbursed'), [payments]);

  const areas = useMemo(
    () =>
      financeAreas
        .map((area) => ({
          area,
          count: toPay.filter((p) => p.areaId === area.id).length,
          projects: Array.from(new Set(toPay.filter((p) => p.areaId === area.id).map((p) => p.project))),
        }))
        .filter((row) => row.count > 0 || toPay.length === 0),
    [toPay],
  );

  const scopedToPay = useMemo(
    () => toPay.filter((p) => (!project || p.project === project) && (!areaId || p.areaId === areaId)),
    [toPay, project, areaId],
  );

  const scopedTotal = scopedToPay.reduce((sum, p) => sum + p.amount, 0);

  const handleSavePayment = () => {
    if (!payItem || !payRef.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayments((prev) =>
      prev.map((p) => (p.id === payItem.id ? { ...p, status: 'Disbursed' as const, utr: payRef.trim(), approvedDate: payDate } : p)),
    );
    setPayOpen(false);
    setPayItem(null);
    setPayRef('');
  };

  const renderHistoryCell = (item: PaymentItem, col: DataColumn<PaymentItem>) => {
    switch (col.key) {
      case 'paidOn':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(item.approvedDate)}</Text>;
      case 'payment':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{item.beneficiary}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{item.type} · {item.id}</Text>
          </View>
        );
      case 'amount':
        return <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(item.amount)}</Text>;
      case 'reference':
        return <Text style={[styles.cellMain, { color: theme.colors.successText }]}>{item.utr}</Text>;
      case 'view':
        return (
          <Pressable
            onPress={() => {
              setDetail(item);
              setDetailOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`View payment ${item.id}`}
            style={styles.viewBtn}
          >
            <Text style={[styles.viewBtnText, { color: theme.colors.financeAccent }]}>View</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Payments</Text>
        <Text style={[styles.pageSub, { color: theme.colors.textMuted }]}>Pay approved requests or look up a previous payment.</Text>
      </View>

      <Tabs
        items={[
          { key: 'topay', label: 'To pay', icon: 'CreditCard', count: toPay.length },
          { key: 'history', label: 'Payment history', icon: 'History', count: history.length },
        ]}
        activeKey={tab}
        onChange={setTab}
        accent={theme.colors.financeAccent}
      />

      {tab === 'topay' ? (
        <View style={styles.section}>
          {!project && !areaId ? (
            <>
              <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Choose a thematic area</Text>
              <View style={[styles.grid, isMd && styles.gridWide]}>
                {areas.map(({ area, count }) => (
                  <Pressable
                    key={area.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setAreaId(area.id);
                    }}
                  >
                    <Card padding={16} style={styles.scopeCard}>
                      <View style={styles.scopeTop}>
                        <View style={[styles.scopeTile, { backgroundColor: `${area.color}1A` }]}>
                          <Text style={[styles.scopeTileText, { color: area.color }]}>{area.name.charAt(0)}</Text>
                        </View>
                        <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>{area.name}</Text>
                      </View>
                      <Text style={[styles.scopeMeta, { color: theme.colors.textSubtle }]}>{count} to pay</Text>
                    </Card>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {areaId && !project ? (
            <>
              <Pressable onPress={() => setAreaId(null)} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
                <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>All thematic areas</Text>
              </Pressable>
              <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Choose a project</Text>
              <View style={[styles.grid, isMd && styles.gridWide]}>
                {(areas.find((row) => row.area.id === areaId)?.projects ?? []).map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setProject(name);
                    }}
                  >
                    <Card padding={16} style={styles.scopeCard}>
                      <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>{name}</Text>
                      <Text style={[styles.scopeMeta, { color: theme.colors.textSubtle }]}>
                        {toPay.filter((p) => p.project === name).length} to pay
                      </Text>
                    </Card>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {project ? (
            <>
              <Pressable onPress={() => setProject(null)} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
                <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>Back to {areaId ? financeAreas.find((a) => a.id === areaId)?.name : 'projects'}</Text>
              </Pressable>
              <View style={styles.queueHeader}>
                <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
                  {scopedToPay.length} payment{scopedToPay.length === 1 ? '' : 's'} · {formatRupees(scopedTotal)}
                </Text>
                <Button
                  label="Release batch"
                  icon="Send"
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    setPayments((prev) =>
                      prev.map((p) => (p.status === 'Ready for Release' ? { ...p, status: 'Disbursed' as const, utr: `BATCH-UTR-${Date.now().toString().slice(-6)}` } : p)),
                    );
                  }}
                />
              </View>
              {scopedToPay.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Nothing left to pay for this project.</Text>
              ) : (
                <View style={styles.list}>
                  {scopedToPay.map((item) => (
                    <Card key={item.id} padding={16} style={styles.payCard}>
                      <View style={styles.payTop}>
                        <View style={styles.payBody}>
                          <Text style={[styles.payee, { color: theme.colors.text }]}>{item.beneficiary}</Text>
                          <Text style={[styles.payMeta, { color: theme.colors.textSubtle }]}>
                            {item.type} · {item.bankName} {item.accountNumber} · Approved {formatDate(item.approvedDate)}
                          </Text>
                        </View>
                        <Text style={[styles.amountText, { color: theme.colors.financeAccent }]}>{formatRupees(item.amount)}</Text>
                      </View>
                      <View style={styles.payFooter}>
                        <StatusChip status={item.type} tone="brand" dot={false} />
                        <Button
                          label="Record payment"
                          icon="CheckCircle"
                          variant="emerald"
                          size="sm"
                          onPress={() => {
                            setPayItem(item);
                            setPayRef(`UTR-${Date.now().toString().slice(-8)}`);
                            setPayOpen(true);
                          }}
                        />
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>
      ) : (
        <SectionCard title="Payment history" description="Recorded bank payments with receipts and UTR references.">
          <DataTable
            columns={HISTORY_COLUMNS}
            rows={history}
            keyExtractor={(item) => item.id}
            renderCell={renderHistoryCell}
            renderMobileCard={(item) => (
              <Card padding={14} style={styles.historyCard}>
                <View style={styles.payTop}>
                  <View style={styles.payBody}>
                    <Text style={[styles.cellMain, { color: theme.colors.text }]}>{item.beneficiary}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{item.type} · Paid {formatDate(item.approvedDate)}</Text>
                  </View>
                  <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(item.amount)}</Text>
                </View>
                <View style={styles.historyFooter}>
                  <Text style={[styles.cellMain, { color: theme.colors.successText }]}>{item.utr}</Text>
                  <Pressable
                    onPress={() => {
                      setDetail(item);
                      setDetailOpen(true);
                    }}
                    style={styles.viewBtn}
                  >
                    <Text style={[styles.viewBtnText, { color: theme.colors.financeAccent }]}>View</Text>
                  </Pressable>
                </View>
              </Card>
            )}
            emptyIcon="History"
            emptyTitle="No payments yet"
            emptyDescription="Recorded payments will appear here with their bank references."
          />
        </SectionCard>
      )}

      <ModalSheet
        visible={payOpen && Boolean(payItem)}
        onClose={() => setPayOpen(false)}
        label="Disbursement desk"
        title="Record Payment"
        size="sm"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setPayOpen(false)} />
            <Button label="Save payment record" variant="emerald" onPress={handleSavePayment} />
          </>
        }
      >
        {payItem ? (
          <>
            <View style={[styles.amountPanel, { backgroundColor: theme.colors.financeAccentSoft }]}>
              <Text style={[styles.amountPanelPayee, { color: theme.colors.text }]}>{payItem.beneficiary}</Text>
              <Text style={[styles.amountPanelValue, { color: theme.colors.financeAccent }]}>{formatRupees(payItem.amount)}</Text>
              <Text style={[styles.amountPanelMeta, { color: theme.colors.textMuted }]}>
                {payItem.type} · {payItem.bankName} {payItem.accountNumber}
              </Text>
            </View>
            <Text style={[styles.note, { color: theme.colors.warningText }]}>
              Record an existing bank payment. This form does not transfer money.
            </Text>
            <TextField label="Payment date" value={payDate} onChangeText={setPayDate} placeholder="YYYY-MM-DD" />
            <TextField label="Bank reference / UTR" value={payRef} onChangeText={setPayRef} placeholder="e.g. UTR-20261028-0912" />
          </>
        ) : null}
      </ModalSheet>

      <ModalSheet
        visible={detailOpen && Boolean(detail)}
        onClose={() => setDetailOpen(false)}
        label="Payment history"
        title={detail ? `${detail.id} · ${detail.beneficiary}` : ''}
        size="md"
        footer={<Button label="Close" variant="outline" onPress={() => setDetailOpen(false)} />}
      >
        {detail ? (
          <>
            <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <DetailRow label="Payee" value={detail.beneficiary} />
              <DetailRow label="Type" value={detail.type} />
              <DetailRow label="Bank" value={`${detail.bankName} · ${detail.accountNumber}`} />
              <DetailRow label="Amount" value={formatRupees(detail.amount)} />
              <DetailRow label="Paid on" value={formatDate(detail.approvedDate)} />
              <DetailRow label="Reference / receipt" value={detail.utr ?? '—'} />
            </View>
            <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Activity</Text>
            <Timeline
              accent={theme.colors.financeAccent}
              items={[
                { key: '1', title: 'Payment approved', actor: 'Finance Manager', detail: `${detail.type} cleared for release`, time: formatDate(detail.approvedDate) },
                { key: '2', title: 'Bank payment recorded', actor: 'Disbursement Desk', detail: `UTR ${detail.utr ?? '—'}`, color: theme.colors.emerald },
              ]}
            />
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 },
  pageSub: { fontSize: 12.5, marginTop: 3 },
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  scopeCard: { flexGrow: 1, flexBasis: 220, gap: 8 },
  scopeTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scopeTile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scopeTileText: { fontSize: 15, fontWeight: '700' },
  scopeName: { fontSize: 13.5, fontWeight: '600', flexShrink: 1 },
  scopeMeta: { fontSize: 11 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  backBtnText: { fontSize: 12.5, fontWeight: '600' },
  queueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  list: { gap: 12 },
  payCard: { gap: 12 },
  payTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  payBody: { flex: 1, minWidth: 0 },
  payee: { fontSize: 14, fontWeight: '700' },
  payMeta: { fontSize: 11, marginTop: 3 },
  payFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  historyCard: { gap: 10 },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  viewBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  viewBtnText: { fontSize: 12, fontWeight: '600' },
  amountPanel: { borderRadius: 14, padding: 16, gap: 4 },
  amountPanelPayee: { fontSize: 13.5, fontWeight: '700' },
  amountPanelValue: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  amountPanelMeta: { fontSize: 11.5 },
  note: { fontSize: 11.5, fontWeight: '600', lineHeight: 16 },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 9 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { fontSize: 11.5 },
  detailValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  detailTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
});
