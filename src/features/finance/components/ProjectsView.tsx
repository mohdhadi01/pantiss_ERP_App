import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { financeAreas, formatCurrency, FinanceProject } from '../data';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';

export const ProjectsView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allProjects = financeAreas.flatMap((a) => a.projects);

  const filtered = allProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.donor.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search projects by name, donor or district..."
        filters={[
          { id: 'all', label: 'All Projects', count: allProjects.length },
          { id: 'On track', label: 'On Track' },
          { id: 'Watch', label: 'Watch List' },
          { id: 'Action required', label: 'Action Required' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <View style={styles.list}>
        {filtered.map((proj) => {
          const area = financeAreas.find((a) => a.id === proj.areaId);
          return (
            <View
              key={proj.id}
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
                    <Text style={[styles.projName, { color: theme.colors.text }]}>
                      {proj.name}
                    </Text>
                  </View>
                  <Text style={[styles.subText, { color: theme.colors.brandPrimary }]}>
                    {proj.id} · Donor: {proj.donor} · {proj.location}
                  </Text>
                  <Text style={[styles.areaText, { color: theme.colors.textSubtle }]}>
                    Portfolio: {area?.name || proj.areaId}
                  </Text>
                </View>

                <StatusChip status={proj.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.financialsRow}>
                <View>
                  <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>
                    SANCTIONED
                  </Text>
                  <Text style={[styles.finVal, { color: theme.colors.text }]}>
                    {formatCurrency(proj.approved)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>
                    RELEASED
                  </Text>
                  <Text style={[styles.finVal, { color: theme.colors.text }]}>
                    {formatCurrency(proj.released)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>
                    VERIFIED SPENT
                  </Text>
                  <Text style={[styles.finVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                    {formatCurrency(proj.spent)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>
                    COMMITTED
                  </Text>
                  <Text style={[styles.finVal, { color: theme.colors.warning }]}>
                    {formatCurrency(proj.committed)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                    Grant Utilization
                  </Text>
                  <Text style={[styles.progressVal, { color: theme.colors.text }]}>
                    {proj.utilization}%
                  </Text>
                </View>
                <ProgressBar value={proj.utilization} height={6} />
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.voucherText, { color: theme.colors.textSubtle }]}>
                  Last voucher audit: {proj.lastVoucherDate}
                </Text>
                {proj.pendingAdvances > 0 && (
                  <Badge
                    label={`Advances: ${formatCurrency(proj.pendingAdvances)}`}
                    tone="warning"
                    size="sm"
                  />
                )}
              </View>
            </View>
          );
        })}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projName: {
    fontSize: 15,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  areaText: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  financialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  finVal: {
    fontSize: 13,
  },
  progressSection: {
    gap: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
  },
  progressVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  voucherText: {
    fontSize: 11,
  },
});
