import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { financeAreas, areaTotals, formatCurrency, FinanceProject } from '../data';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner, HeroGlassCard } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SectionCard } from '../../../components/ui/Card';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon, IconSource } from '../../../components/ui/Icon';
import { MonthlyOverview, ProjectLedgerSheet } from './AreaFinanceParts';

/**
 * Web AreaFinanceDashboard (FinanceDashboard.tsx:743-776) — the thematic
 * drill-down reached from the portfolio scorecards via /(finance)/area/{id}.
 */

interface AreaKpi {
  label: string;
  value: string;
  note: string;
  icon: IconSource;
  accent: string;
}

const PROJECT_COLUMNS: Array<DataColumn<FinanceProject>> = [
  { key: 'project', label: 'Project', flex: 2 },
  { key: 'approved', label: 'Approved', flex: 1.1 },
  { key: 'released', label: 'Released', flex: 1.1, wideOnly: true },
  { key: 'spent', label: 'Spent', flex: 1.1, wideOnly: true },
  { key: 'corpus', label: 'Corpus', flex: 1.3 },
  { key: 'available', label: 'Available', flex: 1.1 },
  { key: 'advances', label: 'Advances', flex: 1, wideOnly: true },
  { key: 'utilization', label: 'Utilization', flex: 1.2, wideOnly: true },
  { key: 'status', label: 'Status', flex: 1.1 },
  { key: 'action', label: 'Action', flex: 1, align: 'right' },
];

