import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { indicators, reviewYears } from '../constants';
import {
  assessmentScore,
  completeAppraisal,
  rupees,
  saveAssessment,
} from '../helpers';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface PerformanceViewProps {
  store: HRStore;
  mode: 'kbi' | 'appraisal';
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ store, mode }) => {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(reviewYears[0]);
  const [search, setSearch] = useState('');
  const { data, commit } = store;

  const handleQuickKbiScore = (employeeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    commit((prev) => {
      return saveAssessment(prev, {
        employeeId,
        year: selectedYear,
        scores: {
          collaboration: 4,
          ownership: 5,
          leadership: 4,
          conduct: 5,
        },
        notes: 'Consistent initiative across field interventions and peer mentoring.',
        reviewer: 'Ritika Sen (HR Manager)',
        updatedAt: new Date().toISOString(),
      });
    }, 'KBI score assessment saved successfully.');
  };

  const handleFinalizeAppraisal = (employeeId: string, assessmentUpdatedAt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => {
      return completeAppraisal(prev, {
        employeeId,
        year: selectedYear,
        assessmentUpdatedAt,
        rating: 5,
        notes: 'Outstanding contribution throughout the FY cycle. Recommended for promotion increment.',
        reviewer: 'Ritika Sen (HR Manager)',
        completedAt: new Date().toISOString(),
        incrementPercent: 12,
      });
    }, 'Year-end appraisal finalised with +12% salary revision!');
  };

  const filteredEmployees = data.employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Review Year Switcher */}
      <View style={styles.yearRow}>
        <Text style={[styles.yearLabel, { color: theme.colors.textSubtle }]}>
          REVIEW CYCLE:
        </Text>
        <View style={styles.yearChips}>
          {reviewYears.map((yr) => (
            <Pressable
              key={yr}
              onPress={() => setSelectedYear(yr)}
              style={[
                styles.yearChip,
                {
                  backgroundColor: selectedYear === yr ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                  borderColor: selectedYear === yr ? theme.colors.brandPrimary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.yearChipText,
                  {
                    color: selectedYear === yr ? '#ffffff' : theme.colors.textMuted,
                    fontWeight: selectedYear === yr ? '700' : '500',
                  },
                ]}
              >
                FY {yr}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search staff to review assessment..."
      />

      <View style={styles.list}>
        {filteredEmployees.map((emp) => {
          const assessment = data.assessments.find(
            (a) => a.employeeId === emp.id && a.year === selectedYear
          );
          const appraisal = data.appraisals.find(
            (a) => a.employeeId === emp.id && a.year === selectedYear
          );

          const score = assessment ? assessmentScore(assessment) : null;

          return (
            <View
              key={emp.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <Avatar name={emp.name} size={42} />
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {emp.name}
                  </Text>
                  <Text style={[styles.sub, { color: theme.colors.textSubtle }]}>
                    {emp.id} · CTC: {emp.annualSalary ? rupees(emp.annualSalary) : '—'}
                  </Text>
                </View>

                {mode === 'kbi' ? (
                  <Badge
                    label={score ? `Score: ${score}/5.0` : 'Not Assessed'}
                    tone={score ? 'emerald' : 'warning'}
                  />
                ) : (
                  <Badge
                    label={appraisal ? `Rating: ${appraisal.rating}★` : 'Pending Review'}
                    tone={appraisal ? 'emerald' : 'warning'}
                  />
                )}
              </View>

              <View style={styles.divider} />

              {/* KBI Mode Content */}
              {mode === 'kbi' && (
                <View style={styles.kbiContent}>
                  {assessment ? (
                    <View style={styles.scoresGrid}>
                      {indicators.map((ind) => (
                        <View key={ind.id} style={styles.scoreItem}>
                          <Text style={[styles.indicatorName, { color: theme.colors.textSubtle }]}>
                            {ind.name.toUpperCase()}
                          </Text>
                          <Text style={[styles.indicatorScore, { color: theme.colors.text }]}>
                            {assessment.scores[ind.id] || 0} / 5
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyActionRow}>
                      <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                        No KBI score recorded for FY {selectedYear}.
                      </Text>
                      <Button
                        label="Record Evaluation"
                        onPress={() => handleQuickKbiScore(emp.id)}
                        size="sm"
                        variant="primary"
                        icon="Target"
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Appraisal Mode Content */}
              {mode === 'appraisal' && (
                <View style={styles.appraisalContent}>
                  {appraisal ? (
                    <View style={styles.appraisalDetails}>
                      <View style={styles.appraisalRow}>
                        <Text style={[styles.appraisalLabel, { color: theme.colors.textSubtle }]}>
                          INCREMENT APPLIED
                        </Text>
                        <Text style={[styles.incrementValue, { color: theme.colors.emerald }]}>
                          +{appraisal.incrementPercent}%
                        </Text>
                      </View>
                      <View style={styles.appraisalRow}>
                        <Text style={[styles.appraisalLabel, { color: theme.colors.textSubtle }]}>
                          REVISED SALARY
                        </Text>
                        <Text style={[styles.revisedValue, { color: theme.colors.text }]}>
                          {appraisal.revisedAnnualSalary ? rupees(appraisal.revisedAnnualSalary) : '—'} / yr
                        </Text>
                      </View>
                      <Text style={[styles.notesText, { color: theme.colors.textMuted }]}>
                        "{appraisal.notes}"
                      </Text>
                    </View>
                  ) : assessment ? (
                    <View style={styles.emptyActionRow}>
                      <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                        KBI assessed ({score}/5.0). Ready for year-end salary appraisal.
                      </Text>
                      <Button
                        label="Finalise Appraisal & 12% Increment"
                        onPress={() => handleFinalizeAppraisal(emp.id, assessment.updatedAt)}
                        size="sm"
                        variant="emerald"
                        icon="Award"
                      />
                    </View>
                  ) : (
                    <Text style={[styles.emptyText, { color: theme.colors.warning }]}>
                      Complete employee KBI evaluation first before finalising year-end appraisal.
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yearLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  yearChips: {
    flexDirection: 'row',
    gap: 8,
  },
  yearChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 11,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  kbiContent: {
    gap: 8,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    minWidth: 120,
  },
  indicatorName: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  indicatorScore: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  appraisalContent: {
    gap: 8,
  },
  appraisalDetails: {
    gap: 8,
  },
  appraisalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appraisalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  incrementValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  revisedValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
});
