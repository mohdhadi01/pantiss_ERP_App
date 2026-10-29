import React, { useEffect, useMemo, useState } from 'react';
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
import { useSalaryRecords } from '../useSalaryRecords';
import {
  PaymentListRecord,
  buildPaymentHierarchy,
  buildUnifiedPaymentRecords,
  paymentHistory,
} from '../paymentHierarchy';

const HISTORY_COLUMNS: DataColumn<PaymentListRecord>[] = [
  { key: 'paidOn', label: 'Paid on', flex: 1.1 },
  { key: 'payment', label: 'Payment', flex: 2 },
  { key: 'amount', label: 'Amount', flex: 1.1, align: 'right' },
  { key: 'reference', label: 'Reference / receipt', flex: 1.5 },
  { key: 'view', label: '', flex: 0.6, align: 'right' },
];

export const PaymentsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { records: salaryRecords } = useSalaryRecords();

  const initialRecords = useMemo(() => buildUnifiedPaymentRecords(salaryRecords), [salaryRecords]);
  const [payments, setPayments] = useState<PaymentListRecord[]>(initialRecords);

  useEffect(() => {
    setPayments((prev) => {
      const live = buildUnifiedPaymentRecords(salaryRecords);
      const overrideMap = new Map(prev.map((p) => [p.id, p]));
      return live.map((rec) => overrideMap.get(rec.id) ?? rec);
    });
  }, [salaryRecords]);

  const [tab, setTab] = useState('topay');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const [payItem, setPayItem] = useState<PaymentListRecord | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payRef, setPayRef] = useState('');

  const [detail, setDetail] = useState<PaymentListRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [toPaySearch, setToPaySearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  const toPay = useMemo(() => payments.filter((p) => p.status === 'Approved'), [payments]);
  const history = useMemo(() => paymentHistory(payments), [payments]);

  const hierarchy = useMemo(() => buildPaymentHierarchy(payments, financeAreas), [payments]);

  const currentArea = useMemo(
    () => hierarchy.find((a) => a.name === selectedArea),
    [hierarchy, selectedArea],
  );

  const currentProject = useMemo(
    () => currentArea?.projects.find((p) => p.name === selectedProject),
    [currentArea, selectedProject],
  );

  const scopedToPay = useMemo(() => {
    let pool = currentProject?.records ?? currentArea?.projects.flatMap((p) => p.records) ?? payments;
    return pool.filter(
      (p) =>
        p.status === 'Approved' &&
        (!toPaySearch.trim() ||
          `${p.payee} ${p.title} ${p.project} ${p.source} ${p.id}`.toLowerCase().includes(toPaySearch.trim().toLowerCase())),
    );
  }, [currentProject, currentArea, payments, toPaySearch]);

  const scopedHistory = useMemo(() => {
    return history.filter(
      (p) =>
        !historySearch.trim() ||
        `${p.payee} ${p.project} ${p.title} ${p.reference ?? ''} ${p.id}`.toLowerCase().includes(historySearch.trim().toLowerCase()),
    );
  }, [history, historySearch]);

  const scopedTotal = scopedToPay.reduce((sum, p) => sum + p.amount, 0);

  const handleSavePayment = () => {
    if (!payItem || !payRef.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payItem.id
          ? {
              ...p,
              status: 'In progress' as const,
              reference: payRef.trim(),
              paidOn: payDate,
            }
          : p,
      ),
    );
    setPayOpen(false);
    setPayItem(null);
    setPayRef('');
  };

  const attachSlip = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'Payment slip uploaded' as const, paymentSlip: `payment-slip-${id}.pdf` } : p,
      ),
    );
  };

  const renderHistoryCell = (item: PaymentListRecord, col: DataColumn<PaymentListRecord>) => {
    switch (col.key) {
      case 'paidOn':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(item.paidOn || '2026-10-01')}</Text>;
      case 'payment':
        return (
          <View style={styles.paymentInfoCol}>
            <Text numberOfLines={1} style={[styles.cellMain, { color: theme.colors.text }]}>
              {item.payee}
            </Text>
            <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
              {item.title} · {item.project}
            </Text>
          </View>
        );
      case 'amount':
        return <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(item.amount)}</Text>;
      case 'reference':
        return (
          <View style={styles.referenceCell}>
            <Text style={[styles.cellMain, { color: theme.colors.successText }]}>{item.reference ?? 'Reference not recorded'}</Text>
            {item.status === 'Payment slip uploaded' ? (
              <StatusChip status="Payment slip uploaded" tone="success" dot={false} />
            ) : item.status === 'In progress' ? (
              <Pressable
                onPress={() => attachSlip(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Add payment slip for ${item.id}`}
                style={[styles.slipBtn, { borderColor: theme.colors.border }]}
              >
                <Icon name="Upload" size={11} color={theme.colors.financeAccent} />
                <Text style={[styles.slipBtnText, { color: theme.colors.financeAccent }]}>Add payment slip</Text>
              </Pressable>
            ) : (
              <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>Payment recorded</Text>
            )}
          </View>
        );
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
          {!selectedProject && !selectedArea ? (
            <>
              <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Choose a thematic area</Text>
              <View style={[styles.grid, isMd && styles.gridWide]}>
                {hierarchy.map((areaNode) => {
                  const areaDef = financeAreas.find((a) => a.name === areaNode.name);
                  const color = areaDef?.color ?? '#dc2626';
                  const pendingCount = areaNode.projects
                    .flatMap((p) => p.records)
                    .filter((r) => r.status === 'Approved').length;

                  return (
                    <Pressable
                      style={styles.scopeCardWrap}
                      key={areaNode.name}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedArea(areaNode.name);
                      }}
                    >
                      <Card padding={16} style={styles.scopeCard}>
                        <View style={styles.scopeTop}>
                          <View style={[styles.scopeTile, { backgroundColor: `${color}1A` }]}>
                            <Text style={[styles.scopeTileText, { color }]}>{areaNode.name.charAt(0)}</Text>
                          </View>
                          <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>
                            {areaNode.name}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.scopeMeta,
                            { color: pendingCount > 0 ? theme.colors.financeAccent : theme.colors.textSubtle },
                          ]}
                        >
                          {pendingCount > 0 ? `${pendingCount} to pay` : 'All payments recorded'}
                        </Text>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {selectedArea && !selectedProject ? (
            <>
              <Pressable onPress={() => setSelectedArea(null)} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
                <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>All thematic areas</Text>
              </Pressable>
              <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Choose a project</Text>
              <View style={[styles.grid, isMd && styles.gridWide]}>
                {(currentArea?.projects ?? []).map((pNode) => {
                  const prPending = pNode.records.filter((r) => r.status === 'Approved').length;
                  return (
                    <Pressable
                      style={styles.scopeCardWrap}
                      key={pNode.name}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedProject(pNode.name);
                      }}
                    >
                      <Card padding={16} style={styles.scopeCard}>
                        <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>
                          {pNode.name}
                        </Text>
                        <Text
                          style={[
                            styles.scopeMeta,
                            { color: prPending > 0 ? theme.colors.financeAccent : theme.colors.textSubtle },
                          ]}
                        >
                          {prPending > 0 ? `${prPending} to pay` : 'All payments recorded'}
                        </Text>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {selectedProject ? (
            <>
              <Pressable onPress={() => setSelectedProject(null)} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
                <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>Back to {selectedArea ?? 'projects'}</Text>
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
                      prev.map((p) =>
                        p.project === selectedProject && p.status === 'Approved'
                          ? { ...p, status: 'In progress' as const, reference: `BATCH-UTR-${Date.now().toString().slice(-6)}` }
                          : p,
                      ),
                    );
                  }}
                />
              </View>
              <TextField value={toPaySearch} onChangeText={setToPaySearch} placeholder="Search payee or title" />
              {scopedToPay.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    All payments recorded for this project.
                  </Text>
                  <Button
                    label="View payment history"
                    variant="outline"
                    size="sm"
                    icon="History"
                    onPress={() => {
                      setHistorySearch(selectedProject);
                      setTab('history');
                    }}
                  />
                </View>
              ) : (
                <View style={styles.list}>
                  {scopedToPay.map((item) => (
                    <Card key={item.id} padding={16} style={styles.payCard}>
                      <View style={styles.payTop}>
                        <View style={styles.payBody}>
                          <Text style={[styles.payee, { color: theme.colors.text }]}>{item.payee}</Text>
                          <Text style={[styles.payMeta, { color: theme.colors.textSubtle }]}>
                            {item.title} · {item.center}
                          </Text>
                          <Text style={[styles.paySubMeta, { color: theme.colors.textSubtle }]}>
                            {item.bankName} {item.accountNumber}
                          </Text>
                        </View>
                        <Text style={[styles.amountText, { color: theme.colors.financeAccent }]}>
                          {formatRupees(item.amount)}
                        </Text>
                      </View>
                      <View style={styles.payFooter}>
                        <StatusChip status={item.source} tone="brand" dot={false} />
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
          <TextField value={historySearch} onChangeText={setHistorySearch} placeholder="Payee, project or reference" />
          <DataTable
            columns={HISTORY_COLUMNS}
            rows={scopedHistory}
            keyExtractor={(item) => item.id}
            renderCell={renderHistoryCell}
            renderMobileCard={(item) => (
              <Card padding={14} style={styles.historyCard}>
                <View style={styles.payTop}>
                  <View style={styles.payBody}>
                    <Text numberOfLines={1} style={[styles.cellMain, { color: theme.colors.text }]}>
                      {item.payee}
                    </Text>
                    <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {item.title} · {item.project}
                    </Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      Paid {formatDate(item.paidOn || '2026-10-01')}
                    </Text>
                  </View>
                  <Text style={[styles.amountText, { color: theme.colors.text }]}>{formatRupees(item.amount)}</Text>
                </View>
                <View style={styles.historyFooter}>
                  <View style={styles.referenceCell}>
                    <Text style={[styles.cellMain, { color: theme.colors.successText }]}>{item.reference}</Text>
                    {item.status === 'Payment slip uploaded' ? (
                      <StatusChip status="Payment slip uploaded" tone="success" dot={false} />
                    ) : item.status === 'In progress' ? (
                      <Pressable
                        onPress={() => attachSlip(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Add payment slip for ${item.id}`}
                        style={[styles.slipBtn, { borderColor: theme.colors.border }]}
                      >
                        <Icon name="Upload" size={11} color={theme.colors.financeAccent} />
                        <Text style={[styles.slipBtnText, { color: theme.colors.financeAccent }]}>Add payment slip</Text>
                      </Pressable>
                    ) : null}
                  </View>
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
          />
        </SectionCard>
      )}

      <ModalSheet
        visible={payOpen && Boolean(payItem)}
        onClose={() => setPayOpen(false)}
        label="Record Payment"
        title={payItem?.title ?? 'Payment'}
        description={payItem ? `${payItem.payee} · ${payItem.project}` : ''}
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setPayOpen(false)} />
            <Button label="Save payment record" variant="primary" icon="Check" onPress={handleSavePayment} />
          </>
        }
      >
        {payItem ? (
          <>
            <View style={[styles.amountPanel, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Text style={[styles.amountPanelPayee, { color: theme.colors.text }]}>{payItem.payee}</Text>
              <Text style={[styles.amountPanelValue, { color: theme.colors.financeAccent }]}>{formatRupees(payItem.amount)}</Text>
              <Text style={[styles.amountPanelMeta, { color: theme.colors.textMuted }]}>
                {payItem.source} · {payItem.bankName} {payItem.accountNumber}
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
        label="Payment Audit"
        title={detail ? `${detail.title}` : ''}
        description={detail ? `${detail.payee} · ${detail.project}` : ''}
        size="md"
        footer={<Button label="Close" variant="outline" onPress={() => setDetailOpen(false)} />}
      >
        {detail ? (
          <>
            <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <DetailRow label="Payee" value={detail.payee} />
              <DetailRow label="Source" value={detail.source} />
              <DetailRow label="Project" value={detail.project} />
              <DetailRow label="Center" value={detail.center} />
              <DetailRow label="Bank" value={`${detail.bankName ?? 'Bank'} · ${detail.accountNumber ?? 'Account'}`} />
              <DetailRow label="Amount" value={formatRupees(detail.amount)} />
              <DetailRow label="Payment date" value={formatDate(detail.paidOn || '2026-10-01')} />
              <DetailRow label="Bank reference" value={detail.reference ?? 'Not recorded'} />
              <DetailRow label="Payment slip" value={detail.paymentSlip ?? 'Not attached'} />
            </View>
            <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Audit Trail</Text>
            <Timeline
              accent={theme.colors.financeAccent}
              items={
                detail.audit && detail.audit.length > 0
                  ? detail.audit.map((entry, idx) => ({
                      key: String(idx),
                      title: entry.action,
                      actor: entry.actor,
                      detail: entry.detail,
                      time: entry.date,
                    }))
                  : [
                      {
                        key: '1',
                        title: 'Payment cleared',
                        actor: 'Finance Desk',
                        detail: `${detail.source} request cleared for release`,
                        time: formatDate(detail.paidOn || '2026-10-01'),
                      },
                      {
                        key: '2',
                        title: 'Bank payment recorded',
                        actor: 'Disbursement Desk',
                        detail: `UTR ${detail.reference ?? '—'}`,
                        color: theme.colors.emerald,
                      },
                    ]
              }
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
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'wrap' },
  scopeCard: { gap: 8 },
  scopeCardWrap: { flexGrow: 1, flexBasis: 160 },
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
  paySubMeta: { fontSize: 10.5, marginTop: 2 },
  payFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  historyCard: { gap: 10 },
  paymentInfoCol: { flex: 1, minWidth: 0 },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referenceCell: { gap: 6, alignItems: 'flex-start' },
  slipBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  viewBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  viewBtnText: { fontSize: 12, fontWeight: '600' },
  slipBtnText: { fontSize: 10, fontWeight: '700' },
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
  emptyWrap: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