export const AreaFinanceDashboard: React.FC<{ areaId: string }> = ({ areaId }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const area = financeAreas.find((item) => item.id === areaId);
  const [ledgerProject, setLedgerProject] = useState<FinanceProject | null>(null);

  const sortedProjects = useMemo(
    () => (area ? [...area.projects].sort((a, b) => b.approved - a.approved) : []),
    [area],
  );

  if (!area) {
    return (
      <View style={styles.missing}>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Thematic area not found</Text>
        <Text style={[styles.missingSub, { color: theme.colors.textMuted }]}>
          The requested thematic finance dashboard does not exist.
        </Text>
      </View>
    );
  }

  const totals = areaTotals(area);
  const kpis: AreaKpi[] = [
    { label: 'Approved budget', value: formatCurrency(totals.approved), note: `${area.projects.length} projects`, icon: 'Landmark', accent: theme.colors.financeAccent },
    { label: 'Funds released', value: formatCurrency(totals.released), note: 'Achieved / Target · Approved budget', icon: 'WalletCards', accent: theme.colors.info },
    { label: 'Verified expenditure', value: formatCurrency(totals.spent), note: `${totals.utilization}% utilization`, icon: 'Receipt', accent: theme.colors.warning },
    { label: 'Contribution to corpus', value: formatCurrency(totals.released * 0.5), note: 'Estimated · 50% of released funds', icon: 'CircleDollarSign', accent: theme.colors.teal },
    { label: 'Available balance', value: formatCurrency(totals.available), note: 'Net of commitments', icon: 'Banknote', accent: theme.colors.violet },
    { label: 'Pending advances', value: formatCurrency(totals.pendingAdvances), note: 'Settlement evidence due', icon: 'Clock3', accent: theme.colors.warning },
    { label: 'Action required', value: String(totals.atRisk), note: 'Projects outside threshold', icon: 'AlertTriangle', accent: theme.colors.danger },
    { label: 'Voucher compliance', value: '93%', note: 'Complete supporting records', icon: 'ShieldCheck', accent: theme.colors.financeAccent },
  ];

  const renderProjectCell = (project: FinanceProject, col: DataColumn<FinanceProject>) => {
    const available = Math.max(0, project.approved - project.spent - project.committed);
    switch (col.key) {
      case 'project':
        return (
          <View style={styles.cellProject}>
            <Text numberOfLines={1} style={[styles.cellName, { color: theme.colors.text }]}>{project.name}</Text>
            <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
              {project.id} · {project.donor} · {project.location}
            </Text>
          </View>
        );
      case 'approved':
        return <Text style={[styles.cellValue, { color: theme.colors.text }]}>{formatCurrency(project.approved)}</Text>;
      case 'released':
        return <Text style={[styles.cellSubValue, { color: theme.colors.textMuted }]}>{formatCurrency(project.released)}</Text>;
      case 'spent':
        return <Text style={[styles.cellSubValue, { color: theme.colors.textMuted }]}>{formatCurrency(project.spent)}</Text>;
      case 'corpus':
        return (
          <View>
            <Text style={[styles.cellSubValue, { color: theme.colors.textMuted }]}>{formatCurrency(project.released * 0.5)}</Text>
            <Text style={[styles.cellTiny, { color: theme.colors.textSubtle }]}>Estimated · 50% of released</Text>
          </View>
        );
      case 'available':
        return <Text style={[styles.cellValue, { color: theme.colors.successText }]}>{formatCurrency(available)}</Text>;
      case 'advances':
        return <Text style={[styles.cellSubValue, { color: theme.colors.textMuted }]}>{formatCurrency(project.pendingAdvances)}</Text>;
      case 'utilization':
        return (
          <View style={styles.utilCell}>
            <View style={styles.utilTrack}>
              <ProgressBar value={project.utilization} height={5} color={theme.colors.success} />
            </View>
            <Text style={[styles.utilText, { color: theme.colors.textMuted }]}>{project.utilization}%</Text>
          </View>
        );
      case 'status':
        return <StatusChip status={project.status} />;
      case 'action':
        return (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setLedgerProject(project);
            }}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`View ledger for ${project.name}`}
            style={({ pressed }) => [styles.ledgerBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.ledgerBtnText, { color: theme.colors.financeAccent }]}>View ledger</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/(finance)/dashboard')}
        accessibilityRole="link"
        style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Icon name="ArrowLeft" size={16} color={theme.colors.textMuted} />
        <Text style={[styles.backLinkText, { color: theme.colors.textMuted }]}>Back to overall finances</Text>
      </Pressable>

      <HeroBanner
        gradient={heroGradients.finance}
        badge={{ icon: 'CircleDollarSign', label: 'Thematic finance dashboard' }}
        title={area.name}
        description="Project-wise budget control, fund-flow visibility, verified expenditure, commitments and compliance exceptions."
        right={
          <HeroGlassCard label="Budget utilized">
            <AnimatedNumber value={totals.utilization} suffix="%" style={styles.glassValue} />
            <View style={styles.glassTrack}>
              <View style={[styles.glassFill, { width: `${totals.utilization}%` }]} />
            </View>
          </HeroGlassCard>
        }
      />

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            style={styles.kpiCard}
            label={kpi.label}
            value={kpi.value}
            subtitle={kpi.note}
            icon={kpi.icon}
            accentColor={kpi.accent}
            arrow
          />
        ))}
      </View>

      <MonthlyOverview key={area.id} area={area} />

      <SectionCard
        title="Project-wise financial details"
        description={`Approved, released, spent, estimated corpus contributions and unsettled amounts for every ${area.name} project`}
      >
        <DataTable
          columns={PROJECT_COLUMNS}
          rows={sortedProjects}
          keyExtractor={(project) => project.id}
          renderCell={renderProjectCell}
          renderMobileCard={(project) => {
            const available = Math.max(0, project.approved - project.spent - project.committed);
            return (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.mobileCardTop}>
                  <View style={styles.cellProject}>
                    <Text numberOfLines={1} style={[styles.cellName, { color: theme.colors.text }]}>{project.name}</Text>
                    <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {project.id} · {project.donor} · {project.location}
                    </Text>
                  </View>
                  <StatusChip status={project.status} />
                </View>
                <View style={styles.mobileMetrics}>
                  <View style={styles.mobileMetric}>
                    <Text style={[styles.cellValue, { color: theme.colors.text }]}>{formatCurrency(project.approved)}</Text>
                    <Text style={[styles.cellTiny, { color: theme.colors.textSubtle }]}>Approved</Text>
                  </View>
                  <View style={styles.mobileMetric}>
                    <Text style={[styles.cellValue, { color: theme.colors.text }]}>{formatCurrency(project.released * 0.5)}</Text>
                    <Text style={[styles.cellTiny, { color: theme.colors.textSubtle }]}>Corpus · 50% of released</Text>
                  </View>
                  <View style={styles.mobileMetric}>
                    <Text style={[styles.cellValue, { color: theme.colors.successText }]}>{formatCurrency(available)}</Text>
                    <Text style={[styles.cellTiny, { color: theme.colors.textSubtle }]}>Available</Text>
                  </View>
                </View>
                <View style={styles.utilCell}>
                  <View style={styles.utilTrack}>
                    <ProgressBar value={project.utilization} height={5} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.utilText, { color: theme.colors.textMuted }]}>{project.utilization}% utilized</Text>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setLedgerProject(project);
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.mobileLedgerBtn,
                    { opacity: pressed ? 0.8 : 1, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.ledgerBtnText, { color: theme.colors.financeAccent }]}>View ledger</Text>
                  <Icon name="ArrowUpRight" size={13} color={theme.colors.financeAccent} />
                </Pressable>
              </View>
            );
          }}
          emptyIcon="FolderKanban"
          emptyTitle="No projects in this area"
          emptyDescription="This thematic area has no sanctioned projects yet."
        />
        <Text style={[styles.tableFootnote, { color: theme.colors.textSubtle }]}>
          Open a ledger for component-wise expenditure and its audit trail
        </Text>
      </SectionCard>

      {ledgerProject ? (
        <ProjectLedgerSheet project={ledgerProject} onClose={() => setLedgerProject(null)} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 18 },
  missing: { gap: 6, paddingVertical: 30, alignItems: 'center' },
  missingSub: { fontSize: 12.5 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 4 },
  backLinkText: { fontSize: 12.5, fontWeight: '500' },
  glassValue: { color: '#6ee7b7', fontSize: 26, fontWeight: '600', letterSpacing: -0.8 },
  glassTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  glassFill: { height: '100%', backgroundColor: '#6ee7b7', borderRadius: 3 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { flexGrow: 1, flexBasis: '46%', minWidth: 150 },
  cellProject: { flex: 1, minWidth: 0, gap: 2 },
  cellName: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 10.5 },
  cellValue: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  cellSubValue: { fontSize: 12, fontVariant: ['tabular-nums'] },
  cellTiny: { fontSize: 9.5, marginTop: 1 },
  utilCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  utilTrack: { width: 56 },
  utilText: { fontSize: 10.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ledgerBtn: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  ledgerBtnText: { fontSize: 11, fontWeight: '600' },
  mobileCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  mobileCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  mobileMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mobileMetric: { flexGrow: 1, flexBasis: '30%', minWidth: 100, gap: 1 },
  mobileLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  tableFootnote: { fontSize: 10.5, marginTop: 10 },
});
