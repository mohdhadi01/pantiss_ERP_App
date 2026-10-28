import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';

interface Invoice {
  id: string;
  client: string;
  project: string;
  date: string;
  dueDate: string;
  amount: number;
  gstAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const sampleInvoices: Invoice[] = [
  {
    id: 'INV-2026-081',
    client: 'National Skill Development Corporation (NSDC)',
    project: 'PMKVY 4.0 Odisha Skills',
    date: '2026-09-15',
    dueDate: '2026-10-15',
    amount: 4500000,
    gstAmount: 810000,
    status: 'Paid',
  },
  {
    id: 'INV-2026-082',
    client: 'Tata Trusts Strategic Grant Division',
    project: 'Poshan Community Network',
    date: '2026-09-28',
    dueDate: '2026-10-28',
    amount: 3200000,
    gstAmount: 0,
    status: 'Pending',
  },
  {
    id: 'INV-2026-083',
    client: 'Odisha State CSR Council',
    project: 'Project Udaan',
    date: '2026-08-20',
    dueDate: '2026-09-20',
    amount: 1850000,
    gstAmount: 333000,
    status: 'Overdue',
  },
];

export const InvoicesView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const totalBilled = sampleInvoices.reduce((sum, inv) => sum + inv.amount + inv.gstAmount, 0);
  const totalPaid = sampleInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount + inv.gstAmount, 0);
  const totalPending = totalBilled - totalPaid;

  const filtered = sampleInvoices.filter((inv) => {
    const matchesSearch =
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Top Invoice Metrics */}
      <View style={styles.metricsRow}>
        <MetricCard
          label="Total Billed"
          value={formatRupees(totalBilled)}
          subtitle="FY 2026–27"
          icon="FileText"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Realized Inflow"
          value={formatRupees(totalPaid)}
          subtitle="Cleared into bank"
          icon="CheckCircle"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="Receivables"
          value={formatRupees(totalPending)}
          subtitle="Awaiting client release"
          icon="Clock"
          accentColor={theme.colors.warning}
        />
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search invoices by client or project..."
        filters={[
          { id: 'all', label: 'All Invoices', count: sampleInvoices.length },
          { id: 'Pending', label: 'Pending Payment' },
          { id: 'Paid', label: 'Settled' },
          { id: 'Overdue', label: 'Overdue' },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <View style={styles.list}>
        {filtered.map((inv) => (
          <View
            key={inv.id}
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
                <Text style={[styles.clientName, { color: theme.colors.text }]}>
                  {inv.client}
                </Text>
                <Text style={[styles.invSub, { color: theme.colors.brandPrimary }]}>
                  {inv.id} · {inv.project}
                </Text>
              </View>
              <StatusChip status={inv.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  INVOICE DATE
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {formatDate(inv.date)}
                </Text>
              </View>

              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  DUE DATE
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {formatDate(inv.dueDate)}
                </Text>
              </View>

              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  TOTAL (INC. GST)
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {formatRupees(inv.amount + inv.gstAmount)}
                </Text>
              </View>
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
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
  clientName: {
    fontSize: 15,
    fontWeight: '700',
  },
  invSub: {
    fontSize: 12,
    fontWeight: '600',
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
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 13,
  },
});
