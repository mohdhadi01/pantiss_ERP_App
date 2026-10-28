import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { Employee, Assessment } from '../types';
import { indicators, reviewYears } from '../constants';
import { financeAreas } from '../../finance/data';
import { assessmentScore, completeAppraisal, revisedSalary, rupees, saveAssessment } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { formatRupees } from '../../../utils/formatCurrency';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';

export interface PerformanceViewProps {
  store: HRStore;
  mode: 'kbi' | 'appraisal';
}

const HR_ACTOR = 'Ritika Sen (HR Manager)';

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: `${n} / 5 · ${['Unsatisfactory', 'Needs improvement', 'Meets expectations', 'Exceeds expectations', 'Role model'][n - 1]}`,
}));

const INCREMENT_CHIPS = ['0', '5', '8', '10', '12', '15'];

const statusFor = (appraisalDone: boolean, assessed: boolean) =>
  appraisalDone ? { label: 'Finalised', tone: 'success' as const } : assessed ? { label: 'Assessment saved', tone: 'info' as const } : { label: 'Pending assessment', tone: 'warning' as const };

export const PerformanceView: React.FC<PerformanceViewProps> = ({ store, mode }) => {
  const { theme } = useTheme();
  const { data, commit } = store;
  const [selectedYear, setSelectedYear] = useState(reviewYears[0]);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [kbiTarget, setKbiTarget] = useState<string | null>(null);
  const [appraisalTarget, setAppraisalTarget] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [kbiNotes, setKbiNotes] = useState('');
  const [rating, setRating] = useState('3');
  const [increment, setIncrement] = useState('');
  const [appraisalNotes, setAppraisalNotes] = useState('');

  const assessmentFor = (id: string) => data.assessments.find((a) => a.employeeId === id && a.year === selectedYear);
  const appraisalFor = (id: string) => data.appraisals.find((a) => a.employeeId === id && a.year === selectedYear);

  const openKbi = (employeeId: string) => {
    Haptics.selectionAsync().catch(() => {});
    const existing = assessmentFor(employeeId);
    setScores(existing ? { ...existing.scores } : {});
    setKbiNotes(existing?.notes ?? '');
    setKbiTarget(employeeId);
  };

  const openAppraisal = (employeeId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setRating('3');
    setIncrement('');
    setAppraisalNotes('');
    setAppraisalTarget(employeeId);
  };

  const handleSaveKbi = async (employeeId: string) => {
    const ok = await commit(
      (prev) =>
        saveAssessment(prev, {
          employeeId,
          year: selectedYear,
          scores,
          notes: kbiNotes,
          reviewer: HR_ACTOR,
          updatedAt: new Date().toISOString(),
        }),
      'Employee KBI assessment saved.',
    );
    if (ok) setKbiTarget(null);
  };

  const handleFinalise = async (employeeId: string) => {
    const assessment = assessmentFor(employeeId);
    if (!assessment) return;
    const ok = await commit(
      (prev) =>
        completeAppraisal(prev, {
          employeeId,
          year: selectedYear,
          assessmentUpdatedAt: assessment.updatedAt,
          rating: Number(rating) || 0,
          notes: appraisalNotes,
          reviewer: HR_ACTOR,
          completedAt: new Date().toISOString(),
          incrementPercent: Number(increment),
        }),
      'Year-end appraisal finalised with the recorded salary revision.',
    );
    if (ok) setAppraisalTarget(null);
  };

  const filteredEmployees = data.employees.filter((emp) => {
    const q = search.trim().toLowerCase();
    const matches = emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q);
    return matches && (areaFilter === 'all' || emp.areaId === areaFilter);
  });

  const assessedCount = data.assessments.filter((a) => a.year === selectedYear).length;
  const finalisedCount = data.appraisals.filter((a) => a.year === selectedYear).length;
  const avgScore = useMemo(() => {
    const yearAssessments = data.assessments.filter((a) => a.year === selectedYear);
    if (!yearAssessments.length) return null;
    return (
      yearAssessments.reduce((sum, a) => sum + assessmentScore(a), 0) / yearAssessments.length
    );
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

  const kbiColumns: Array<DataColumn<Employee>> = [
    { key: 'employee', label: 'Employee', flex: 1.4 },
    { key: 'score', label: 'KBI score', width: 100 },
    { key: 'reviewer', label: 'Assessed by', flex: 1.1 },
    { key: 'status', label: 'Status', flex: 1 },
    { key: 'action', label: 'Action', width: 142 },
  ];

  const appraisalColumns: Array<DataColumn<Employee>> = [
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

  const kbiTargetEmployee = kbiTarget ? data.employees.find((e) => e.id === kbiTarget) : undefined;
  const kbiTargetAssessment = kbiTarget ? assessmentFor(kbiTarget) : undefined;
  const weightedPreview = useMemo(() => assessmentScore({ scores }), [scores]);
  const appraisalTargetEmployee = appraisalTarget ? data.employees.find((e) => e.id === appraisalTarget) : undefined;
  const appraisalTargetAssessment = appraisalTarget ? assessmentFor(appraisalTarget) : undefined;
  const appraisalTargetAppraisal = appraisalTarget ? appraisalFor(appraisalTarget) : undefined;

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
            Review cycle FY {selectedYear} · {data.employees.length} employees
          </Text>
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard label="Review population" value={data.employees.length} subtitle="Employees across thematic areas" style={styles.metric} />
        <MetricCard
          label="KBI assessments saved"
          value={assessedCount}
          subtitle={`${data.employees.length - assessedCount} yet to be assessed`}
          style={styles.metric}
        />
        <MetricCard
          label="Average KBI score"
          value={avgScore !== null ? `${avgScore.toFixed(2)} / 5` : '—'}
          subtitle="Weighted across indicators"
          style={styles.metric}
        />
        <MetricCard
          label="Appraisals finalised"
          value={finalisedCount}
          subtitle={`${data.employees.length - finalisedCount} remaining`}
          style={styles.metric}
        />
      </View>

      <SectionCard
        title={mode === 'kbi' ? 'Employee KBI scorecards' : 'Year-end appraisals'}
        description={
          mode === 'kbi'
            ? `FY ${selectedYear} · 1 = needs improvement, 3 = meets expectations, 5 = role model`
            : `FY ${selectedYear} · Increment and revised salary are recorded on finalisation`
        }
      >
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search employees to review…" />
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <SelectField
              label="Thematic area"
              value={areaFilter}
              onChange={setAreaFilter}
              options={[{ value: 'all', label: 'All areas' }, ...financeAreas.map((a) => ({ value: a.id, label: a.name }))]}
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
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{assessment?.reviewer ?? '—'}</Text>;
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
                  <View style={styles.personRow}>
                    {employeeColumn(emp)}
                    <StatusChip status={status.label} tone={status.tone} />
                  </View>
                  <View style={styles.mobileFooter}>
                    <Text style={[styles.score, { color: theme.colors.text }]}>
                      {assessment ? `${assessmentScore(assessment).toFixed(2)} / 5` : 'Not assessed'}
                    </Text>
                    <Button label={assessment ? 'Edit assessment' : 'Assess employee'} variant="primary" size="sm" onPress={() => openKbi(emp.id)} />
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
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{assessment?.reviewer ?? '—'}</Text>;
                case 'rating':
                  return (
                    <Text style={[styles.score, { color: appraisal ? theme.colors.text : theme.colors.textSubtle }]}>
                      {appraisal ? `${appraisal.rating} / 5` : '—'}
                    </Text>
                  );
                case 'increment':
                  return appraisal?.incrementPercent !== undefined ? (
                    <View style={styles.stack4}>
                      <Text style={[styles.increment, { color: theme.colors.successText }]}>+{appraisal.incrementPercent}%</Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                        was {rupees(appraisal.previousAnnualSalary ?? emp.annualSalary ?? 0)} / yr
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.cellText, { color: theme.colors.textSubtle }]}>—</Text>
                  );
                case 'salary':
                  return (
                    <Text style={[styles.score, { color: theme.colors.text }]}>
                      {rupees(appraisal?.revisedAnnualSalary ?? emp.annualSalary ?? 0)} / yr
                    </Text>
                  );
                default:
                  return (
                    <Button
                      label="Review appraisal"
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
                  <View style={styles.personRow}>
                    {employeeColumn(emp)}
                    <StatusChip
                      status={appraisal ? 'Finalised' : assessment ? 'Ready for appraisal' : 'KBI pending'}
                      tone={appraisal ? 'success' : assessment ? 'info' : 'warning'}
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
                    <Button label="Review appraisal" variant="outline" size="sm" disabled={!assessment} onPress={() => openAppraisal(emp.id)} />
                  </View>
                </View>
              );
            }}
          />
        )}
      </SectionCard>

      {/* KBI assessment modal */}
      {kbiTargetEmployee ? (
        <ModalSheet
          key={`${kbiTargetEmployee.id}-${selectedYear}`}
          visible
          onClose={() => setKbiTarget(null)}
          label="KBI assessment"
          title={kbiTargetEmployee.name}
          description={`${kbiTargetEmployee.id} · FY ${selectedYear}`}
          size="lg"
          footer={
            <Button
              label="Save employee assessment"
              variant="primary"
              icon="Check"
              onPress={() => handleSaveKbi(kbiTargetEmployee.id)}
            />
          }
        >
          <View style={[styles.weightedHeader, { backgroundColor: theme.colors.brandSoft }]}>
            <Text style={[styles.weightedLabel, { color: theme.colors.brandPrimary }]}>Weighted KBI score</Text>
            <Text style={[styles.weightedValue, { color: theme.colors.text }]}>{weightedPreview.toFixed(2)} / 5</Text>
          </View>
          {indicators.map((indicator) => (
            <View key={indicator.id} style={[styles.indicatorRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.indicatorMain}>
                <View style={styles.indicatorTitleRow}>
                  <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{indicator.name}</Text>
                  <Badge label={`${indicator.weight}%`} tone="brand" size="sm" />
                </View>
                <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>{indicator.detail}</Text>
              </View>
              <View style={styles.indicatorSelect}>
                <SelectField
                  label="Rate"
                  value={scores[indicator.id] ? String(scores[indicator.id]) : ''}
                  onChange={(v) => setScores({ ...scores, [indicator.id]: Number(v) })}
                  options={RATING_OPTIONS}
                  placeholder="Rate 1–5"
                />
              </View>
            </View>
          ))}
          <TextField
            label="Evidence and HR observations"
            value={kbiNotes}
            onChangeText={setKbiNotes}
            multiline
            placeholder="Field examples, peer feedback and delivery evidence…"
            hint="At least 10 characters of supporting examples are required."
          />
          <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
            Weighted score = sum of indicator rating × weight
          </Text>
        </ModalSheet>
      ) : null}

      {/* Appraisal modal */}
      {appraisalTargetEmployee && appraisalTargetAssessment ? (
        <ModalSheet
          key={`${appraisalTargetEmployee.id}-${selectedYear}`}
          visible
          onClose={() => setAppraisalTarget(null)}
          label="Year-end appraisal"
          title={appraisalTargetEmployee.name}
          description={`${appraisalTargetEmployee.id} · FY ${selectedYear}`}
          size="lg"
          footer={
            appraisalTargetAppraisal ? undefined : (
              <Button
                label="Finalise year-end appraisal"
                variant="primary"
                icon="Award"
                onPress={() => handleFinalise(appraisalTargetEmployee.id)}
              />
            )
          }
        >
          <View style={[styles.weightedHeader, { backgroundColor: theme.colors.brandSoft }]}>
            <Text style={[styles.weightedLabel, { color: theme.colors.brandPrimary }]}>
              Employee KBI score · FY {selectedYear}
            </Text>
            <Text style={[styles.weightedValue, { color: theme.colors.text }]}>
              {assessmentScore(appraisalTargetAssessment).toFixed(2)} / 5
            </Text>
          </View>
          {indicators.map((indicator) => (
            <View key={indicator.id} style={[styles.breakdownRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.breakdownLabel, { color: theme.colors.textMuted }]}>
                {indicator.name} ({indicator.weight}%)
              </Text>
              <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
                {appraisalTargetAssessment.scores[indicator.id] ?? 0} / 5
              </Text>
            </View>
          ))}
          <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
            Assessed by {appraisalTargetAssessment.reviewer} on {formatDate(appraisalTargetAssessment.updatedAt)}
          </Text>
          {appraisalTargetAppraisal ? (
            <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.successBorder }]}>
              <View style={styles.lockedRow}>
                <Icon name="CheckCircle2" size={15} color={theme.colors.successText} />
                <Text style={[styles.lockedText, { color: theme.colors.successText }]}>
                  Finalised by {appraisalTargetAppraisal.reviewer} on {formatDate(appraisalTargetAppraisal.completedAt)}
                </Text>
              </View>
              <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>“{appraisalTargetAppraisal.notes}”</Text>
            </Card>
          ) : (
            <>
              <SelectField label="Overall year-end rating" value={rating} onChange={setRating} options={RATING_OPTIONS} />
              <View>
                <TextField
                  label="Increment"
                  value={increment}
                  onChangeText={setIncrement}
                  keyboardType="numeric"
                  suffix="%"
                  placeholder="e.g. 10"
                />
                <View style={styles.chipRow}>
                  {INCREMENT_CHIPS.map((chip) => (
                    <Pressable
                      key={chip}
                      onPress={() => setIncrement(chip)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: increment === chip ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                          borderColor: increment === chip ? theme.colors.brandPrimary : theme.colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: increment === chip ? '#ffffff' : theme.colors.textMuted }]}>
                        {chip}%
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.salaryPanel, { backgroundColor: theme.colors.successSoft }]}>
                <Text style={[styles.weightedLabel, { color: theme.colors.successText }]}>Appraised salary</Text>
                <Text style={[styles.weightedValue, { color: theme.colors.text }]}>
                  {rupees(revisedSalary(appraisalTargetEmployee.annualSalary ?? 0, Number(increment) || 0))} / yr
                </Text>
                <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>
                  +{formatRupees(revisedSalary(appraisalTargetEmployee.annualSalary ?? 0, Number(increment) || 0) - (appraisalTargetEmployee.annualSalary ?? 0))} / yr · +
                  {formatRupees(
                    Math.round(
                      (revisedSalary(appraisalTargetEmployee.annualSalary ?? 0, Number(increment) || 0) -
                        (appraisalTargetEmployee.annualSalary ?? 0)) /
                        12,
                    ),
                  )}{' '}
                  / month
                </Text>
              </View>
              <TextField
                label="Development plan and appraisal summary"
                value={appraisalNotes}
                onChangeText={setAppraisalNotes}
                multiline
                placeholder="Goals for next year, growth areas and recognition…"
                hint="At least 10 characters are required to finalise."
              />
            </>
          )}
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
  mobileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  weightedHeader: {
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  weightedLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  weightedValue: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  indicatorMain: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  indicatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorSelect: {
    width: 190,
  },
  formulaHint: {
    fontSize: 11,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  salaryPanel: {
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  lockedBanner: {
    gap: 6,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
