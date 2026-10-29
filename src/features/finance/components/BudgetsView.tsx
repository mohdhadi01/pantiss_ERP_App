import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { financeAreas, areaTotals, formatCurrency, FinanceArea, FinanceProject } from '../data';
import { budgetCategories, allocationShares } from '../budgetCategories';
import { formatRupees } from '../../../utils/formatCurrency';
import { heroGradients } from '../../../theme/gradients';
import { useBudgetDrafts } from '../data/budgetDraftsStore';
import { HeroBanner } from './HeroBanner';
import { BudgetWorkflowSection } from './BudgetParts';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface CostHeadRow {
  id: number;
  name: string;
  qty: string;
  rate: string;
}

const budgetVersion = (project: FinanceProject): { label: string; tone: 'neutral' | 'info' | 'warning' | 'success' } => {
  if (project.utilization < 60) return { label: 'Draft', tone: 'neutral' };
  if (project.status === 'On track') return { label: 'Approved', tone: 'success' };
  if (project.status === 'Watch') return { label: 'Pending approval', tone: 'info' };
  return { label: 'Changes requested', tone: 'warning' };
};

export const BudgetsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { drafts, addDraft, submitForApproval, returnForRevision, approveBudget } = useBudgetDrafts();
  const [selectedArea, setSelectedArea] = useState<FinanceArea | null>(null);
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [areaId, setAreaId] = useState(financeAreas[0].id);
  const [projectId, setProjectId] = useState(financeAreas[0].projects[0].id);
  const [title, setTitle] = useState('');
  const [funding, setFunding] = useState('NSDC');
  const [fy, setFy] = useState('FY 2026–27');
  const [currency, setCurrency] = useState('INR - Indian Rupee');
  const [tracking, setTracking] = useState('Based on project amount');
  const [threshold, setThreshold] = useState('85');
  const [notes, setNotes] = useState('');
  const [costHeads, setCostHeads] = useState<CostHeadRow[]>([
    { id: 1, name: 'Training delivery', qty: '4', rate: '125000' },
  ]);

  const summary = useMemo(() => {
    const approved = financeAreas.reduce((sum, area) => sum + area.approved, 0);
    const spent = financeAreas.reduce((sum, area) => sum + areaTotals(area).spent, 0);
    const projects = financeAreas.reduce((sum, area) => sum + area.projects.length, 0);
    const revisions = 6 + drafts.length;
    return { approved, spent, projects, revisions, utilization: Math.round((spent / approved) * 100) };
  }, [drafts.length]);

  const totalPlanned = useMemo(
    () => costHeads.reduce((sum, r) => sum + (parseFloat(r.qty) || 0) * (parseFloat(r.rate) || 0), 0),
    [costHeads],
  );

  const showNotice = React.useCallback((message: string) => {
    setNotice(message);
  }, []);
  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const areaOptions = financeAreas.map((a) => ({ value: a.id, label: a.name }));
  const projectOptions = (financeAreas.find((a) => a.id === areaId) ?? financeAreas[0]).projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const handleSelectArea = (area: FinanceArea) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedArea(area);
    setSelectedProject(null);
  };

  const handleSelectProject = (project: FinanceProject) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedProject(project);
  };

  const handleSaveDraft = async () => {
    const area = financeAreas.find((a) => a.id === areaId);
    const project = area?.projects.find((p) => p.id === projectId);
    if (!area || !project) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const draft = await addDraft({
      areaId,
      projectId,
      title: title.trim() || 'Annual operating budget · Version 2.0',
      fiscalYear: fy,
      fundingSource: funding.trim() || project.donor,
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      currency,
      trackingMethod: tracking,
      threshold,
      notes,
      lines: costHeads.map((row) => ({
        name: row.name.trim() || 'Cost head',
        quantity: parseFloat(row.qty) || 0,
        rate: parseFloat(row.rate) || 0,
      })),
    });
    setCreateOpen(false);
    setTitle('');
    setNotes('');
    setSelectedArea(area);
    setSelectedProject(project);
    showNotice(`Draft "${draft.title}" saved — move it through approval in Budget documents and workflow.`);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (selectedProject) setSelectedProject(null);
    else setSelectedArea(null);
  };

  return (
    <View style={styles.container}>
      {(selectedArea || selectedProject) && (
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Icon name="ChevronLeft" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>
            {selectedProject ? `${selectedArea?.name} projects` : 'All thematic budgets'}
          </Text>
        </Pressable>
      )}

      {notice ? (
        <Card padding={12} flat style={styles.noticeBar}>
          <Text style={[styles.noticeText, { color: theme.colors.successText }]}>{notice}</Text>
        </Card>
      ) : null}

      <HeroBanner
        gradient={heroGradients.finance}
        badge={{ icon: 'WalletCards', label: 'Budget control' }}
        title="Portfolio budgets"
        description="Approved allocations, verified expenditure and revision pipelines across thematic portfolios."
        actions={[{ label: 'Create budget', icon: 'Plus', variant: 'white', onPress: () => setCreateOpen(true) }]}
      />

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Approved budget" value={formatCurrency(summary.approved)} subtitle={`${financeAreas.length} areas · ${summary.projects} projects`} icon="WalletCards" accentColor={theme.colors.financeAccent} arrow />
        <MetricCard style={styles.metricCard} label="Verified expenditure" value={formatCurrency(summary.spent)} subtitle={`${summary.utilization}% utilized`} icon="Receipt" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Budget revisions" value={String(summary.revisions)} subtitle="Draft and awaiting approval" icon="History" accentColor={theme.colors.warning} arrow />
        <MetricCard style={styles.metricCard} label="Unallocated reserve" value="₹42.0 L" subtitle="2.7% of portfolio" icon="CircleDollarSign" accentColor={theme.colors.violet} arrow />
      </View>

      {!selectedArea && !selectedProject && (
        <View style={styles.section}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Select a thematic area</Text>
          <View style={[styles.grid, isMd && { flexWrap: 'nowrap' }]}>
            {financeAreas.map((area) => {
              const totals = areaTotals(area);
              return (
                <Pressable key={area.id} onPress={() => handleSelectArea(area)} style={styles.areaCardWrap}>
                  <Card padding={18} style={styles.areaCard}>
                    <View style={styles.areaTitleRow}>
                      <View style={[styles.areaDot, { backgroundColor: area.color }]} />
                      <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{area.name}</Text>
                    </View>
                    <View style={styles.areaCounts}>
                      <View>
                        <Text style={[styles.countValue, { color: theme.colors.text }]}>{formatCurrency(totals.approved)}</Text>
                        <Text style={[styles.countLabel, { color: theme.colors.textSubtle }]}>Approved</Text>
                      </View>
                      <View>
                        <Text style={[styles.countValue, { color: theme.colors.text }]}>{area.projects.length}</Text>
                        <Text style={[styles.countLabel, { color: theme.colors.textSubtle }]}>Projects</Text>
                      </View>
                    </View>
                    <ProgressBar value={totals.utilization} color={area.color} height={6} />
                    <Text style={[styles.utilText, { color: theme.colors.textMuted }]}>
                      {totals.utilization}% utilized · {formatCurrency(totals.available)} available
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {selectedArea && !selectedProject && (
        <View style={styles.section}>
          {(() => {
            const areaTotalsLocal = areaTotals(selectedArea);
            return (
              <>
                <HeroBanner
                  gradient={heroGradients.finance}
                  badge={{ icon: 'WalletCards', label: 'Thematic project budgets' }}
                  title={selectedArea.name}
                  description={`${selectedArea.projects.length} projects · ${formatCurrency(areaTotalsLocal.approved)} approved`}
                  actions={[{ label: 'Create project budget', icon: 'Plus', variant: 'white', onPress: () => setCreateOpen(true) }]}
                />
                <View style={styles.metricsGrid}>
                  <MetricCard style={styles.metricCard} label="Approved" value={formatCurrency(areaTotalsLocal.approved)} icon="WalletCards" accentColor={theme.colors.financeAccent} />
                  <MetricCard style={styles.metricCard} label="Spent" value={formatCurrency(areaTotalsLocal.spent)} icon="Receipt" accentColor={theme.colors.info} />
                  <MetricCard style={styles.metricCard} label="Available" value={formatCurrency(areaTotalsLocal.available)} icon="CircleDollarSign" accentColor={theme.colors.violet} />
                </View>
              </>
            );
          })()}
          <View style={styles.listSectionHead}>
            <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Projects</Text>
            <Text style={[styles.listSectionSub, { color: theme.colors.textSubtle }]}>
              Select a project to inspect detailed budget lines
            </Text>
          </View>
          <View style={styles.list}>
            {selectedArea.projects.map((proj) => {
              const version = budgetVersion(proj);
              return (
                <Pressable key={proj.id} onPress={() => handleSelectProject(proj)}>
                  <Card padding={16} style={styles.projectCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.projTitleCol}>
                        <Text style={[styles.projName, { color: theme.colors.text }]}>{proj.name}</Text>
                        <Text style={[styles.projSub, { color: theme.colors.textSubtle }]}>
                          {proj.id} · Donor: {proj.donor} · {proj.location}
                        </Text>
                      </View>
                      <StatusChip status={version.label} tone={version.tone} />
                    </View>
                    <View style={styles.finRow}>
                      <FinCell label="Approved" value={formatCurrency(proj.approved)} />
                      <FinCell label="Spent" value={formatCurrency(proj.spent)} accent={theme.colors.emerald} />
                      <FinCell label="Balance" value={formatCurrency(Math.max(0, proj.approved - proj.spent))} />
                      <FinCell label="Utilization" value={`${proj.utilization}%`} accent={theme.colors.brandPrimary} />
                    </View>
                    <ProgressBar value={proj.utilization} height={5} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {selectedProject && (
        <Card padding={20}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.projName, { color: theme.colors.text, fontSize: 18 }]}>{selectedProject.name}</Text>
              <Text style={[styles.projSub, { color: theme.colors.textSubtle }]}>
                ID: {selectedProject.id} · Sanctioned: {formatCurrency(selectedProject.approved)}
              </Text>
            </View>
            <StatusChip status={budgetVersion(selectedProject).label} tone={budgetVersion(selectedProject).tone} />
          </View>
          <Text style={[styles.headsTitle, { color: theme.colors.text }]}>Budget Cost Heads Allocation</Text>
          <View style={styles.headsList}>
            {budgetCategories.map((cat) => {
              const allocated = selectedProject.approved * allocationShares[cat];
              const spent = allocated * (selectedProject.utilization / 100);
              return (
                <View key={cat} style={styles.headItem}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.headName, { color: theme.colors.text }]}>{cat}</Text>
                    <Text style={[styles.headAmt, { color: theme.colors.textMuted }]} numberOfLines={1}>
                      {formatCurrency(spent)} / {formatCurrency(allocated)}
                    </Text>
                  </View>
                  <ProgressBar value={Math.round((spent / allocated) * 100)} height={4} />
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {selectedProject && (
        <BudgetWorkflowSection
          area={financeAreas.find((a) => a.id === selectedProject.areaId) ?? selectedArea ?? financeAreas[0]}
          project={selectedProject}
          drafts={drafts.filter((draft) => draft.projectId === selectedProject.id)}
          onSubmit={submitForApproval}
          onReturn={(id) => returnForRevision(id)}
          onApprove={approveBudget}
          onNotify={showNotice}
        />
      )}

      <ModalSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        label="Budget planning"
        title="New project budget"
        description="Draft a donor-aligned budget against an approved project."
        size="lg"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setCreateOpen(false)} />
            <Button label="Save as draft" variant="emerald" onPress={handleSaveDraft} />
          </>
        }
      >
        <View style={isMd ? styles.formRow : undefined}>
          <SelectField label="Thematic area" value={areaId} onChange={(v) => { setAreaId(v); setProjectId(financeAreas.find((a) => a.id === v)?.projects[0].id ?? ''); }} options={areaOptions} containerStyle={isMd ? styles.formRowItem : undefined} />
          <SelectField label="Project" value={projectId} onChange={setProjectId} options={projectOptions} containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <TextField label="Budget title" value={title} onChangeText={setTitle} placeholder="e.g. PMKVY 4.0 FY 2026–27 delivery budget" />
        <TextField label="Funding source" value={funding} onChangeText={setFunding} placeholder="Donor / CSR partner" />
        <View style={isMd ? styles.formRow : undefined}>
          <SelectField label="Financial year" value={fy} onChange={setFy} options={[{ value: 'FY 2026–27', label: 'FY 2026–27' }, { value: 'FY 2027–28', label: 'FY 2027–28' }]} containerStyle={isMd ? styles.formRowItem : undefined} />
          <SelectField label="Currency" value={currency} onChange={setCurrency} options={[{ value: 'INR - Indian Rupee', label: 'INR - Indian Rupee' }, { value: 'USD - US Dollar', label: 'USD - US Dollar' }]} containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <View style={isMd ? styles.formRow : undefined}>
          <SelectField
            label="Tracking method"
            value={tracking}
            onChange={setTracking}
            options={[
              { value: 'Based on project amount', label: 'Based on project amount' },
              { value: 'Based on phases', label: 'Based on phases' },
              { value: 'Based on cost heads', label: 'Based on cost heads' },
            ]}
            containerStyle={isMd ? styles.formRowItem : undefined}
          />
          <TextField label="Alert threshold (%)" value={threshold} onChangeText={setThreshold} keyboardType="numeric" suffix="%" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>

        <View style={styles.costHeadBlock}>
          <View style={styles.costHeadHeaderRow}>
            <Text style={[styles.costHeadTitle, { color: theme.colors.text }]}>Cost heads</Text>
            <Text style={[styles.costHeadCount, { color: theme.colors.textSubtle }]}>
              {costHeads.length} {costHeads.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {costHeads.map((row, idx) =>
            !isMd ? (
              <View
                key={row.id}
                style={[
                  styles.costHeadCard,
                  { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.costHeadCardHeader}>
                  <Text style={[styles.costHeadNumber, { color: theme.colors.textSubtle }]}>
                    #{String(idx + 1).padStart(2, '0')}
                  </Text>
                  <Pressable
                    onPress={() => setCostHeads((rows) => rows.filter((r) => r.id !== row.id))}
                    hitSlop={8}
                    style={styles.deleteHeadBtn}
                    accessibilityLabel={`Remove ${row.name || 'cost head'}`}
                  >
                    <Icon name="Trash2" size={15} color={theme.colors.dangerText} />
                  </Pressable>
                </View>

                <TextField
                  label="Cost head name"
                  value={row.name}
                  onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, name: t } : r)))}
                  placeholder="e.g. Training venue, kits, travel"
                />

                <View style={styles.costHeadInputsRow}>
                  <TextField
                    label="Qty"
                    value={row.qty}
                    onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, qty: t } : r)))}
                    keyboardType="numeric"
                    placeholder="1"
                    containerStyle={styles.costHeadQtyInput}
                  />
                  <TextField
                    label="Rate (₹)"
                    value={row.rate}
                    onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, rate: t } : r)))}
                    keyboardType="numeric"
                    placeholder="0"
                    containerStyle={styles.costHeadRateInput}
                  />
                </View>

                <View style={[styles.costHeadTotalRow, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.costHeadTotalLabel, { color: theme.colors.textSubtle }]}>Line Total</Text>
                  <Text numberOfLines={1} style={[styles.costHeadTotalValue, { color: theme.colors.financeAccent }]}>
                    {formatRupees((parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0))}
                  </Text>
                </View>
              </View>
            ) : (
              <View key={row.id} style={styles.costHeadRowWide}>
                <TextField
                  value={row.name}
                  onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, name: t } : r)))}
                  placeholder="Cost head name"
                  containerStyle={{ flex: 2 }}
                />
                <TextField
                  value={row.qty}
                  onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, qty: t } : r)))}
                  keyboardType="numeric"
                  placeholder="Qty"
                  containerStyle={{ flex: 0.7 }}
                />
                <TextField
                  value={row.rate}
                  onChangeText={(t) => setCostHeads((rows) => rows.map((r) => (r.id === row.id ? { ...r, rate: t } : r)))}
                  keyboardType="numeric"
                  placeholder="Rate ₹"
                  containerStyle={{ flex: 1 }}
                />
                <View style={styles.costHeadAmountWide}>
                  <Text style={[styles.costHeadTotal, { color: theme.colors.text }]}>
                    {formatRupees((parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0))}
                  </Text>
                  <Pressable
                    onPress={() => setCostHeads((rows) => rows.filter((r) => r.id !== row.id))}
                    hitSlop={8}
                    style={styles.deleteHeadBtn}
                    accessibilityLabel={`Remove ${row.name || 'cost head'}`}
                  >
                    <Icon name="Trash2" size={15} color={theme.colors.dangerText} />
                  </Pressable>
                </View>
              </View>
            ),
          )}

          <View style={[styles.budgetTotalBanner, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.budgetTotalLabel, { color: theme.colors.textSubtle }]}>TOTAL PLANNED BUDGET</Text>
              <Text style={[styles.budgetTotalValue, { color: theme.colors.financeAccent }]}>
                {formatRupees(totalPlanned)}
              </Text>
            </View>
            <Button
              label="Add cost head"
              icon="Plus"
              variant="outline"
              size="sm"
              onPress={() => setCostHeads((rows) => [...rows, { id: Date.now(), name: '', qty: '1', rate: '' }])}
            />
          </View>
        </View>

        <TextField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Donor conditions, reporting cadence, remarks…" />
      </ModalSheet>
    </View>
  );
};

