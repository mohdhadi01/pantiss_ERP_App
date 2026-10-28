import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { heroGradients } from '../../../theme/gradients';
import {
  financeAreas,
  portfolioTotals,
  areaTotals,
  formatCurrency,
} from '../data';
import { useFinanceAlerts } from '../data/alertsStore';
import { HeroBanner, HeroGlassCard } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Donut } from '../../../components/ui/Donut';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';

/** Web compliance checklist (FinanceDashboard: donut 88% + 6 rows). */
const COMPLIANCE_ROWS = [
  { label: 'Bank reconciliation statements', value: 100 },
  { label: 'Voucher & supporting documents', value: 93 },
  { label: 'Advance settlement compliance', value: 72 },
  { label: 'Statutory TDS / GST filings', value: 100 },
  { label: 'Donor utilisation certificates', value: 61 },
  { label: 'Audit action-taken reports', value: 88 },
];

const TAX_SHORTCUTS = [
  { label: 'GST filing', desc: 'GSTR-1 & 3B compliance' },
  { label: 'Input tax credit tracking', desc: 'Eligible ITC claims' },
  { label: 'TDS filing (total)', desc: 'Quarterly deduction desk' },
];

export const FinanceDashboard: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { isMd } = useBreakpoint();
  const { alerts } = useFinanceAlerts();

  const utilization = useMemo(
    () => (portfolioTotals.approved ? Math.round((portfolioTotals.spent / portfolioTotals.approved) * 100) : 0),
    [],
  );

  const handleNav = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as never);
  };

  return (
    <View style={styles.container}>
      {/* Taxation shortcuts (web: 3 buttons → /finance/taxation) */}
      <View style={styles.taxBar}>
        {TAX_SHORTCUTS.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => handleNav('/(finance)/taxation')}
            style={({ pressed }) => [
              styles.taxCard,
              {
                backgroundColor: theme.colors.moduleBg,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.85 : 1,
                ...(theme.shadows.sm as object),
              },
            ]}
          >
            <View style={styles.taxCardTop}>
              <Text style={[styles.taxLabel, { color: theme.colors.financeAccent }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Icon name="ArrowUpRight" size={13} color={theme.colors.financeAccent} />
            </View>
            <Text style={[styles.taxDesc, { color: theme.colors.textSubtle }]} numberOfLines={1}>
              {item.desc}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Hero — web `from-slate-950 via-emerald-950 to-emerald-700` + glass utilization card */}
      <HeroBanner
        gradient={heroGradients.finance}
        badge={{ icon: 'CircleDollarSign', label: 'Finance portfolio control' }}
        title="Every rupee, from grant to impact."
        description="Full visibility into approved donor budgets, fund releases, verified expenditure and audit compliance across all portfolios."
        right={
          <HeroGlassCard label="Portfolio utilization">
            <AnimatedNumber value={utilization} suffix="%" style={styles.glassValue} />
            <View style={styles.glassTrack}>
              <View style={[styles.glassFill, { width: `${utilization}%` }]} />
            </View>
            <Text style={styles.glassMeta}>
              {formatCurrency(portfolioTotals.spent)} spent{'\n'}{formatCurrency(portfolioTotals.approved)} approved
            </Text>
          </HeroGlassCard>
        }
      />

      {/* Treasury & Reserves (web: Total Balance / Investments / Liabilities) */}
      <View style={styles.section}>
        <SectionLabel>Treasury &amp; Reserves</SectionLabel>
        <View style={styles.grid2}>
          {/* Sizing lives on the wrapper: Pressable is a column-flex container,
              so flexBasis on the Card itself would set its height. */}
          <Pressable onPress={() => handleNav('/(finance)/banking')} style={styles.reserveWrap}>
            <Card padding={20} style={styles.reserveCard}>
              <View style={styles.reserveTop}>
                <View style={[styles.iconTile, { backgroundColor: theme.colors.successSoft }]}>
                  <Icon name="Landmark" size={18} color={theme.colors.financeAccent} strokeWidth={1.8} />
                </View>
                <View style={[styles.linkPill, { backgroundColor: theme.colors.successSoft }]}>
                  <Text style={[styles.linkPillText, { color: theme.colors.successText }]}>Banking →</Text>
                </View>
              </View>
              <Text style={[styles.reserveValue, { color: theme.colors.text }]}>₹38.45 Cr</Text>
              <Text style={[styles.reserveLabel, { color: theme.colors.textMuted }]}>Total Balance</Text>
              <Text style={[styles.reserveSub, { color: theme.colors.textSubtle }]}>
                Across 4 institutional accounts
              </Text>
            </Card>
          </Pressable>

          <Pressable onPress={() => handleNav('/(finance)/investments')} style={styles.reserveWrap}>
            <Card padding={20} style={styles.reserveCard}>
              <View style={styles.reserveTop}>
                <View style={[styles.iconTile, { backgroundColor: theme.colors.infoSoft }]}>
                  <Icon name="TrendingUp" size={18} color={theme.colors.info} strokeWidth={1.8} />
                </View>
                <View style={[styles.linkPill, { backgroundColor: theme.colors.infoSoft }]}>
                  <Text style={[styles.linkPillText, { color: theme.colors.infoText }]}>Investments →</Text>
                </View>
              </View>
              <Text style={[styles.reserveValue, { color: theme.colors.text }]}>₹4.27 Cr</Text>
              <Text style={[styles.reserveLabel, { color: theme.colors.textMuted }]}>Total Investments</Text>
              <Text style={[styles.reserveSub, { color: theme.colors.textSubtle }]}>
                Fixed deposits &amp; liquid funds
              </Text>
            </Card>
          </Pressable>

          <Card padding={20} style={styles.reserveCard}>
            <View style={styles.reserveTop}>
              <View style={[styles.iconTile, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                <Icon name="Banknote" size={18} color={theme.colors.violet} strokeWidth={1.8} />
              </View>
            </View>
            <Text style={[styles.reserveValue, { color: theme.colors.text }]}>
              {formatCurrency(portfolioTotals.committed)}
            </Text>
            <Text style={[styles.reserveLabel, { color: theme.colors.textMuted }]}>Total Liabilities</Text>
            <Text style={[styles.reserveSub, { color: theme.colors.textSubtle }]}>
              Committed POs &amp; contracts
            </Text>
          </Card>
        </View>
      </View>

      {/* FY performance (web: Sanctions / Received / Expenditure / Corpus) */}
      <View style={styles.section}>
        <SectionLabel>FY 2026–27 Performance</SectionLabel>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Total Sanctions"
            value={formatCurrency(portfolioTotals.approved)}
            icon="FileCheck2"
            accentColor={theme.colors.financeAccent}
            arrow
          />
          <MetricCard
            label="Total Received"
            value={formatCurrency(portfolioTotals.released)}
            icon="WalletCards"
            accentColor={theme.colors.info}
            arrow
          />
          <MetricCard
            label="Total Expenditure"
            value={formatCurrency(portfolioTotals.spent)}
            valueColor={theme.colors.financeAccent}
            icon="Receipt"
            accentColor={theme.colors.warning}
            arrow
          />
          <MetricCard
            label="Total Corpus"
            value="₹5.60 Cr"
            icon="CircleDollarSign"
            accentColor={theme.colors.teal}
            arrow
          />
        </View>
      </View>

      {/* Compliance donut + Highlights (web 2-col xl, stacked below) */}
      <View style={[styles.complianceRow, isMd && styles.complianceRowWide]}>
        <Card padding={20} style={isMd ? { flex: 1 } : styles.fullWidth}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Compliance completeness</Text>
          <View style={styles.donutRow}>
            <Donut
              size={140}
              thickness={17}
              segments={[
                { value: 88, color: '#10b981' },
                { value: 6, color: '#f59e0b' },
                { value: 6, color: '#ef4444' },
              ]}
              centerContent={
                <>
                  <Text style={[styles.donutValue, { color: theme.colors.text }]}>88%</Text>
                  <Text style={[styles.donutCaption, { color: theme.colors.textSubtle }]}>overall</Text>
                </>
              }
            />
            <View style={styles.legend}>
              <LegendDot color="#10b981" label="Compliant" theme={theme} />
              <LegendDot color="#f59e0b" label="At risk" theme={theme} />
              <LegendDot color="#ef4444" label="Overdue" theme={theme} />
            </View>
          </View>
          <View style={styles.checklist}>
            {COMPLIANCE_ROWS.map((row) => (
              <View key={row.label} style={styles.checkRow}>
                <Text numberOfLines={1} style={[styles.checkLabel, { color: theme.colors.textMuted }]}>
                  {row.label}
                </Text>
                <View style={styles.checkBarTrack}>
                  <View
                    style={[
                      styles.checkBarFill,
                      {
                        width: `${row.value}%`,
                        backgroundColor:
                          row.value >= 90 ? '#10b981' : row.value >= 70 ? '#f59e0b' : '#ef4444',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.checkValue, { color: theme.colors.text }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card padding={20} style={isMd ? { flex: 1.4 } : styles.fullWidth}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Highlights</Text>
          <Text style={[styles.highlightsSub, { color: theme.colors.textMuted }]}>
            Recent activity, alerts &amp; reminders across all finance modules
          </Text>
          <View style={styles.highlights}>
            {alerts.slice(0, 7).map((alert, index) => {
              const tagColor = HIGHLIGHT_TAG_COLORS[alert.category] ?? theme.colors.info;
              return (
                <Pressable
                  key={alert.id}
                  onPress={() => handleNav('/(finance)/alerts')}
                  accessibilityRole="button"
                  accessibilityLabel={`Open alert: ${alert.title}`}
                  style={({ pressed }) => [
                    styles.highlightRow,
                    { opacity: pressed ? 0.7 : 1 },
                    index < Math.min(alerts.length, 7) - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: 'rgba(128, 144, 168, 0.14)',
                      paddingBottom: 12,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.highlightIcon,
                      { backgroundColor: `${tagColor}1A`, borderColor: `${tagColor}33` },
                    ]}
                  >
                    <Icon
                      name={
                        alert.category === 'Action Required'
                          ? 'AlertTriangle'
                          : alert.category === 'Completed'
                            ? 'CheckCircle'
                            : alert.category === 'Compliance'
                              ? 'ShieldCheck'
                              : 'Bell'
                      }
                      size={15}
                      color={tagColor}
                      strokeWidth={1.9}
                    />
                  </View>
                  <View style={styles.highlightBody}>
                    <View style={styles.highlightTitleRow}>
                      <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
                        {alert.title}
                      </Text>
                      <View style={[styles.highlightTag, { backgroundColor: `${tagColor}1A` }]}>
                        <Text style={[styles.highlightTagText, { color: tagColor }]}>
                          {alert.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.highlightDetail, { color: theme.colors.textMuted }]}>
                      {alert.body}
                    </Text>
                    <Text style={[styles.highlightTime, { color: theme.colors.textSubtle }]}>
                      {alert.time}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => handleNav('/(finance)/alerts')} style={styles.viewAll}>
            <Text style={[styles.viewAllText, { color: theme.colors.financeAccent }]}>
              View all alerts &amp; notifications
            </Text>
            <Icon name="ArrowUpRight" size={13} color={theme.colors.financeAccent} />
          </Pressable>
        </Card>
      </View>

      {/* Thematic financial scorecards (web: 8 area cards, 2-up ≥md, full-width below) */}
      <View style={styles.section}>
        <View style={styles.scorecardHeader}>
          <View style={styles.scorecardHeaderText}>
            <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
              Thematic financial scorecards
            </Text>
            <Text style={[styles.scorecardSub, { color: theme.colors.textMuted }]}>
              Select a thematic area to review every project and transaction-level control
            </Text>
          </View>
          <View style={[styles.fyPill, { borderColor: `${theme.colors.financeAccent}55` }]}>
            <Text style={[styles.fyPillText, { color: theme.colors.financeAccent }]}>
              FY 2026–27 · Updated 03 Aug
            </Text>
          </View>
        </View>
        <View style={styles.grid2}>
          {financeAreas.map((area) => {
            const totals = areaTotals(area);
            return (
              <Pressable
                key={area.id}
                onPress={() => handleNav(`/(finance)/projects?area=${area.id}`)}
                style={[styles.areaWrap, !isMd && styles.areaWrapMobile]}
              >
                <Card padding={18} style={styles.areaCard}>
                  <View style={styles.areaHeader}>
                    <View style={[styles.areaTile, { backgroundColor: area.color }]}>
                      <Icon name="Landmark" size={20} color="#ffffff" strokeWidth={1.9} />
                    </View>
                    <View style={styles.areaHeaderText}>
                      <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>
                        {area.name}
                      </Text>
                      <Text style={[styles.areaProjects, { color: theme.colors.textSubtle }]}>
                        {area.projects.length} active projects
                      </Text>
                    </View>
                    <Icon name="ArrowUpRight" size={15} color={theme.colors.textSubtle} />
                  </View>
                  <View style={styles.areaMetrics}>
                    <AreaMetricBox
                      value={formatCurrency(totals.approved)}
                      label="Approved"
                      theme={theme}
                    />
                    <AreaMetricBox
                      value={formatCurrency(totals.released)}
                      label="Released"
                      sub={`/ ${formatCurrency(totals.approved)} target`}
                      theme={theme}
                    />
                    <AreaMetricBox value={formatCurrency(totals.spent)} label="Spent" theme={theme} />
                    <AreaMetricBox
                      value={formatCurrency(totals.available)}
                      label="Available"
                      theme={theme}
                    />
                  </View>
                  <View style={styles.areaBarRow}>
                    <View style={styles.areaBarTrack}>
                      <ProgressBar value={totals.utilization} color={area.color} height={6} />
                    </View>
                    <Text style={[styles.areaUtilized, { color: theme.colors.textMuted }]}>
                      {totals.utilization}% utilized
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const HIGHLIGHT_TAG_COLORS: Record<string, string> = {
  'Action Required': '#ef4444',
  Compliance: '#f59e0b',
  Approvals: '#3b82f6',
  Investments: '#3b82f6',
  Budget: '#f59e0b',
  Salary: '#14b8a6',
  Completed: '#10b981',
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{children}</Text>
  );
};

const LegendDot: React.FC<{ color: string; label: string; theme: ReturnType<typeof useTheme>['theme'] }> = ({
  color,
  label,
  theme,
}) => (
  <View style={styles.legendRow}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>{label}</Text>
  </View>
);

const AreaMetricBox: React.FC<{
  label: string;
  value: string;
  sub?: string;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ label, value, sub, theme }) => (
  <View style={[styles.areaMetric, { borderColor: theme.colors.border }]}>
    <Text numberOfLines={1} style={[styles.areaMetricValue, { color: theme.colors.text }]}>
      {value}
    </Text>
    {sub ? (
      <Text numberOfLines={1} style={[styles.areaMetricSub, { color: theme.colors.textSubtle }]}>
        {sub}
      </Text>
    ) : null}
    <Text style={[styles.areaMetricLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  fullWidth: {
    width: '100%',
  },
  taxBar: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  taxCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    padding: 13,
    gap: 4,
  },
  taxCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  taxLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  taxDesc: {
    fontSize: 10.5,
  },
  glassValue: {
    color: '#6ee7b7',
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.8,
  },
  glassTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  glassFill: {
    height: '100%',
    backgroundColor: '#6ee7b7',
    borderRadius: 3,
  },
  glassMeta: {
    color: 'rgba(209, 250, 229, 0.65)',
    fontSize: 10,
    lineHeight: 14,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reserveWrap: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  reserveCard: {
    gap: 4,
  },
  reserveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  linkPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reserveValue: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.7,
    fontVariant: ['tabular-nums'],
  },
  reserveLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  reserveSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  complianceRow: {
    gap: 12,
  },
  complianceRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    marginTop: 16,
    marginBottom: 18,
  },
  donutValue: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  donutCaption: {
    fontSize: 10.5,
  },
  legend: {
    gap: 9,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11.5,
  },
  checklist: {
    gap: 9,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkLabel: {
    fontSize: 11.5,
    width: 190,
    flexShrink: 1,
  },
  checkBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128, 144, 168, 0.18)',
    overflow: 'hidden',
  },
  checkBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checkValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  highlightsSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  highlights: {
    gap: 12,
    marginTop: 14,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  highlightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  highlightTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  highlightTagText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  highlightDetail: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  highlightTime: {
    fontSize: 10.5,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 144, 168, 0.18)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  areaWrap: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  areaWrapMobile: {
    flexBasis: '100%',
  },
  scorecardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  scorecardHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  scorecardSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  fyPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fyPillText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  areaCard: {
    gap: 14,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  areaTile: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  areaName: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  areaProjects: {
    fontSize: 11,
  },
  areaMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaMetric: {
    flexGrow: 1,
    flexBasis: '46%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  areaMetricValue: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  areaMetricSub: {
    fontSize: 10.5,
    fontVariant: ['tabular-nums'],
  },
  areaMetricLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  areaBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  areaBarTrack: {
    flex: 1,
  },
  areaUtilized: {
    fontSize: 11.5,
    fontWeight: '500',
  },
});
