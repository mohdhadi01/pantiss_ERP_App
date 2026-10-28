import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';

interface Requisition {
  id: string;
  project: string;
  department: string;
  item: string;
  quantity: number;
  estimatedCost: number;
  requestedBy: string;
  date: string;
  vendor: string;
  status: 'Approved' | 'Pending approval' | 'RFQ Released';
}

const initialRequisitions: Requisition[] = [
  {
    id: 'REQ-2026-081',
    project: 'PMKVY 4.0 Odisha Skills',
    department: 'Skill Development',
    item: 'Smart Classroom Interactive Flat Panels (65 inch)',
    quantity: 4,
    estimatedCost: 380000,
    requestedBy: 'Subhashree Ray (SPM)',
    date: '2026-10-04',
    vendor: 'Zenith Labs Pvt Ltd',
    status: 'Pending approval',
  },
  {
    id: 'REQ-2026-082',
    project: 'Swasthya Mobile Clinics',
    department: 'Health & Nutrition',
    item: 'Portable Digital ECG Machines & Consumables',
    quantity: 2,
    estimatedCost: 165000,
    requestedBy: 'Dr. Priyadarshini Mohapatra (CMO)',
    date: '2026-10-02',
    vendor: 'MedTech Diagnostics',
    status: 'Approved',
  },
  {
    id: 'REQ-2026-083',
    project: 'Poshan Community Network',
    department: 'Health & Nutrition',
    item: 'Anthropometric Infant Weighing Scales & MUAC Tapes',
    quantity: 25,
    estimatedCost: 85000,
    requestedBy: 'Kavita Soren (Supervisor)',
    date: '2026-09-28',
    vendor: 'Apex Tooling Systems',
    status: 'Approved',
  },
];

export const ProcurementView: React.FC = () => {
  const { theme } = useTheme();
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setRequisitions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' as const } : r))
    );
  };

  const filtered = requisitions.filter((r) => {
    const matchesSearch =
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search purchase requisitions & POs..."
        filters={[
          { id: 'all', label: 'All Orders', count: requisitions.length },
          {
            id: 'Pending approval',
            label: 'Pending Approval',
            count: requisitions.filter((r) => r.status === 'Pending approval').length,
          },
          {
            id: 'Approved',
            label: 'Approved',
            count: requisitions.filter((r) => r.status === 'Approved').length,
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
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.item}
                </Text>
                <Text style={[styles.itemSub, { color: theme.colors.brandPrimary }]}>
                  {item.id} · {item.project}
                </Text>
                <Text style={[styles.requestedBy, { color: theme.colors.textSubtle }]}>
                  Requested by: {item.requestedBy} · {formatDate(item.date)}
                </Text>
              </View>
              <StatusChip status={item.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailCol}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  QUANTITY
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {item.quantity} Units
                </Text>
              </View>

              <View style={styles.detailCol}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  ESTIMATED VALUE
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {formatRupees(item.estimatedCost)}
                </Text>
              </View>

              <View style={styles.detailCol}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  SUPPLIER
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {item.vendor}
                </Text>
              </View>
            </View>

            {item.status === 'Pending approval' && (
              <View style={styles.actionRow}>
                <Button
                  label="Approve Purchase Order"
                  onPress={() => handleApprove(item.id)}
                  size="sm"
                  variant="emerald"
                  icon="CheckCircle"
                />
              </View>
            )}
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
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  requestedBy: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
});
