import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useSalaryRecords } from '../useSalaryRecords';
import {
  payrollMonths,
  salaryKey,
  salaryMonthLabel,
  salaryTotals,
  SalaryRecord,
  salaryWorkflowLabel,
} from '../salaryData';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export const SalaryView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(payrollMonths[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'forwarded' | 'disbursed'>('all');

  // Disbursement modal state
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SalaryRecord | null>(null);
  const [bankRef, setBankRef] = useState('');

  const { records, forwardForPayment, savePayment } = useSalaryRecords('finance');

  const monthlyRecords = records.filter((r) => r.month === selectedMonth);
  const totals = salaryTotals(monthlyRecords);

  const filtered = monthlyRecords.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.designation.toLowerCase().includes(search.toLowerCase()) ||
      rec.id.toLowerCase().includes(search.toLowerCase());

    const isReady = rec.status === 'Pending' && !rec.forwardedAt;
    const isForwarded = Boolean(rec.forwardedAt) && rec.status === 'Pending';
    const isDisbursed = rec.status === 'Disbursed';

    if (filter === 'ready') return matchesSearch && isReady;
    if (filter === 'forwarded') return matchesSearch && isForwarded;
    if (filter === 'disbursed') return matchesSearch && isDisbursed;
    return matchesSearch;
  });

  const handleForward = (rec: SalaryRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    forwardForPayment(salaryKey(rec), 'Aarav Kapoor (Finance Manager)');
  };

  const handleOpenDisburse = (rec: SalaryRecord) => {
    Haptics.selectionAsync().catch(() => {});
    setActiveRecord(rec);
    setBankRef(`UTR-${Date.now().toString().slice(-8)}`);
    setDisburseModalOpen(true);
  };

  const handleConfirmDisbursement = () => {
    if (!activeRecord || !bankRef.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    savePayment(salaryKey(activeRecord), {
      status: 'Disbursed',
      paidOn: new Date().toISOString().slice(0, 10),
      reference: bankRef.trim(),
    });
    setDisburseModalOpen(false);
    setActiveRecord(null);
  };

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        {payrollMonths.map((m) => {
          const isSelected = selectedMonth === m;
          return (
            <Pressable
              key={m}
              onPress={() => setSelectedMonth(m)}
              style={[
                styles.monthChip,
                {
                  backgroundColor: isSelected ? theme.colors.emerald : theme.colors.surfaceSoft,
                  borderColor: isSelected ? theme.colors.emerald : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.monthChipText,
                  {
                    color: isSelected ? '#ffffff' : theme.colors.textMuted,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {salaryMonthLabel(m)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Summary KPI Banner */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              {salaryMonthLabel(selectedMonth)} Payroll Rollout
            </Text>
            <Text style={[styles.summarySub, { color: theme.colors.textSubtle }]}>
              {totals.paidCount} of {totals.employees} salaries disbursed · {formatRupees(totals.paid)} settled
            </Text>
          </View>
          <Badge
            label={`${totals.employees ? Math.round((totals.paidCount / totals.employees) * 100) : 0}% Rollout`}
            tone="emerald"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>GROSS PAYROLL</Text>
            <Text style={[styles.kpiVal, { color: theme.colors.text }]}>
              {formatRupees(totals.gross)}
            </Text>
          </View>
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>TOTAL DEDUCTIONS</Text>
            <Text style={[styles.kpiVal, { color: theme.colors.danger }]}>
              -{formatRupees(totals.deductions)}
            </Text>
          </View>
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>NET DISBURSED</Text>
            <Text style={[styles.kpiVal, { color: theme.colors.emerald }]}>
              {formatRupees(totals.paid)}
            </Text>
          </View>
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>OUTSTANDING</Text>
            <Text style={[styles.kpiVal, { color: theme.colors.warning }]}>
              {formatRupees(totals.outstanding)}
            </Text>
          </View>
        </View>
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search payroll by employee name, ID or role..."
        filters={[
          { id: 'all', label: 'All Staff', count: monthlyRecords.length },
          {
            id: 'ready',
            label: 'Ready to Forward',
            count: monthlyRecords.filter((r) => r.status === 'Pending' && !r.forwardedAt).length,
          },
          {
            id: 'forwarded',
            label: 'Forwarded for Payment',
            count: monthlyRecords.filter((r) => Boolean(r.forwardedAt) && r.status === 'Pending').length,
          },
          {
            id: 'disbursed',
            label: 'Disbursed',
            count: monthlyRecords.filter((r) => r.status === 'Disbursed').length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={(f) => setFilter(f as any)}
      />

      <View style={styles.list}>
        {filtered.map((rec) => {
          const isReady = rec.status === 'Pending' && !rec.forwardedAt;
          const isForwarded = Boolean(rec.forwardedAt) && rec.status === 'Pending';
          const isDisbursed = rec.status === 'Disbursed';

          return (
            <View
              key={salaryKey(rec)}
              style={[
                styles.salaryCard,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {rec.name}
                  </Text>
                  <Text style={[styles.role, { color: theme.colors.brandPrimary }]}>
                    {rec.designation} · {rec.department}
                  </Text>
                  <Text style={[styles.bankDetails, { color: theme.colors.textSubtle }]}>
                    {rec.bankName} · {rec.bankAccount} · UAN: {rec.uan}
                  </Text>
                </View>

                <Badge
                  label={salaryWorkflowLabel(rec)}
                  tone={isDisbursed ? 'emerald' : isForwarded ? 'brand' : 'warning'}
                  size="sm"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.payGrid}>
                <View style={styles.payCol}>
                  <Text style={[styles.payLabel, { color: theme.colors.textSubtle }]}>BASIC + HRA</Text>
                  <Text style={[styles.payVal, { color: theme.colors.text }]}>
                    {formatRupees(rec.basicHra)}
                  </Text>
                </View>
                <View style={styles.payCol}>
                  <Text style={[styles.payLabel, { color: theme.colors.textSubtle }]}>ALLOWANCE</Text>
                  <Text style={[styles.payVal, { color: theme.colors.text }]}>
                    {formatRupees(rec.allowance)}
                  </Text>
                </View>
                <View style={styles.payCol}>
                  <Text style={[styles.payLabel, { color: theme.colors.textSubtle }]}>PF + ESI + TDS</Text>
                  <Text style={[styles.payVal, { color: theme.colors.danger }]}>
                    -{formatRupees(rec.pfDeduction + rec.esiDeduction + rec.tdsDeduction)}
                  </Text>
                </View>
                <View style={styles.payCol}>
                  <Text style={[styles.payLabel, { color: theme.colors.textSubtle }]}>NET PAY</Text>
                  <Text style={[styles.payVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                    {formatRupees(rec.netPay)}
                  </Text>
                </View>
              </View>

              {isDisbursed && rec.reference && (
                <View style={styles.disbursedInfoRow}>
                  <Icon name="CheckCircle2" size={14} color={theme.colors.emerald} />
                  <Text style={[styles.disbursedRef, { color: theme.colors.emerald }]}>
                    Disbursed on {formatDate(rec.paidOn || '')} · UTR Ref: {rec.reference}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {isReady && (
                  <Button
                    label="Forward for Payment"
                    onPress={() => handleForward(rec)}
                    size="sm"
                    variant="primary"
                    icon="Send"
                  />
                )}

                {isForwarded && (
                  <Button
                    label="Disburse via Desk"
                    onPress={() => handleOpenDisburse(rec)}
                    size="sm"
                    variant="emerald"
                    icon="CheckCircle"
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Disburse Modal */}
      <Modal visible={disburseModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDisburseModalOpen(false)} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.borderStrong,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Record Salary Disbursement
              </Text>
              <Pressable onPress={() => setDisburseModalOpen(false)}>
                <Icon name="X" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            {activeRecord && (
              <View style={{ gap: 14 }}>
                <View style={[styles.modalDetailBox, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Text style={[styles.modalEmpName, { color: theme.colors.text }]}>
                    {activeRecord.name}
                  </Text>
                  <Text style={[styles.modalEmpSub, { color: theme.colors.textMuted }]}>
                    {activeRecord.designation} · {activeRecord.bankName}
                  </Text>
                  <Text style={[styles.modalAmount, { color: theme.colors.emerald }]}>
                    Net Amount: {formatRupees(activeRecord.netPay)}
                  </Text>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSubtle }]}>
                    BANK TRANSACTION UTR / REFERENCE
                  </Text>
                  <TextInput
                    value={bankRef}
                    onChangeText={setBankRef}
                    placeholder="e.g. UTR-20261028-0912"
                    placeholderTextColor={theme.colors.textGhost}
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surfaceSoft,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  />
                </View>

                <Button
                  label="Confirm Settlement & Disburse"
                  onPress={handleConfirmDisbursement}
                  size="lg"
                  variant="emerald"
                  icon="Check"
                  style={{ marginTop: 8 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCol: {
    minWidth: 110,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  kpiVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  salaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  role: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bankDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  payGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payCol: {
    flex: 1,
  },
  payLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  payVal: {
    fontSize: 12,
    fontWeight: '500',
  },
  disbursedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  disbursedRef: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalDetailBox: {
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  modalEmpName: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalEmpSub: {
    fontSize: 12,
  },
  modalAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
});
