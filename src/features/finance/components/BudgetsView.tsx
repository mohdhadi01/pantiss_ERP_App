import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { financeAreas, areaTotals, formatCurrency, FinanceArea, FinanceProject } from '../data';
import { budgetCategories, allocationShares } from '../budgetCategories';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';

export const BudgetsView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedArea, setSelectedArea] = useState<FinanceArea | null>(null);
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);
  const [search, setSearch] = useState('');

  const totalApproved = financeAreas.reduce((sum, area) => sum + area.approved, 0);
  const totalSpent = financeAreas.reduce((sum, area) => sum + areaTotals(area).spent, 0);

  const handleSelectArea = (area: FinanceArea) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedArea(area);
    setSelectedProject(null);
  };

  const handleSelectProject = (project: FinanceProject) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedProject(project);
  };

  return (
    <View style={styles.container}>
      {/* Back button when drilled down */}
      {(selectedArea || selectedProject) && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if (selectedProject) setSelectedProject(null);
            else setSelectedArea(null);
          }}
          style={styles.backBtn}
        >
          <Icon name="ChevronLeft" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>
            {selectedProject ? `Back to ${selectedArea?.name}` : 'All Thematic Budgets'}
          </Text>
        </Pressable>
      )}

      {/* Top Summary Banner */}
      {!selectedProject && (
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.border,
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                {selectedArea ? `${selectedArea.name} Budget` : 'Portfolio Budget Planning'}
              </Text>
              <Text style={[styles.summarySub, { color: theme.colors.textSubtle }]}>
                {selectedArea
                  ? `${selectedArea.projects.length} projects · ${formatCurrency(selectedArea.approved)} approved`
                  : `FY 2026–27 · Total Sanctioned: ${formatCurrency(totalApproved)}`}
              </Text>
            </View>
            <Badge
              label={`${Math.round((totalSpent / totalApproved) * 100)}% Utilized`}
              tone="emerald"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.kpiRow}>
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>
                APPROVED
              </Text>
              <Text style={[styles.kpiVal, { color: theme.colors.text }]}>
                {formatCurrency(selectedArea ? selectedArea.approved : totalApproved)}
              </Text>
            </View>
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>
                EXPENDITURE
              </Text>
              <Text style={[styles.kpiVal, { color: theme.colors.emerald }]}>
                {formatCurrency(selectedArea ? areaTotals(selectedArea).spent : totalSpent)}
              </Text>
            </View>
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSubtle }]}>
                AVAILABLE
              </Text>
              <Text style={[styles.kpiVal, { color: theme.colors.brandPrimary }]}>
                {formatCurrency(selectedArea ? areaTotals(selectedArea).available : totalApproved - totalSpent)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* View 1: List of Thematic Areas */}
      {!selectedArea && !selectedProject && (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Select Thematic Portfolio
          </Text>
          <View style={styles.list}>
            {financeAreas.map((area) => {
              const totals = areaTotals(area);
              return (
                <Pressable
                  key={area.id}
                  onPress={() => handleSelectArea(area)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: theme.colors.cardBg,
                      borderColor: theme.colors.border,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.areaTitleRow}>
                      <View style={[styles.areaDot, { backgroundColor: area.color }]} />
                      <Text style={[styles.areaName, { color: theme.colors.text }]}>
                        {area.name}
                      </Text>
                    </View>
                    <Icon name="ChevronRight" size={16} color={theme.colors.textSubtle} />
                  </View>

                  <View style={styles.areaFinancials}>
                    <View>
                      <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Approved</Text>
                      <Text style={[styles.finVal, { color: theme.colors.text }]}>
                        {formatCurrency(totals.approved)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Spent</Text>
                      <Text style={[styles.finVal, { color: theme.colors.emerald }]}>
                        {formatCurrency(totals.spent)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Projects</Text>
                      <Text style={[styles.finVal, { color: theme.colors.text }]}>
                        {area.projects.length}
                      </Text>
                    </View>
                  </View>

                  <ProgressBar value={totals.utilization} color={area.color} height={5} />
                  <Text style={[styles.utilText, { color: theme.colors.textSubtle }]}>
                    {totals.utilization}% utilized · {formatCurrency(totals.available)} available
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* View 2: Area Selected -> Show Projects in this Area */}
      {selectedArea && !selectedProject && (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Projects in {selectedArea.name}
          </Text>
          <View style={styles.list}>
            {selectedArea.projects.map((proj) => (
              <Pressable
                key={proj.id}
                onPress={() => handleSelectProject(proj)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.border,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    ...theme.shadows.card,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.projTitleCol}>
                    <Text style={[styles.projName, { color: theme.colors.text }]}>
                      {proj.name}
                    </Text>
                    <Text style={[styles.projSub, { color: theme.colors.textSubtle }]}>
                      {proj.id} · Donor: {proj.donor} · {proj.location}
                    </Text>
                  </View>
                  <Icon name="ArrowUpRight" size={16} color={theme.colors.brandPrimary} />
                </View>

                <View style={styles.areaFinancials}>
                  <View>
                    <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Approved</Text>
                    <Text style={[styles.finVal, { color: theme.colors.text }]}>
                      {formatCurrency(proj.approved)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Spent</Text>
                    <Text style={[styles.finVal, { color: theme.colors.emerald }]}>
                      {formatCurrency(proj.spent)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.finLabel, { color: theme.colors.textSubtle }]}>Utilization</Text>
                    <Text style={[styles.finVal, { color: theme.colors.brandPrimary }]}>
                      {proj.utilization}%
                    </Text>
                  </View>
                </View>

                <ProgressBar value={proj.utilization} height={5} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* View 3: Project Budget Line Heads Breakdown */}
      {selectedProject && (
        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                ...theme.shadows.card,
              },
            ]}
          >
            <Text style={[styles.projName, { color: theme.colors.text, fontSize: 18 }]}>
              {selectedProject.name}
            </Text>
            <Text style={[styles.projSub, { color: theme.colors.textSubtle }]}>
              ID: {selectedProject.id} · Sanctioned: {formatCurrency(selectedProject.approved)}
            </Text>

            <View style={styles.divider} />

            <Text style={[styles.budgetHeadsTitle, { color: theme.colors.text }]}>
              Budget Cost Heads Allocation
            </Text>

            <View style={styles.headsList}>
              {budgetCategories.map((cat) => {
                const share = allocationShares[cat];
                const allocated = selectedProject.approved * share;
                const spent = allocated * (selectedProject.utilization / 100);

                return (
                  <View key={cat} style={styles.headItem}>
                    <View style={styles.headTop}>
                      <Text style={[styles.headName, { color: theme.colors.text }]}>
                        {cat}
                      </Text>
                      <Text style={[styles.headAmt, { color: theme.colors.text }]}>
                        {formatCurrency(spent)} / {formatCurrency(allocated)}
                      </Text>
                    </View>
                    <ProgressBar
                      value={Math.round((spent / allocated) * 100)}
                      height={4}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiCol: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
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
    alignItems: 'center',
  },
  areaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  areaName: {
    fontSize: 15,
    fontWeight: '700',
  },
  areaFinancials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  finVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  utilText: {
    fontSize: 11,
  },
  projTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  projName: {
    fontSize: 15,
    fontWeight: '700',
  },
  projSub: {
    fontSize: 11,
    marginTop: 2,
  },
  budgetHeadsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  headsList: {
    gap: 12,
  },
  headItem: {
    gap: 4,
  },
  headTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headName: {
    fontSize: 12,
    fontWeight: '600',
  },
  headAmt: {
    fontSize: 11,
  },
});
