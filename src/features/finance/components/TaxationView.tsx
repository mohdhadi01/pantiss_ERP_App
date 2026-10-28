import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Icon } from '../../../components/ui/Icon';

interface TaxFiling {
  id: string;
  type: 'GST (GSTR-3B)' | 'GST (GSTR-1)' | 'TDS (Form 26Q)' | 'TDS (Form 24Q)';
  period: string;
  dueDate: string;
  taxableValue: number;
  taxAmount: number;
  status: 'Filed & Cleared' | 'Due Soon' | 'Pending Filing';
  arnNumber?: string;
}

const taxFilings: TaxFiling[] = [
  {
    id: 'TAX-01',
    type: 'GST (GSTR-3B)',
    period: 'September 2026',
    dueDate: '2026-10-20',
    taxableValue: 8450000,
    taxAmount: 1521000,
    status: 'Filed & Cleared',
    arnNumber: 'AA210926001842P',
  },
  {
    id: 'TAX-02',
    type: 'GST (GSTR-1)',
    period: 'September 2026',
    dueDate: '2026-10-11',
    taxableValue: 8450000,
    taxAmount: 1521000,
    status: 'Filed & Cleared',
    arnNumber: 'AA210926001290K',
  },
  {
    id: 'TAX-03',
    type: 'TDS (Form 26Q)',
    period: 'Q2 FY 2026–27',
    dueDate: '2026-10-31',
    taxableValue: 12400000,
    taxAmount: 894000,
    status: 'Due Soon',
  },
  {
    id: 'TAX-04',
    type: 'TDS (Form 24Q)',
    period: 'Q2 FY 2026–27',
    dueDate: '2026-10-31',
    taxableValue: 24500000,
    taxAmount: 2140000,
    status: 'Due Soon',
  },
];

export const TaxationView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = taxFilings.filter((t) => {
    const matchesSearch =
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      t.period.toLowerCase().includes(search.toLowerCase()) ||
      (t.arnNumber && t.arnNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Top Compliance Metrics */}
      <View style={styles.metricsRow}>
        <MetricCard
          label="ITC Available"
          value="₹48.2 L"
          subtitle="GSTR-2B reconciled"
          icon="CheckCircle"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="TDS Remitted"
          value="₹30.3 L"
          subtitle="Challan ITNS-281"
          icon="Scale"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Upcoming Due"
          value="2 Filings"
          subtitle="31 Oct 2026"
          icon="Clock"
          accentColor={theme.colors.warning}
        />
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search statutory GST/TDS filings..."
        filters={[
          { id: 'all', label: 'All Filings', count: taxFilings.length },
          { id: 'Due Soon', label: 'Due Soon', count: 2 },
          { id: 'Filed & Cleared', label: 'Filed & Cleared', count: 2 },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <View style={styles.list}>
        {filtered.map((filing) => (
          <View
            key={filing.id}
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
                <Text style={[styles.filingType, { color: theme.colors.text }]}>
                  {filing.type}
                </Text>
                <Text style={[styles.periodText, { color: theme.colors.brandPrimary }]}>
                  {filing.period} · Due by {formatDate(filing.dueDate)}
                </Text>
              </View>
              <StatusChip status={filing.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailCol}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  TAXABLE TURNOVER
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {formatRupees(filing.taxableValue)}
                </Text>
              </View>

              <View style={styles.detailCol}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  TAX DEPOSITED
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {formatRupees(filing.taxAmount)}
                </Text>
              </View>
            </View>

            {filing.arnNumber && (
              <View style={styles.arnRow}>
                <Icon name="FileCheck2" size={14} color={theme.colors.emerald} />
                <Text style={[styles.arnText, { color: theme.colors.emerald }]}>
                  Filing Acknowledgment ARN: {filing.arnNumber}
                </Text>
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
  filingType: {
    fontSize: 15,
    fontWeight: '700',
  },
  periodText: {
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
  },
  arnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  arnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
