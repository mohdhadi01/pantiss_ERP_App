import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useSalaryRecords } from '../../finance/useSalaryRecords';
import { payrollMonths, salaryMonthLabel, isFinanceEligible } from '../../finance/salaryData';
import { formatRupees } from '../../../utils/formatCurrency';
import { HRState } from '../types';
import { attendanceIssue } from '../helpers';
import { reviewYears, leaves } from '../constants';
import { financeAreas } from '../../finance/data';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SectionCard } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface HRDashboardProps {
  data: HRState;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ data }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { isMd } = useBreakpoint();
  const { records, error } = useSalaryRecords('hr');

  const month = payrollMonths[0];
  const payroll = records.filter((r) => r.month === month);
  const readyHR = payroll.filter((r) => r.adminApproval === 'Approved' && r.hrApproval === 'Pending');
  const readyHRMoney = readyHR.reduce((s, r) => s + r.netPay, 0);

  const latestDate = data.attendance.map((r) => r.date).sort().at(-1) || '2026-10-09';
  const daily = data.attendance.filter((r) => r.date === latestDate);
  const population = data.employees.filter((e) => e.joiningDate <= latestDate);
  const punchedIn = daily.filter((r) => r.punchIn).length;
  const punchCoverage = population.length
    ? Math.round((punchedIn / population.length) * 100)
    : 0;
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
  const onboarding = data.employees.filter((e) => e.status === 'Onboarding').length;
  const unpreparedAccess = data.employees.filter((e) => !e.loginId).length;
  const activeEmployees = data.employees.filter((e) => e.status === 'Active').length;

  const percent = (count: number) =>
    data.employees.length ? Math.round((count / data.employees.length) * 100) : 0;

  const actions = useMemo(
    () => [
      {
        route: '/(hr)/salary',
        title: `${readyHR.length} salaries ready for HR`,
        text: `${formatRupees(readyHRMoney)} awaiting release to Finance`,
      },
      ...(selectedCandidates
        ? [
            {
              route: '/(hr)/recruitment',
              title: `${selectedCandidates} candidate(s) selected`,
              text: 'Prepare and release formal offer letters',
            },
          ]
        : []),
      {
        route: '/(hr)/leave-management',
        title: `${readyLeave} leave requests ready for HR`,
        text: 'Admin clearance received',
      },
      {
        route: '/(hr)/attendance',
        title: `${exceptionCount} attendance exceptions`,
        text: `Missing punches or photos · ${latestDate}`,
      },
      {
        route: '/(hr)/project-assignment',
        title: `${unassigned.length} employees unassigned`,
        text: 'Assign a primary project and centre',
      },
    ],
    [readyHR.length, readyHRMoney, selectedCandidates, readyLeave, exceptionCount, latestDate, unassigned.length],
  );

  const handleActionPress = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as never);
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerSoft }]}>
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{error}</Text>
        </View>
      ) : null}

      {/* KPI row 1 */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Active employees"
          value={activeEmployees}
          subtitle={`${data.employees.length} total employee records`}
          style={styles.metric}
        />
        <MetricCard
          label="Onboarding in progress"
          value={onboarding}
          subtitle={`${unpreparedAccess} access profiles not prepared`}
          style={styles.metric}
        />
        <MetricCard
          label="Unassigned employees"
          value={unassigned.length}
          subtitle="Primary project / centre needed"
          style={styles.metric}
        />
        <MetricCard
          label="Punch-in coverage"
          value={`${punchCoverage}%`}
          subtitle={`${punchedIn} of ${population.length} · ${latestDate}`}
          style={styles.metric}
        />
      </View>

      {/* Distribution + action centre */}
      <View style={[styles.splitRow, isMd && styles.splitRowWide]}>
        <SectionCard
          title="People across thematic areas"
          description="Current employee distribution"
          padding={20}
          style={isMd ? styles.flex1 : styles.fullWidth}
        >
          <View style={styles.barsContainer}>
            {financeAreas.map((area) => {
              const count = data.employees.filter((e) => e.areaId === area.id).length;
              return (
                <View key={area.id} style={styles.barRow}>
                  <Text numberOfLines={1} style={[styles.barLabel, { color: theme.colors.text }]}>
                    {area.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <ProgressBar value={percent(count)} color={theme.colors.brandPrimary} height={7} />
                  </View>
                  <Text style={[styles.barCount, { color: theme.colors.textMuted }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard
          title="Action centre"
          description="HR priorities"
          padding={20}
          style={isMd ? styles.flex1 : styles.fullWidth}
        >
          <View style={styles.actionsList}>
            {actions.map((act) => (
              <Pressable
                key={act.route + act.title}
                onPress={() => handleActionPress(act.route)}
                style={({ pressed }) => [
                  styles.actionRow,
                  {
                    borderBottomColor: theme.colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.actionTextCol}>
                  <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{act.title}</Text>
                  <Text style={[styles.actionSub, { color: theme.colors.textMuted }]}>{act.text}</Text>
                </View>
                <Icon name="ArrowUpRight" size={15} color={theme.colors.brandPrimary} />
              </Pressable>
            ))}
          </View>
        </SectionCard>
      </View>

      {/* KPI row 2 */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Awaiting Admin approval"
          value={payroll.filter((r) => r.adminApproval === 'Pending').length}
          subtitle={`Salary records · ${salaryMonthLabel(month)}`}
          style={styles.metric}
        />
        <MetricCard
          label="Released to Finance"
          value={payroll.filter(isFinanceEligible).length}
          subtitle="Admin + HR approval completed"
          style={styles.metric}
        />
        <MetricCard
          label="KBI assessment coverage"
          value={`${percent(assessed)}%`}
          subtitle={`${assessed} of ${data.employees.length} · FY ${reviewYears[0]}`}
          style={styles.metric}
        />
        <MetricCard
          label="Year-end appraisals"
          value={`${completed}/${data.employees.length}`}
          subtitle={`Finalised · FY ${reviewYears[0]}`}
          style={styles.metric}
        />
      </View>

      {/* Payroll summary + annual review progress */}
      <View style={[styles.splitRow, isMd && styles.splitRowWide]}>
        <LinearGradient
          colors={[theme.colors.brandSoft, theme.colors.moduleBg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.payPanel}
        >
          <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>
            Payroll awaiting HR · {salaryMonthLabel(month)}
          </Text>
          <Text style={[styles.payValue, { color: theme.colors.text }]}>{formatRupees(readyHRMoney)}</Text>
          <Text style={[styles.payNote, { color: theme.colors.textMuted }]}>
            Only Admin-approved salaries can be released to Finance.
          </Text>
          <Button
            label="Review salaries →"
            variant="primary"
            onPress={() => handleActionPress('/(hr)/salary')}
            style={styles.payButton}
          />
        </LinearGradient>

        <SectionCard
          title="Annual review progress"
          description={`FY ${reviewYears[0]}`}
          padding={20}
          style={isMd ? styles.flex1 : styles.fullWidth}
        >
          <View style={styles.reviewBars}>
            <ProgressBar value={percent(assessed)} showLabel label={`KBI assessments ${percent(assessed)}%`} />
            <ProgressBar value={percent(completed)} showLabel label={`Finalised appraisals ${percent(completed)}%`} />
          </View>
        </SectionCard>
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
  metric: {
    flexGrow: 1,
    flexBasis: 170,
  },
  splitRow: {
    gap: 12,
  },
  splitRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flex1: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  barsContainer: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 110,
    fontSize: 11.5,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
  },
  barCount: {
    width: 26,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  actionsList: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionTextCol: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  actionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  payPanel: {
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 144, 168, 0.16)',
  },
  payValue: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  payNote: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  payButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  reviewBars: {
    gap: 16,
  },
});
