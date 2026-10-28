import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface Claim {
  id: string;
  claimant: string;
  employeeId: string;
  purpose: string;
  date: string;
  amount: number;
  billsCount: number;
  status: 'Approved' | 'Pending approval' | 'Settled';
  bankRef?: string;
}

const sampleClaims: Claim[] = [
  {
    id: 'CLM-2026-401',
    claimant: 'Sunita Majhi',
    employeeId: 'PAN-EMP-0104',
    purpose: 'Koraput Field Cluster Tribal SHG Mobilization Travel',
    date: '2026-10-06',
    amount: 14200,
    billsCount: 5,
    status: 'Pending approval',
  },
  {
    id: 'CLM-2026-402',
    claimant: 'Ranjan Kumar Jena',
    employeeId: 'PAN-EMP-0103',
    purpose: 'NSDC Trainer of Trainers Certification Workshop — Cuttack',
    date: '2026-09-29',
    amount: 22800,
    billsCount: 7,
    status: 'Approved',
  },
  {
    id: 'CLM-2026-403',
    claimant: 'Bishnu Charan Das',
    employeeId: 'PAN-EMP-0105',
    purpose: 'District Monitoring Survey Vehicle Fuel & Per Diem',
    date: '2026-09-22',
    amount: 18500,
    billsCount: 4,
    status: 'Settled',
    bankRef: 'UTR-20260925-1049',
  },
];

export const ReimbursementView: React.FC = () => {
  const { theme } = useTheme();
  const [claims, setClaims] = useState(sampleClaims);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Approved' as const } : c))
    );
  };

  const handleSettle = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Settled' as const,
              bankRef: `UTR-${Date.now().toString().slice(-8)}`,
            }
          : c
      )
    );
  };

  const filtered = claims.filter((c) => {
    const matchesSearch =
      c.claimant.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search employee expense claims..."
        filters={[
          { id: 'all', label: 'All Claims', count: claims.length },
          {
            id: 'Pending approval',
            label: 'Pending Approval',
            count: claims.filter((c) => c.status === 'Pending approval').length,
          },
          {
            id: 'Approved',
            label: 'Ready for Settlement',
            count: claims.filter((c) => c.status === 'Approved').length,
          },
          {
            id: 'Settled',
            label: 'Settled',
            count: claims.filter((c) => c.status === 'Settled').length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <View style={styles.list}>
        {filtered.map((claim) => (
          <View
            key={claim.id}
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
                <Text style={[styles.claimantName, { color: theme.colors.text }]}>
                  {claim.claimant}
                </Text>
                <Text style={[styles.claimSub, { color: theme.colors.brandPrimary }]}>
                  {claim.id} · ID: {claim.employeeId}
                </Text>
              </View>
              <StatusChip status={claim.status} />
            </View>

            <Text style={[styles.purposeText, { color: theme.colors.textMuted }]}>
              {claim.purpose}
            </Text>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>DATE</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {formatDate(claim.date)}
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>BILLS ATTACHED</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {claim.billsCount} Receipts
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>CLAIM AMOUNT</Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {formatRupees(claim.amount)}
                </Text>
              </View>
            </View>

            {claim.bankRef && (
              <View style={styles.settledRow}>
                <Icon name="CheckCircle2" size={14} color={theme.colors.emerald} />
                <Text style={[styles.settledText, { color: theme.colors.emerald }]}>
                  Disbursed via bank · UTR: {claim.bankRef}
                </Text>
              </View>
            )}

            <View style={styles.actionRow}>
              {claim.status === 'Pending approval' && (
                <Button
                  label="Approve Claim"
                  onPress={() => handleApprove(claim.id)}
                  size="sm"
                  variant="primary"
                  icon="Check"
                />
              )}

              {claim.status === 'Approved' && (
                <Button
                  label="Disburse Settlement"
                  onPress={() => handleSettle(claim.id)}
                  size="sm"
                  variant="emerald"
                  icon="Coins"
                />
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
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
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
  claimantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  claimSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  purposeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 13,
  },
  settledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  settledText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 8,
  },
});