const FinCell: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.finCell}>
      <Text numberOfLines={1} style={[styles.finValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
      <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  backBtnText: { fontSize: 13, fontWeight: '600' },
  noticeBar: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)', backgroundColor: 'rgba(16, 185, 129, 0.08)' },
  noticeText: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  listSectionHead: { gap: 3, marginTop: 4 },
  listSectionSub: { fontSize: 12, lineHeight: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  areaCard: { gap: 10 },
  areaCardWrap: { flexGrow: 1, flexBasis: 280 },
  areaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  areaDot: { width: 8, height: 8, borderRadius: 4 },
  areaName: { fontSize: 13.5, fontWeight: '600', flexShrink: 1 },
  areaCounts: { flexDirection: 'row', gap: 22 },
  countValue: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  countLabel: { fontSize: 10 },
  utilText: { fontSize: 10.5 },
  list: { gap: 12 },
  projectCard: { gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  projTitleCol: { flex: 1, minWidth: 0 },
  projName: { fontSize: 15, fontWeight: '700' },
  projSub: { fontSize: 11, marginTop: 2 },
  finRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  finCell: { flexGrow: 1, flexBasis: 90 },
  finValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  finLabel: { fontSize: 9.5, marginTop: 1 },
  headsTitle: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  headsList: { gap: 12 },
  headItem: { gap: 7, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128, 144, 168, 0.12)' },
  headName: { fontSize: 12.5, fontWeight: '600' },
  headAmtWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' },
  headAmt: { fontSize: 11, fontVariant: ['tabular-nums'] },
  formRow: { flexDirection: 'row', gap: 12 },
  formRowItem: { flex: 1 },
  costHeadBlock: { gap: 12 },
  costHeadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costHeadTitle: { fontSize: 13.5, fontWeight: '700' },
  costHeadCount: { fontSize: 11.5 },
  costHeadCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  costHeadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costHeadNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteHeadBtn: {
    padding: 6,
  },
  costHeadInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  costHeadQtyInput: {
    flex: 1,
  },
  costHeadRateInput: {
    flex: 1.5,
  },
  costHeadTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  costHeadTotalLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  costHeadTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  costHeadRowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  costHeadAmountWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 130,
    justifyContent: 'flex-end',
  },
  costHeadTotal: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  budgetTotalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  budgetTotalLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  budgetTotalValue: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
});
