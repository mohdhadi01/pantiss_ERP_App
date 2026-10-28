import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useSalaryRecords } from '../../finance/useSalaryRecords';
import { payrollMonths, salaryMoney, salaryMonthLabel, isFinanceEligible } from '../../finance/salaryData';
import { financeAreas } from '../../finance/data';
import { HRState } from '../types';
import { attendanceIssue } from '../helpers';
import { reviewYears, leaves } from '../constants';
import { MetricCard } from '../../../components/ui/MetricCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Icon } from '../../../components/ui/Icon';

export interface HRDashboardProps {
  data: HRState;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ data }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { records, error } = useSalaryRecords('hr');

  const month = payrollMonths[0];
  const payroll = records.filter((r) => r.month === month);
  const readyHR = payroll.filter((r) => r.adminApproval === 'Approved' && r.hrApproval === 'Pending');

  const latestDate = data.attendance.map((r) => r.date).sort().at(-1) || '2026-10-09';
  const daily = data.attendance.filter((r) => r.date === latestDate);
  const population = data.employees.filter((e) => e.joiningDate <= latestDate);
  const exceptionCount = population.filter(
    (e) => attendanceIssue(daily.find((r) => r.employeeId === e.id)) !== 'Evidence received'
  ).length;

  const unassigned = data.employees.filter(
    (e) => !data.assignments.some((a) => a.employeeId === e.id)
  );
  const assessed = data.assessments.filter((a) => a.year === reviewYears[0]).length;
  const completed = data.appraisals.filter((a) => a.year === reviewYears[0]).length;
  const readyLeave = leaves.filter(
    (l) => l.adminStatus === 'Approved' && !data.leaveDecisions[l.id]
  ).length;
  const selectedCandidates = (data.candidates || []).filter((c) => c.stage === 'Selected').length;

  const actions = [
    {
      route: '/(hr)/salary',
      title: `${readyHR.length} salaries ready for HR`,
      text: `${salaryMoney(readyHR.reduce((s, r) => s + r.netPay, 0))} awaiting release to Finance`,
      badgeTone: 'emerald',
    },
    ...(selectedCandidates
      ? [
          {
            route: '/(hr)/recruitment',
            title: `${selectedCandidates} candidate(s) selected`,
            text: 'Prepare and release formal offer letters',
            badgeTone: 'brand',
          },
        ]
      : []),
    {
      route: '/(hr)/leave-management',
      title: `${readyLeave} leave requests ready for HR`,
      text: 'Admin clearance received',
      badgeTone: 'warning',
    },
    {
      route: '/(hr)/attendance',
      title: `${exceptionCount} attendance exceptions`,
      text: `Missing punches or photos · ${latestDate}`,
      badgeTone: 'danger',
    },
    {
      route: '/(hr)/project-assignment',
      title: `${unassigned.length} employees unassigned`,
      text: 'Assign a primary project and centre',
      badgeTone: 'neutral',
    },
  ];

  const percent = (count: number) =>
    data.employees.length ? Math.round((count / data.employees.length) * 100) : 0;

  const handleActionPress = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerSoft }]}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Top 4 KPI Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Active employees"
          value={data.employees.filter((e) => e.status === 'Active').length}
          subtitle={`${data.employees.length} total records`}
          icon="Users"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Onboarding"
          value={data.employees.filter((e) => e.status === 'Onboarding').length}
          subtitle={`${data.employees.filter((e) => !e.loginId).length} access pending`}
          icon="UserPlus"
          accentColor={theme.colors.violet}
        />
        <MetricCard
          label="Unassigned"
          value={unassigned.length}
          subtitle="Project needed"
          icon="Network"
          accentColor={theme.colors.warning}
        />
        <MetricCard
          label="Punch Coverage"
          value={`${population.length ? Math.round((daily.filter((r) => r.punchIn).length / population.length) * 100) : 0}%`}
          subtitle={`${daily.filter((r) => r.punchIn).length} of ${population.length}`}
          icon="CalendarCheck"
          accentColor={theme.colors.emerald}
        />
      </View>

      {/* Action Centre Section */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Action Centre
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSubtle }]}>
              Priorities requiring immediate HR review
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: theme.colors.brandSoft }]}>
            <Text style={[styles.priorityBadgeText, { color: theme.colors.brandPrimary }]}>
              {actions.length} TASKS
            </Text>
          </View>
        </View>

        <View style={styles.actionsList}>
          {actions.map((act, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleActionPress(act.route)}
              style={({ pressed }) => [
                styles.actionItem,
                {
                  backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surfaceSoft,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.actionLeft}>
                <View
                  style={[
                    styles.actionDot,
                    {
                      backgroundColor:
                        act.badgeTone === 'emerald'
                          ? theme.colors.emerald
                          : act.badgeTone === 'warning'
                          ? theme.colors.warning
                          : act.badgeTone === 'danger'
                          ? theme.colors.danger
                          : theme.colors.brandPrimary,
                    },
                  ]}
                />
                <View style={styles.actionTextCol}>
                  <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                    {act.title}
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
                    {act.text}
                  </Text>
                </View>
              </View>
              <Icon name="ArrowUpRight" size={17} color={theme.colors.textSubtle} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Thematic Area Distribution */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              People Across Thematic Areas
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSubtle }]}>
              Current organizational team distribution
            </Text>
          </View>
          <Icon name="Users" size={18} color={theme.colors.textMuted} />
        </View>

        <View style={styles.barsContainer}>
          {financeAreas.map((area) => {
            const count = data.employees.filter((e) => e.areaId === area.id).length;
            const pct = percent(count);
            return (
              <View key={area.id} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={[styles.barName, { color: theme.colors.text }]}>
                    {area.name}
                  </Text>
                  <Text style={[styles.barCount, { color: theme.colors.textMuted }]}>
                    {count} staff ({pct}%)
                  </Text>
                </View>
                <ProgressBar value={pct} color={area.color} height={6} />
              </View>
            );
          })}
        </View>
      </View>

      {/* Payroll & Appraisal Bottom Row */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Awaiting Admin"
          value={payroll.filter((r) => r.adminApproval === 'Pending').length}
          subtitle={`Records · ${salaryMonthLabel(month)}`}
          icon="Clock"
          accentColor={theme.colors.warning}
        />
        <MetricCard
          label="Released to Finance"
          value={payroll.filter(isFinanceEligible).length}
          subtitle="Admin + HR complete"
          icon="CheckCircle2"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="KBI Assessment"
          value={`${percent(assessed)}%`}
          subtitle={`${assessed} of ${data.employees.length} completed`}
          icon="Target"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Final Appraisals"
          value={`${completed}/${data.employees.length}`}
          subtitle={`Finalised · FY ${reviewYears[0]}`}
          icon="Award"
          accentColor={theme.colors.violet}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actionsList: {
    gap: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  barsContainer: {
    gap: 12,
  },
  barRow: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barName: {
    fontSize: 12,
    fontWeight: '600',
  },
  barCount: {
    fontSize: 11,
  },
});
