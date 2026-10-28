import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { financeAreas, areaTotals, formatCurrency, FinanceArea } from '../data';
import { formatRupees } from '../../../utils/formatCurrency';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { LedgerSheet } from './ProjectsParts';

type RegisterRow = FinanceArea['projects'][number];

const corpusOf = (p: RegisterRow) => Math.round(p.approved * 0.055);

export const ProjectsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  // Deep link: /(finance)/projects?area={areaId} — used by the dashboard
  // thematic scorecards (web navigates to /finance/{areaId}).
  const { area: areaParam } = useLocalSearchParams<{ area?: string }>();
  const initialArea = areaParam ? financeAreas.find((a) => a.id === areaParam) ?? null : null;
  const [selectedArea, setSelectedArea] = useState<FinanceArea | null>(initialArea);
  const [search, setSearch] = useState('');
  const [donorFilter, setDonorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ledgerProject, setLedgerProject] = useState<RegisterRow | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  const rows = useMemo(() => {
    if (!selectedArea) return [];
    return selectedArea.projects.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.donor.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesDonor = donorFilter === 'all' || p.donor === donorFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesDonor && matchesStatus;
    });
  }, [selectedArea, search, donorFilter, statusFilter]);

  const areaKpis = useMemo(() => {
    if (!selectedArea) return null;
    const totals = areaTotals(selectedArea);
    return { totals };
  }, [selectedArea]);

  const donorOptions = useMemo(() => {
    if (!selectedArea) return [];
    return [
      { value: 'all', label: 'All donors' },
      ...Array.from(new Set(selectedArea.projects.map((p) => p.donor))).map((d) => ({ value: d, label: d })),
    ];
  }, [selectedArea]);

  const columns: Array<DataColumn<RegisterRow>> = [
    { key: 'project', label: 'Project', flex: 2 },
    { key: 'approved', label: 'Approved', flex: 1, align: 'right', wideOnly: true },
    { key: 'released', label: 'Released', flex: 1, align: 'right', wideOnly: true },
    { key: 'spent', label: 'Spent', flex: 1, align: 'right' },
    { key: 'corpus', label: 'Corpus', flex: 0.9, align: 'right', wideOnly: true },
    { key: 'available', label: 'Available', flex: 1, align: 'right', wideOnly: true },
    { key: 'advances', label: 'Advances', flex: 0.9, align: 'right', wideOnly: true },
    { key: 'utilization', label: 'Utilization', flex: 1.3 },
    { key: 'status', label: 'Status', flex: 1 },
    { key: 'ledger', label: '', flex: 0.9, align: 'right' },
  ];

  const renderCell = (p: RegisterRow, col: DataColumn<RegisterRow>) => {
    switch (col.key) {
      case 'project':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{p.name}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.brandPrimary }]}>{p.donor}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{p.location}</Text>
          </View>
        );
      case 'approved':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(p.approved)}</Text>;
      case 'released':
        return <Text style={[styles.numText, { color: theme.colors.infoText }]}>{formatCurrency(p.released)}</Text>;
      case 'spent':
        return <Text style={[styles.numText, { color: theme.colors.financeAccent }]}>{formatCurrency(p.spent)}</Text>;
      case 'corpus':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(corpusOf(p))}</Text>;
      case 'available':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(Math.max(0, p.approved - p.spent - p.committed))}</Text>;
      case 'advances':
        return <Text style={[styles.numText, { color: p.pendingAdvances > p.approved * 0.02 ? theme.colors.warningText : theme.colors.text }]}>{formatCurrency(p.pendingAdvances)}</Text>;
      case 'utilization':
        return (
          <View style={styles.utilCell}>
            <ProgressBar value={p.utilization} height={5} color={theme.colors.financeAccent} />
            <Text style={[styles.utilText, { color: theme.colors.text }]}>{p.utilization}%</Text>
          </View>
        );
      case 'status':
        return <StatusChip status={p.status} />;
      case 'ledger':
        return (
          <Pressable
            onPress={() => {
              setLedgerProject(p);
              setLedgerOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`View ledger ${p.name}`}
          >
            <Text style={[styles.linkText, { color: theme.colors.financeAccent }]}>View ledger</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {!selectedArea ? (
        <>
          <View style={[styles.headingRow, isMd && styles.headingRowWide]}>
            <View style={styles.headingMain}>
              <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>Project financial portfolios</Text>
              <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Select a thematic area</Text>
            </View>
            <Button label="Project Onboarding" variant="outline" size="sm" icon="Plus" />
          </View>
          <View style={[styles.grid, isMd && styles.gridWide]}>
            {financeAreas.map((area) => {
              const totals = areaTotals(area);
              return (
                <Pressable
                  key={area.id}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedArea(area);
                  }}
                  style={styles.areaCardWrap}
                >
                  <Card padding={16} style={styles.areaCard}>
                    <View style={styles.areaTop}>
                      <View style={[styles.areaTile, { backgroundColor: `${area.color}1A` }]}>
                        <Icon name="FolderKanban" size={17} color={area.color} strokeWidth={1.8} />
                      </View>
                      <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{area.name}</Text>
                    </View>
                    <View style={styles.areaRow}>
                      <Text style={[styles.areaRowLabel, { color: theme.colors.textSubtle }]}>Approved budget</Text>
                      <Text style={[styles.areaRowValue, { color: theme.colors.text }]}>{formatCurrency(totals.approved)}</Text>
                    </View>
                    <View style={styles.areaRow}>
                      <Text style={[styles.areaRowLabel, { color: theme.colors.textSubtle }]}>Utilization</Text>
                      <Text style={[styles.areaRowValue, { color: theme.colors.financeAccent }]}>{totals.utilization}%</Text>
                    </View>
                    <ProgressBar value={totals.utilization} color={area.color} height={5} />
                    <View style={styles.areaFooter}>
                      <Text style={[styles.areaMeta, { color: theme.colors.textSubtle }]}>{area.projects.length} projects</Text>
                      <Text style={[styles.viewProjects, { color: theme.colors.financeAccent }]}>View projects →</Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Pressable
            onPress={() => {
              setSelectedArea(null);
              setSearch('');
              setStatusFilter('all');
              setDonorFilter('all');
            }}
            style={styles.backBtn}
          >
            <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
            <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>All thematic areas</Text>
          </Pressable>

          <HeroBanner
            gradient={heroGradients.projects}
            badge={{ icon: 'FolderKanban', label: 'Project Financial Portfolios' }}
            title={`${selectedArea.name} projects`}
            description="Grant release, verified expenditure and ledger audits for every project in this portfolio."
            actions={[{ label: 'Export Portfolio Report', icon: 'Download', variant: 'white' }]}
          />

          <View style={styles.metricsGrid}>
            <MetricCard style={styles.metricCard} label="Total Approved Grant Budget" value={formatCurrency(areaKpis?.totals.approved ?? 0)} subtitle={`${selectedArea.projects.length} Projects`} icon="WalletCards" accentColor={theme.colors.emerald} arrow />
            <MetricCard style={styles.metricCard} label="Donor Funds Received" value={formatCurrency(areaKpis?.totals.released ?? 0)} subtitle="Released" icon="CircleDollarSign" accentColor={theme.colors.info} arrow />
            <MetricCard style={styles.metricCard} label="Verified Project Expenditure" value={formatCurrency(areaKpis?.totals.spent ?? 0)} subtitle="Disbursed" icon="TrendingUp" accentColor={theme.colors.violet} valueColor={theme.colors.financeAccent} arrow />
            <MetricCard style={styles.metricCard} label="Portfolio Grant Burn Rate" value={`${areaKpis?.totals.utilization ?? 0}%`} subtitle="Average" icon="FileCheck" accentColor={theme.colors.teal} arrow />
          </View>

          <SectionCard
            title="Project Financial Register"
            description="Search the portfolio and open a project expenditure ledger."
          >
            <View style={styles.filterRow}>
              <TextField value={search} onChangeText={setSearch} placeholder="Search project, donor, state..." containerStyle={styles.searchGrow} />
              <SelectField value={donorFilter} onChange={setDonorFilter} options={donorOptions} containerStyle={styles.filterSelect} />
              <SelectField
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'On track', label: 'On track' },
                  { value: 'Watch', label: 'Watch' },
                  { value: 'Action required', label: 'Action required' },
                ]}
                containerStyle={styles.filterSelect}
              />
            </View>
            <DataTable
              columns={columns}
              rows={rows}
              keyExtractor={(p) => p.id}
              renderCell={renderCell}
              emptyIcon="FolderKanban"
              emptyTitle="No projects match"
              emptyDescription="Adjust the search, donor or status filters."
            />
          </SectionCard>
        </>
      )}

      <LedgerSheet project={ledgerProject} visible={ledgerOpen} onClose={() => setLedgerOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  headingRow: { gap: 12 },
  headingRowWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingMain: { flex: 1, minWidth: 0, gap: 4 },
  pageTitle: { fontSize: 32, fontWeight: '600', letterSpacing: -1.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  areaCard: { gap: 9 },
  areaCardWrap: { flexGrow: 1, flexBasis: 260 },
  areaTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  areaTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  areaName: { fontSize: 13.5, fontWeight: '600', flexShrink: 1 },
  areaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  areaRowLabel: { fontSize: 11 },
  areaRowValue: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  areaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  areaMeta: { fontSize: 10.5 },
  viewProjects: { fontSize: 11.5, fontWeight: '600' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  backBtnText: { fontSize: 12.5, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  searchGrow: { flexGrow: 1, flexBasis: 240 },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  numText: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  utilCell: { gap: 4 },
  utilText: { fontSize: 11.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  linkText: { fontSize: 12, fontWeight: '600' },
});
