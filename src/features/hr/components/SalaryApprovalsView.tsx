import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useSalaryRecords } from '../../finance/useSalaryRecords';
import {
  payrollMonths,
  salaryKey,
  salaryMonthLabel,
  SalaryRecord,
} from '../../finance/salaryData';
import { formatRupees } from '../../../utils/formatCurrency';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export const SalaryApprovalsView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(payrollMonths[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'released'>('all');

  const { records, reviewByHR } = useSalaryRecords('hr');

  const monthlyRecords = records.filter((r) => r.month === selectedMonth);

  const filtered = monthlyRecords.filter((rec) => {
    const matchesQuery =
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.id.toLowerCase().includes(search.toLowerCase()) ||
      rec.designation.toLowerCase().includes(search.toLowerCase());

    const isReady = rec.adminApproval === 'Approved' && rec.hrApproval === 'Pending';
    const isReleased = rec.adminApproval === 'Approved' && rec.hrApproval === 'Approved';

    if (filter === 'ready') return matchesQuery && isReady;
    if (filter === 'released') return matchesQuery && isReleased;
    return matchesQuery;
  });

  const handleApprove = (rec: SalaryRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    reviewByHR(salaryKey(rec), 'Approved', 'Ritika Sen (HR Manager)');
  };

  const handleReject = (rec: SalaryRecord) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    reviewByHR(
      salaryKey(rec),
      'Rejected',
      'Ritika Sen (HR Manager)',
      'Attendance evidence discrepancy. Returned for verification.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Selector Chips */}
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
                  backgroundColor: isSelected ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                  borderColor: isSelected ? theme.colors.brandPrimary : theme.colors.border,
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

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search payroll by employee or role..."
        filters={[
          { id: 'all', label: 'All Records', count: monthlyRecords.length },
          {
            id: 'ready',
            label: 'Ready for HR',
            count: monthlyRecords.filter(
              (r) => r.adminApproval === 'Approved' && r.hrApproval === 'Pending'
            ).length,
          },
          {
            id: 'released',
            label: 'Released to Finance',
            count: monthlyRecords.filter(
              (r) => r.adminApproval === 'Approved' && r.hrApproval === 'Approved'
            ).length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={(f) => setFilter(f as any)}
      />

      <View style={styles.list}>
        {filtered.map((rec) => {
          const isReadyForHR = rec.adminApproval === 'Approved' && rec.hrApproval === 'Pending';
          const isReleased = rec.adminApproval === 'Approved' && rec.hrApproval === 'Approved';

          return (
            <View
              key={salaryKey(rec)}
              style={[
                styles.card,
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
                  <Text style={[styles.designation, { color: theme.colors.brandPrimary }]}>
                    {rec.designation} · {rec.id}
                  </Text>
                  <Text style={[styles.location, { color: theme.colors.textSubtle }]}>
                    {rec.location} · {rec.workingDays} days worked
                  </Text>
                </View>

                <View style={styles.badgesCol}>
                  <Badge
                    label={`Admin: ${rec.adminApproval}`}
                    tone={rec.adminApproval === 'Approved' ? 'emerald' : 'warning'}
                    size="sm"
                  />
                  <Badge
                    label={`HR: ${rec.hrApproval}`}
                    tone={
                      rec.hrApproval === 'Approved'
                        ? 'emerald'
                        : rec.hrApproval === 'Rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSubtle }]}>
                    BASIC + HRA
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
                    {formatRupees(rec.basicHra)}
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSubtle }]}>
                    ALLOWANCE
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
                    {formatRupees(rec.allowance)}
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSubtle }]}>
                    DEDUCTIONS
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.danger }]}>
                    -{formatRupees(rec.pfDeduction + rec.esiDeduction + rec.tdsDeduction)}
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSubtle }]}>
                    NET PAYABLE
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.emerald, fontWeight: '700' }]}>
                    {formatRupees(rec.netPay)}
                  </Text>
                </View>
              </View>

              {rec.hrReason ? (
                <Text style={[styles.reasonText, { color: theme.colors.danger }]}>
                  Return reason: "{rec.hrReason}"
                </Text>
              ) : null}

              {isReadyForHR && (
                <View style={styles.actionsRow}>
                  <Button
                    label="Return"
                    onPress={() => handleReject(rec)}
                    size="sm"
                    variant="outline"
                    icon="XCircle"
                  />
                  <Button
                    label="Approve & Release to Finance"
                    onPress={() => handleApprove(rec)}
                    size="sm"
                    variant="emerald"
                    icon="CheckCircle2"
                  />
                </View>
              )}

              {isReleased && (
                <View style={styles.releasedRow}>
                  <Icon name="Check" size={14} color={theme.colors.emerald} />
                  <Text style={[styles.releasedText, { color: theme.colors.emerald }]}>
                    Released to Finance Division · Eligible for Disbursement
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
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
  list: {
    gap: 12,
  },
  card: {
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
  designation: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  location: {
    fontSize: 11,
    marginTop: 2,
  },
  badgesCol: {
    gap: 4,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
  releasedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  releasedText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
