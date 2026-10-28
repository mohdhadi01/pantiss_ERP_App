import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import {
  financeAreas,
  portfolioTotals,
  areaTotals,
  formatCurrency,
  FinanceArea,
} from '../data';
import { MetricCard } from '../../../components/ui/MetricCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';

export interface FinanceDashboardProps {
  areaId?: string;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ areaId }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const activeArea = areaId ? financeAreas.find((a) => a.id === areaId) : undefined;

  const totals = activeArea ? areaTotals(activeArea) : portfolioTotals;
  const utilization = totals.approved ? Math.round((totals.spent / totals.approved) * 100) : 0;
  const releaseRate = totals.approved ? Math.round((totals.released / totals.approved) * 100) : 0;

  const allProjects = activeArea ? activeArea.projects : financeAreas.flatMap((a) => a.projects);
  const statusCounts = {
    onTrack: allProjects.filter((p) => p.status === 'On track').length,
    watch: allProjects.filter((p) => p.status === 'Watch').length,
    action: allProjects.filter((p) => p.status === 'Action required').length,
  };

  const handleNav = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Tax Filing Quick-Links */}
      <View style={styles.taxBar}>
        {[
          { label: 'GST Returns', desc: 'GSTR-1 & 3B compliance' },
          { label: 'TDS Filings', desc: 'Quarterly deduction desk' },
          { label: 'Input Tax Credit', desc: 'Eligible ITC claims' },
        ].map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleNav('/(finance)/taxation')}
            style={[
              styles.taxCard,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              },
            ]}
          >
            <View style={styles.taxCardTop}>
              <Text style={[styles.taxLabel, { color: theme.colors.brandPrimary }]}>
                {item.label}
              </Text>
              <Icon name="ArrowUpRight" size={13} color={theme.colors.brandPrimary} />
            </View>
            <Text style={[styles.taxDesc, { color: theme.colors.textSubtle }]}>
              {item.desc}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Hero Banner with Dark Emerald Gradient */}
      <LinearGradient
        colors={['#022c22', '#064e3b', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Icon name="CircleDollarSign" size={13} color="#34d399" />
            <Text style={styles.heroBadgeText}>FINANCE PORTFOLIO CONTROL</Text>
          </View>
          <Text style={styles.heroTitle}>Every rupee, from grant to impact.</Text>
          <Text style={styles.heroSubtitle}>
            Full visibility into approved donor budgets, fund releases, verified expenditure, and audit compliance across all portfolios.
          </Text>
        </View>

        <View style={styles.heroUtilizationBox}>
          <View style={styles.heroUtilizationRow}>
            <Text style={styles.utilLabel}>Portfolio Utilization</Text>
            <Text style={styles.utilValue}>{utilization}%</Text>
          </View>
          <View style={styles.utilTrack}>
            <View style={[styles.utilFill, { width: `${utilization}%` }]} />
          </View>
          <View style={styles.utilMetaRow}>
            <Text style={styles.utilMetaText}>{formatCurrency(totals.spent)} spent</Text>
            <Text style={styles.utilMetaText}>{formatCurrency(totals.approved)} approved</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Cumulative Financial Reserves Cards */}
      <View style={styles.reservesGrid}>
        <Pressable
          onPress={() => handleNav('/(finance)/banking')}
          style={[
            styles.reserveCard,
            {
              backgroundColor: theme.colors.cardBg,
              borderColor: 'rgba(16, 185, 129, 0.25)',
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={styles.reserveTop}>
            <View style={[styles.reserveIconBox, { backgroundColor: theme.colors.emeraldSoft }]}>
              <Icon name="Landmark" size={18} color={theme.colors.emerald} />
            </View>
            <Badge label="Banking →" tone="emerald" size="sm" />
          </View>
          <Text style={[styles.reserveValue, { color: theme.colors.text }]}>₹38.45 Cr</Text>
          <Text style={[styles.reserveLabel, { color: theme.colors.text }]}>Total Liquid Balance</Text>
          <Text style={[styles.reserveSub, { color: theme.colors.textSubtle }]}>
            Across 4 institutional bank accounts
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleNav('/(finance)/investments')}
          style={[
            styles.reserveCard,
            {
              backgroundColor: theme.colors.cardBg,
              borderColor: 'rgba(59, 130, 246, 0.25)',
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={styles.reserveTop}>
            <View style={[styles.reserveIconBox, { backgroundColor: theme.colors.brandSoft }]}>
              <Icon name="TrendingUp" size={18} color={theme.colors.brandPrimary} />
            </View>
            <Badge label="Investments →" tone="brand" size="sm" />
          </View>
          <Text style={[styles.reserveValue, { color: theme.colors.text }]}>₹4.27 Cr</Text>
          <Text style={[styles.reserveLabel, { color: theme.colors.text }]}>Total Investments</Text>
          <Text style={[styles.reserveSub, { color: theme.colors.textSubtle }]}>
            Fixed deposits & liquid mutual funds
          </Text>
        </Pressable>
      </View>

      {/* KPI 6 Grid: Approved, Released, Spent, Committed, Advances, Available */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Approved Budget"
          value={formatCurrency(totals.approved)}
          subtitle="Donor grants sanctioned"
          icon="WalletCards"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Fund Released"
          value={formatCurrency(totals.released)}
          subtitle={`${releaseRate}% release rate`}
          icon="Banknote"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="Expenditure"
          value={formatCurrency(totals.spent)}
          subtitle={`${utilization}% utilization`}
          icon="Receipt"
          accentColor={theme.colors.cyan}
        />
        <MetricCard
          label="Committed"
          value={formatCurrency(totals.committed)}
          subtitle="Purchase orders & contracts"
          icon="Clock"
          accentColor={theme.colors.amber}
        />
        <MetricCard
          label="Pending Advances"
          value={formatCurrency(totals.pendingAdvances)}
          subtitle="Settlement due"
          icon="AlertTriangle"
          accentColor={theme.colors.danger}
        />
        <MetricCard
          label="Available Balance"
          value={formatCurrency(totals.available)}
          subtitle="Uncommitted reserves"
          icon="CheckCircle2"
          accentColor={theme.colors.violet}
        />
      </View>

      {/* Portfolio Status Summary */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <Text style={[styles.statusCardTitle, { color: theme.colors.text }]}>
          Project Health Status
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.emerald }]} />
            <Text style={[styles.statusNumber, { color: theme.colors.text }]}>
              {statusCounts.onTrack}
            </Text>
            <Text style={[styles.statusTitle, { color: theme.colors.textSubtle }]}>On Track</Text>
          </View>

          <View style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.statusNumber, { color: theme.colors.text }]}>
              {statusCounts.watch}
            </Text>
            <Text style={[styles.statusTitle, { color: theme.colors.textSubtle }]}>Watch</Text>
          </View>

          <View style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.danger }]} />
            <Text style={[styles.statusNumber, { color: theme.colors.text }]}>
              {statusCounts.action}
            </Text>
            <Text style={[styles.statusTitle, { color: theme.colors.textSubtle }]}>Action Required</Text>
          </View>
        </View>
      </View>

      {/* Thematic Area Cards Grid */}
      {!activeArea && (
        <View style={styles.areasSection}>
          <Text style={[styles.areasHeaderTitle, { color: theme.colors.text }]}>
            Thematic Area Portfolios
          </Text>
          <View style={styles.areasList}>
            {financeAreas.map((area) => {
              const aTot = areaTotals(area);
              return (
                <Pressable
                  key={area.id}
                  onPress={() => handleNav(`/(finance)/projects`)}
                  style={[
                    styles.areaCard,
                    {
                      backgroundColor: theme.colors.cardBg,
                      borderColor: theme.colors.border,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.areaTop}>
                    <View style={styles.areaTitleRow}>
                      <View style={[styles.areaColorDot, { backgroundColor: area.color }]} />
                      <Text style={[styles.areaNameText, { color: theme.colors.text }]}>
                        {area.name}
                      </Text>
                    </View>
                    <Badge label={`${area.projects.length} projects`} tone="neutral" size="sm" />
                  </View>

                  <View style={styles.areaFinRow}>
                    <Text style={[styles.areaSpentText, { color: theme.colors.emerald, fontWeight: '700' }]}>
                      {formatCurrency(aTot.spent)}
                    </Text>
                    <Text style={[styles.areaTotalText, { color: theme.colors.textSubtle }]}>
                      of {formatCurrency(aTot.approved)} ({aTot.utilization}%)
                    </Text>
                  </View>

                  <ProgressBar value={aTot.utilization} color={area.color} height={5} />

                  <View style={styles.areaBottomRow}>
                    <Text style={[styles.areaAvailText, { color: theme.colors.textMuted }]}>
                      Available: {formatCurrency(aTot.available)}
                    </Text>
                    {aTot.atRisk > 0 && (
                      <Text style={[styles.areaRiskText, { color: theme.colors.danger }]}>
                        {aTot.atRisk} at risk
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
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
  taxBar: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  taxCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  taxCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  taxDesc: {
    fontSize: 10,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    gap: 18,
  },
  heroTop: {
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  heroUtilizationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  heroUtilizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  utilValue: {
    color: '#34d399',
    fontSize: 22,
    fontWeight: '700',
  },
  utilTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  utilMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilMetaText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
  reservesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  reserveCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  reserveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reserveIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  reserveLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  reserveSub: {
    fontSize: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusTitle: {
    fontSize: 11,
  },
  areasSection: {
    gap: 12,
  },
  areasHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  areasList: {
    gap: 12,
  },
  areaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  areaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  areaNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  areaFinRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  areaSpentText: {
    fontSize: 15,
  },
  areaTotalText: {
    fontSize: 11,
  },
  areaBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  areaAvailText: {
    fontSize: 11,
  },
  areaRiskText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
