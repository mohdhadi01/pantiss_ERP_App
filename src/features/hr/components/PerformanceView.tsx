import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { Employee } from '../types';
import { reviewYears } from '../constants';
import { financeAreas } from '../../finance/data';
import { assessmentScore, rupees } from '../helpers';
import { formatRupees } from '../../../utils/formatCurrency';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { AppraisalFootnote, AppraisalForm, KbiForm } from './PerformanceParts';

export interface PerformanceViewProps {
  store: HRStore;
  mode: 'kbi' | 'appraisal';
}

const statusFor = (appraisalDone: boolean, assessed: boolean) =>
  appraisalDone
    ? { label: 'Finalised', tone: 'success' as const }
    : assessed
      ? { label: 'Assessment saved', tone: 'info' as const }
      : { label: 'Pending assessment', tone: 'warning' as const };

export const PerformanceView: React.FC<PerformanceViewProps> = ({ store, mode }) => {
  const { theme } = useTheme();
  const { data } = store;
  const [selectedYear, setSelectedYear] = useState(reviewYears[0]);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [kbiTarget, setKbiTarget] = useState<string | null>(null);
  const [appraisalTarget, setAppraisalTarget] = useState<string | null>(null);

  const assessmentFor = (id: string) => data.assessments.find((a) => a.employeeId === id && a.year === selectedYear);
  const appraisalFor = (id: string) => data.appraisals.find((a) => a.employeeId === id && a.year === selectedYear);

  const openKbi = (employeeId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setKbiTarget(employeeId);
  };

  const openAppraisal = (employeeId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setAppraisalTarget(employeeId);
  };

  const filteredEmployees = data.employees.filter((emp) => {
    const q = search.trim().toLowerCase();
    const matches = `${emp.name} ${emp.id} ${emp.email}`.toLowerCase().includes(q);
    return matches && (areaFilter === 'all' || emp.areaId === areaFilter);
  });

  const assessedCount = data.assessments.filter((a) => a.year === selectedYear).length;
  const finalisedCount = data.appraisals.filter((a) => a.year === selectedYear).length;
  const avgScore = useMemo(() => {
    const yearAssessments = data.assessments.filter((a) => a.year === selectedYear);
    if (!yearAssessments.length) return null;
    return yearAssessments.reduce((sum, a) => sum + assessmentScore(a), 0) / yearAssessments.length;
  }, [data.assessments, selectedYear]);

  const employeeColumn = (emp: Employee) => {
    const assessment = assessmentFor(emp.id);
    return (
      <View style={styles.personRow}>
        <Avatar name={emp.name} size={32} />
        <View style={styles.personMain}>
          <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{emp.name}</Text>
          <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{emp.id}</Text>
          {assessment ? (
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Assessed by {assessment.reviewer}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const kbiColumns: DataColumn<Employee>[] = [
    { key: 'employee', label: 'Employee', flex: 1.4 },
    { key: 'score', label: 'KBI score', width: 100 },
    { key: 'reviewer', label: 'Assessed by', flex: 1.1 },
    { key: 'status', label: 'Status', flex: 1 },
    { key: 'action', label: 'Action', width: 142 },
  ];

  const appraisalColumns: DataColumn<Employee>[] = [
    { key: 'employee', label: 'Employee', flex: 1.3 },
    { key: 'score', label: 'KBI score', width: 96 },
    { key: 'reviewer', label: 'Assessed by', flex: 1 },
    { key: 'rating', label: 'Overall rating', width: 90 },
    { key: 'increment', label: 'Increment', flex: 1 },
    { key: 'salary', label: 'Salary', flex: 1 },
    { key: 'action', label: 'Action', width: 136 },
  ];

  const renderScoreCell = (emp: Employee) => {
    const assessment = assessmentFor(emp.id);
    return (
      <Text style={[styles.score, { color: assessment ? theme.colors.text : theme.colors.textSubtle }]}>
        {assessment ? `${assessmentScore(assessment).toFixed(2)} / 5` : 'Not assessed'}
      </Text>
    );
  };

  const reviewerCell = (emp: Employee) => {
    const assessment = assessmentFor(emp.id);
    return (
      <View style={styles.stack4}>
        <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{assessment?.reviewer || '—'}</Text>
        <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
          {assessment ? `Assessed ${assessment.updatedAt.slice(0, 10)}` : 'Awaiting HR'}
        </Text>
      </View>
    );
  };

  const kbiTargetEmployee = kbiTarget ? data.employees.find((e) => e.id === kbiTarget) : undefined;
  const appraisalTargetEmployee = appraisalTarget ? data.employees.find((e) => e.id === appraisalTarget) : undefined;
  const appraisalTargetAssessment = appraisalTarget ? assessmentFor(appraisalTarget) : undefined;

  return (
    <View style={styles.container}>
      <Card padding={18} style={styles.banner}>
        <View style={[styles.bannerTile, { backgroundColor: theme.colors.brandSoft }]}>
          <Icon name={mode === 'kbi' ? 'Target' : 'Award'} size={20} color={theme.colors.brandPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.bannerText}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
            {mode === 'kbi'
              ? 'Employee-wise KBI assessments, owned by HR.'
              : "Year-end appraisal, informed by the employee's KBI assessment."}
          </Text>
          <Text style={[styles.bannerSub, { color: theme.colors.textMuted }]}>
            {mode === 'kbi'
              ? 'Rate each behavioural indicator and record supporting examples for the selected review year.'
              : 'Complete KBI first, then record the overall rating and development plan. Finalising locks that year’s assessment.'}
          </Text>
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Review population"
          value={data.employees.length}
          subtitle={`Employee register · FY ${selectedYear}`}
          style={styles.metric}
        />
        <MetricCard
          label="KBI assessments saved"
          value={assessedCount}
          subtitle={`${data.employees.length - assessedCount} yet to be assessed`}
          style={styles.metric}
        />
        <MetricCard
          label="Average KBI score"
          value={avgScore !== null ? `${avgScore.toFixed(2)} / 5` : '—'}
          subtitle="Based on saved employee assessments"
          style={styles.metric}
        />
        <MetricCard
          label="Appraisals finalised"
          value={finalisedCount}
          subtitle={`${data.employees.length - finalisedCount} remaining for this year`}
          style={styles.metric}
        />
      </View>

      <SectionCard
        title={mode === 'kbi' ? 'Employee KBI scorecards' : 'Year-end appraisals'}
        description={`FY ${selectedYear} · 1 = needs improvement, 3 = meets expectations, 5 = role model`}
      >
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search employees to review…" />
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <SelectField
              label="Thematic area"
              value={areaFilter}
              onChange={setAreaFilter}
              options={[{ value: 'all', label: 'All thematic areas' }, ...financeAreas.map((a) => ({ value: a.id, label: a.name }))]}
            />
          </View>
          <View style={styles.filterCell}>
            <SelectField
              label="Review year"
              value={selectedYear}
              onChange={setSelectedYear}
              options={reviewYears.map((year) => ({ value: year, label: year }))}
            />
          </View>
        </View>

        {mode === 'kbi' ? (
          <DataTable
            columns={kbiColumns}
            rows={filteredEmployees}
            keyExtractor={(row) => row.id}
            emptyTitle="No employees match"
            emptyDescription="Adjust the search or thematic-area filter."
            emptyIcon="Target"
            renderCell={(emp, column) => {
              const assessment = assessmentFor(emp.id);
              const appraisal = appraisalFor(emp.id);
              const status = statusFor(Boolean(appraisal), Boolean(assessment));
              switch (column.key) {
                case 'employee':
                  return employeeColumn(emp);
                case 'score':
                  return renderScoreCell(emp);
                case 'reviewer':
                  return reviewerCell(emp);
                case 'status':
                  return <StatusChip status={status.label} tone={status.tone} />;
                default:
                  return (
                    <Button
                      label={appraisal ? 'View' : assessment ? 'Edit assessment' : 'Assess employee'}
                      variant={appraisal ? 'outline' : 'primary'}
                      size="sm"
                      onPress={() => openKbi(emp.id)}
                    />
                  );
              }
            }}
            renderMobileCard={(emp) => {
              const assessment = assessmentFor(emp.id);
              const appraisal = appraisalFor(emp.id);
              const status = statusFor(Boolean(appraisal), Boolean(assessment));
              return (
                <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                  <View style={styles.mobileHeader}>
                    <View style={styles.mobileEmployee}>
                      <Avatar name={emp.name} size={34} />
                      <View style={styles.personMain}>
                        <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                          {emp.name}
                        </Text>
                        <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                          {emp.id}
                        </Text>
                        {assessment ? (
                          <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                            Assessed by {assessment.reviewer}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <StatusChip status={status.label} tone={status.tone} style={styles.headerChip} />
                  </View>
                  <View style={styles.mobileFooter}>
                    <Text style={[styles.score, { color: theme.colors.text }]}>
                      {assessment ? `${assessmentScore(assessment).toFixed(2)} / 5` : 'Not assessed'}
                    </Text>
                    <Button
                      label={appraisal ? 'View' : assessment ? 'Edit assessment' : 'Assess employee'}
                      variant={appraisal ? 'outline' : 'primary'}
                      size="sm"
                      onPress={() => openKbi(emp.id)}
                    />
                  </View>
                </View>
              );
            }}
          />
        ) : (
          <DataTable
            columns={appraisalColumns}
            rows={filteredEmployees}
            keyExtractor={(row) => row.id}
            emptyTitle="No employees match"
            emptyDescription="Adjust the search or thematic-area filter."
            emptyIcon="Award"
            renderCell={(emp, column) => {
              const assessment = assessmentFor(emp.id);
              const appraisal = appraisalFor(emp.id);
              switch (column.key) {
                case 'employee':
                  return employeeColumn(emp);
                case 'score':
                  return renderScoreCell(emp);
                case 'reviewer':
                  return reviewerCell(emp);
                case 'rating':
                  return (
                    <View style={styles.stack4}>
                      <Text style={[styles.score, { color: appraisal ? theme.colors.text : theme.colors.textSubtle }]}>
                        {appraisal ? `${appraisal.rating} / 5` : '—'}
                      </Text>
                      {appraisal ? (
                        <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                          Finalised {appraisal.completedAt.slice(0, 10)}
                        </Text>
                      ) : null}
                    </View>
                  );
                case 'increment':
                  return appraisal?.incrementPercent !== undefined ? (
                    <View style={styles.stack4}>
                      <Text style={[styles.increment, { color: theme.colors.successText }]}>+{appraisal.incrementPercent}%</Text>
                      {appraisal.previousAnnualSalary !== undefined ? (
                        <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                          was {rupees(appraisal.previousAnnualSalary)} / yr
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <Text style={[styles.cellText, { color: theme.colors.textSubtle }]}>—</Text>
                  );
                case 'salary':
                  return appraisal?.revisedAnnualSalary ?? emp.annualSalary ? (
                    <View style={styles.stack4}>
                      <Text style={[styles.score, { color: theme.colors.text }]}>
                        {rupees(appraisal?.revisedAnnualSalary ?? emp.annualSalary ?? 0)} / yr
                      </Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                        {formatRupees(Math.round((appraisal?.revisedAnnualSalary ?? emp.annualSalary ?? 0) / 12))} / month
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Not recorded</Text>
                  );
                default:
                  return (
                    <Button
                      label={appraisal ? 'View' : 'Review appraisal'}
                      variant="outline"
                      size="sm"
                      disabled={!assessment}
                      onPress={() => openAppraisal(emp.id)}
                    />
                  );
              }
            }}
            renderMobileCard={(emp) => {
              const assessment = assessmentFor(emp.id);
              const appraisal = appraisalFor(emp.id);
              return (
                <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                  <View style={styles.mobileHeader}>
                    <View style={styles.mobileEmployee}>
                      <Avatar name={emp.name} size={34} />
                      <View style={styles.personMain}>
                        <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                          {emp.name}
                        </Text>
                        <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                          {emp.id}
                        </Text>
                        {assessment ? (
                          <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                            Assessed by {assessment.reviewer}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <StatusChip
                      status={appraisal ? 'Finalised' : assessment ? 'Ready for appraisal' : 'Awaiting KBI'}
                      tone={appraisal ? 'success' : assessment ? 'info' : 'warning'}
                      style={styles.headerChip}
                    />
                  </View>
                  <View style={styles.mobileFooter}>
                    <View style={styles.stack4}>
                      <Text style={[styles.score, { color: theme.colors.text }]}>
                        {assessment ? `${assessmentScore(assessment).toFixed(2)} / 5` : 'Not assessed'}
                      </Text>
                      {appraisal?.incrementPercent !== undefined ? (
                        <Text style={[styles.increment, { color: theme.colors.successText }]}>+{appraisal.incrementPercent}%</Text>
                      ) : null}
                    </View>
                    <Button
                      label={appraisal ? 'View' : 'Review appraisal'}
                      variant="outline"
                      size="sm"
                      disabled={!assessment}
                      onPress={() => openAppraisal(emp.id)}
                    />
                  </View>
                </View>
              );
            }}
          />
        )}

        {mode === 'appraisal' ? <AppraisalFootnote /> : null}
      </SectionCard>

      {kbiTargetEmployee ? (
        <ModalSheet
          key={`${kbiTargetEmployee.id}-${selectedYear}`}
          visible
          onClose={() => setKbiTarget(null)}
          label="KBI assessment"
          title={kbiTargetEmployee.name}
          description={`${kbiTargetEmployee.id} · FY ${selectedYear}`}
          size="lg"
        >
          <KbiForm employee={kbiTargetEmployee} year={selectedYear} store={store} onClose={() => setKbiTarget(null)} />
        </ModalSheet>
      ) : null}

      {appraisalTargetEmployee && appraisalTargetAssessment ? (
        <ModalSheet
          key={`${appraisalTargetEmployee.id}-${selectedYear}`}
          visible
          onClose={() => setAppraisalTarget(null)}
          label="Year-end appraisal"
          title={appraisalTargetEmployee.name}
          description={`${appraisalTargetEmployee.id} · FY ${selectedYear}`}
          size="lg"
        >
          <AppraisalForm
            employee={appraisalTargetEmployee}
            assessment={appraisalTargetAssessment}
            store={store}
            onClose={() => setAppraisalTarget(null)}
          />
        </ModalSheet>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerTile: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 17,
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  filterCell: {
    flexGrow: 1,
    flexBasis: 220,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  personMain: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  cellTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  cellSub: {
    fontSize: 10.5,
  },
  cellText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  score: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  increment: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stack4: {
    gap: 4,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerChip: {
    flexShrink: 0,
  },
  mobileEmployee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    minWidth: 0,
  },
  mobileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
