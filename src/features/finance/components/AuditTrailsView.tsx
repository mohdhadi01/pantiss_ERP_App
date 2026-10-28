import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Icon } from '../../../components/ui/Icon';

interface AuditItem {
  id: string;
  project: string;
  claimant: string;
  invoiceNo: string;
  date: string;
  amount: number;
  auditor: string;
  auditDate: string;
  finding: string;
  riskLevel: 'Low (Clear)' | 'Medium (Review)' | 'High (Flagged)';
}

const auditRecords: AuditItem[] = [
  {
    id: 'ADT-2026-901',
    project: 'PMKVY 4.0 Odisha Skills',
    claimant: 'Ramesh Mohanty',
    invoiceNo: 'INV/2026/0912',
    date: '2026-09-24',
    amount: 88500,
    auditor: 'Internal Audit Cell (Deloitte/CAG)',
    auditDate: '2026-10-02',
    finding: '3-way match verified with purchase order and store GRN note.',
    riskLevel: 'Low (Clear)',
  },
  {
    id: 'ADT-2026-902',
    project: 'Swasthya Mobile Clinics',
    claimant: 'Pooja Barik',
    invoiceNo: 'MED/OD/441',
    date: '2026-09-28',
    amount: 142000,
    auditor: 'Internal Audit Cell',
    auditDate: '2026-10-04',
    finding: 'Logbook vehicle odometer log verified with fuel receipts.',
    riskLevel: 'Low (Clear)',
  },
  {
    id: 'ADT-2026-903',
    project: 'Rural Incubation Lab',
    claimant: 'Kiran Pradhan',
    invoiceNo: 'VND/INC/22',
    date: '2026-10-01',
    amount: 65000,
    auditor: 'Internal Audit Cell',
    auditDate: '2026-10-06',
    finding: 'Missing counter-signature on delivery challan. Pending vendor confirmation.',
    riskLevel: 'Medium (Review)',
  },
];

export const AuditTrailsView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = auditRecords.filter((a) => {
    const matchesSearch =
      a.claimant.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      a.project.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.riskLevel.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search audit trail by invoice, claimant, or project..."
        filters={[
          { id: 'all', label: 'All Records', count: auditRecords.length },
          { id: 'Clear', label: 'Verified Clear' },
          { id: 'Review', label: 'Review Required' },
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
                <Text style={[styles.claimantName, { color: theme.colors.text }]}>
                  {item.claimant} · {item.invoiceNo}
                </Text>
                <Text style={[styles.projectSub, { color: theme.colors.brandPrimary }]}>
                  {item.project} · {item.id}
                </Text>
              </View>

              <Badge
                label={item.riskLevel}
                tone={
                  item.riskLevel.includes('Clear')
                    ? 'emerald'
                    : item.riskLevel.includes('Review')
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              />
            </View>

            <View style={[styles.findingBox, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Text style={[styles.findingLabel, { color: theme.colors.textSubtle }]}>
                AUDITOR FINDINGS & VERIFICATION:
              </Text>
              <Text style={[styles.findingText, { color: theme.colors.text }]}>
                {item.finding}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  INVOICE DATE
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {formatDate(item.date)}
                </Text>
              </View>

              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  AUDITED BY
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {item.auditor}
                </Text>
              </View>

              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                  AMOUNT
                </Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {formatRupees(item.amount)}
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
  claimantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  projectSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  findingBox: {
    padding: 10,
    borderRadius: 10,
    gap: 3,
  },
  findingLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  findingText: {
    fontSize: 12,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 8,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 12,
  },
});
