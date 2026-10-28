import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
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
}

const initialPayments: PaymentItem[] = [
  {
    id: 'PAY-001',
    type: 'Vendor Invoice',
    beneficiary: 'Zenith Digital & Hardware Labs Pvt Ltd',
    bankName: 'Axis Bank',
    accountNumber: '•••• •••• 9201',
    amount: 148500,
    approvedDate: '2026-10-06',
    status: 'Ready for Release',
  },
  {
    id: 'PAY-002',
    type: 'Salary',
    beneficiary: 'Subhashree Ray (State Project Manager)',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 1829',
    amount: 77500,
    approvedDate: '2026-10-05',
    status: 'Ready for Release',
  },
  {
    id: 'PAY-003',
    type: 'Expense Claim',
    beneficiary: 'Sunita Majhi (Field Coordinator)',
    bankName: 'ICICI Bank',
    accountNumber: '•••• •••• 1928',
    amount: 14200,
    approvedDate: '2026-10-06',
    status: 'Ready for Release',
  },
  {
    id: 'PAY-004',
    type: 'Vendor Invoice',
    beneficiary: 'Maa Tarini Rural Logistics Fleet',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 8190',
    amount: 64200,
    approvedDate: '2026-10-02',
    status: 'Disbursed',
    utr: 'UTR-20261003-99124',
  },
];

export const PaymentsView: React.FC = () => {
  const { theme } = useTheme();
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const readyItems = payments.filter((p) => p.status === 'Ready for Release');
  const readyTotal = readyItems.reduce((sum, p) => sum + p.amount, 0);

  const handleDisburseItem = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Disbursed' as const,
              utr: `UTR-${Date.now().toString().slice(-8)}`,
            }
          : p
      )
    );
  };

  const handleBatchRelease = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayments((prev) =>
      prev.map((p) =>
        p.status === 'Ready for Release'
          ? {
              ...p,
              status: 'Disbursed' as const,
              utr: `BATCH-UTR-${Date.now().toString().slice(-6)}`,
            }
          : p
      )
    );
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.beneficiary.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Batch Release Banner */}
      <View
        style={[
          styles.batchCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.batchTop}>
          <View>
            <Text style={[styles.batchTitle, { color: theme.colors.text }]}>
              Disbursement Desk Queue
            </Text>
            <Text style={[styles.batchSub, { color: theme.colors.textSubtle }]}>
              {readyItems.length} verified obligations awaiting bank batch release · Total: {formatRupees(readyTotal)}
            </Text>
          </View>
          {readyItems.length > 0 && (
            <Button
              label="Release Batch"
              onPress={handleBatchRelease}
              size="md"
              variant="emerald"
              icon="Send"
            />
          )}
        </View>
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search disbursement queue by beneficiary or type..."
        filters={[
          { id: 'all', label: 'All Items', count: payments.length },
          {
            id: 'Ready for Release',
            label: 'Ready for Release',
            count: readyItems.length,
          },
          {
            id: 'Disbursed',
            label: 'Disbursed',
            count: payments.filter((p) => p.status === 'Disbursed').length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <View style={styles.list}>
        {filtered.map((item) => (
          <View
            key={item.id}
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
                <View style={styles.titleRow}>
                  <Text style={[styles.beneficiaryName, { color: theme.colors.text }]}>
                    {item.beneficiary}
                  </Text>
                  <Badge label={item.type} tone="brand" size="sm" />
                </View>
                <Text style={[styles.bankText, { color: theme.colors.textSubtle }]}>
                  {item.bankName} · {item.accountNumber} · ID: {item.id}
                </Text>
              </View>

              <Text style={[styles.amountText, { color: theme.colors.text }]}>
                {formatRupees(item.amount)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <Text style={[styles.dateText, { color: theme.colors.textSubtle }]}>
                Approved on {formatDate(item.approvedDate)}
              </Text>

              {item.status === 'Ready for Release' ? (
                <Button
                  label="Disburse Payment"
                  onPress={() => handleDisburseItem(item.id)}
                  size="sm"
                  variant="emerald"
                  icon="CheckCircle"
                />
              ) : (
                <View style={styles.utrRow}>
                  <Icon name="Check" size={14} color={theme.colors.emerald} />
                  <Text style={[styles.utrText, { color: theme.colors.emerald }]}>
                    {item.utr}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  batchCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  batchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  batchTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  batchSub: {
    fontSize: 12,
    marginTop: 2,
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
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beneficiaryName: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  bankText: {
    fontSize: 11,
    marginTop: 3,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
  },
  utrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  utrText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
