/**
 * KBI assessment + year-end appraisal forms for PerformanceView (web-parity).
 * Web reference: Pantiss_ERP/src/features/hr/PerformanceViews.tsx.
 */
import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { HrStackNav } from '../../../navigation/types';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { Assessment, Employee } from '../types';
import { indicators } from '../constants';
import {
  MAX_INCREMENT_PERCENT,
  assessmentScore,
  completeAppraisal,
  revisedSalary,
  rupees,
  saveAssessment,
} from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Card } from '../../../components/ui/Card';
import { TextField } from '../../../components/ui/TextField';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { SalaryPanel } from './SalaryPanel';

export const HR_ACTOR = 'Ritika Sen (HR Manager)';

/** Web rating options are plain "1 / 5" … "5 / 5" (web PerformanceViews.tsx:41,61). */
export const RATING_OPTIONS: SelectOption[] = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: `${n} / 5`,
}));

const INCREMENT_PRESETS = [0, 5, 8, 10, 12, 15];

/* ------------------------------ KBI assessment ------------------------------ */

export const KbiForm: React.FC<{
  employee: Employee;
  year: string;
  store: HRStore;
  onClose: () => void;
}> = ({ employee, year, store, onClose }) => {
  const { theme } = useTheme();
  const existing = store.data.assessments.find((a) => a.employeeId === employee.id && a.year === year);
  const locked = store.data.appraisals.some((a) => a.employeeId === employee.id && a.year === year);
  const [scores, setScores] = useState<Record<string, number>>(existing?.scores ?? {});
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const isComplete = indicators.every((i) => scores[i.id] >= 1 && scores[i.id] <= 5);

  const save = async () => {
    const ok = await store.commit(
      (prev) =>
        saveAssessment(prev, {
          employeeId: employee.id,
          year,
          scores,
          notes: notes.trim(),
          reviewer: HR_ACTOR,
          updatedAt: new Date().toISOString(),
        }),
      'Employee KBI assessment saved for the year-end appraisal.',
    );
    if (ok) onClose();
  };

  return (
    <>
      {locked ? (
        <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warningBorder }]}>
          <View style={styles.lockedRow}>
            <Icon name="Lock" size={15} color={theme.colors.warningText} />
            <Text style={[styles.lockedText, { color: theme.colors.warningText }]}>
              Finalised appraisal · Assessment locked
            </Text>
          </View>
        </Card>
      ) : null}
      <View style={[styles.weightedHeader, { backgroundColor: theme.colors.brandSoft }]}>
        <Text style={[styles.weightedLabel, { color: theme.colors.brandPrimary }]}>Weighted KBI score</Text>
        <Text style={[styles.weightedValue, { color: theme.colors.text }]}>
          {isComplete ? assessmentScore({ scores }).toFixed(2) : '—'} / 5
        </Text>
      </View>
      {indicators.map((indicator) => (
        <View key={indicator.id} style={[styles.indicatorRow, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.indicatorMain}>
            <View style={styles.indicatorTitleRow}>
              <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{indicator.name}</Text>
              <Badge label={`${indicator.weight}% weight`} tone="brand" size="sm" />
            </View>
            <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>{indicator.detail}</Text>
          </View>
          <View style={styles.indicatorSelect}>
            <SelectField
              label={`${indicator.name} rating`}
              value={scores[indicator.id] ? String(scores[indicator.id]) : ''}
              onChange={(v) => setScores({ ...scores, [indicator.id]: Number(v) })}
              options={RATING_OPTIONS}
              placeholder="Rate"
              disabled={locked}
            />
          </View>
        </View>
      ))}
      <TextField
        label="Evidence and HR observations"
        value={notes}
        onChangeText={setNotes}
        multiline
        editable={!locked}
        placeholder="Record employee-specific examples and areas for development."
      />
      <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
        Weighted score = sum of indicator rating × weight. The overall year-end rating is recorded separately
        in Appraisals.
      </Text>
      {store.error ? <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{store.error}</Text> : null}
      {!locked ? (
        <Button label="Save employee assessment" variant="primary" icon="Check" onPress={save} />
      ) : null}
    </>
  );
};

/* ------------------------------- Appraisal form ------------------------------ */

export const AppraisalForm: React.FC<{
  employee: Employee;
  assessment: Assessment;
  store: HRStore;
  onClose: () => void;
}> = ({ employee, assessment, store, onClose }) => {
  const { theme } = useTheme();
  const existing = store.data.appraisals.find(
    (a) => a.employeeId === employee.id && a.year === assessment.year,
  );
  const [rating, setRating] = useState(existing ? String(existing.rating) : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [increment, setIncrement] = useState(existing?.incrementPercent !== undefined ? String(existing.incrementPercent) : '');
  const locked = Boolean(existing);
  const currentAnnual = existing ? existing.previousAnnualSalary : employee.annualSalary;
  const incrementValue = increment.trim() === '' ? NaN : Number(increment);
  const incrementValid = Number.isFinite(incrementValue) && incrementValue >= 0 && incrementValue <= MAX_INCREMENT_PERCENT;
  const appraisedAnnual = existing
    ? existing.revisedAnnualSalary
    : currentAnnual && incrementValid
      ? revisedSalary(currentAnnual, incrementValue)
      : undefined;
  const raise = currentAnnual && appraisedAnnual ? appraisedAnnual - currentAnnual : 0;

  const finalise = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const ok = await store.commit(
      (prev) =>
        completeAppraisal(prev, {
          employeeId: employee.id,
          year: assessment.year,
          assessmentUpdatedAt: assessment.updatedAt,
          rating: Number(rating),
          notes: notes.trim(),
          reviewer: HR_ACTOR,
          completedAt: new Date().toISOString(),
          incrementPercent: incrementValue,
        }),
        'Year-end appraisal finalised. Salary revised and the supporting KBI assessment is now locked.',
      );
    if (ok) onClose();
  };

  return (
    <>
      <View style={[styles.weightedHeader, { backgroundColor: theme.colors.brandSoft }]}>
        <Text style={[styles.weightedLabel, { color: theme.colors.brandPrimary }]}>
          Employee KBI score · FY {assessment.year}
        </Text>
        <Text style={[styles.weightedValue, { color: theme.colors.text }]}>
          {assessmentScore(assessment).toFixed(2)} / 5
        </Text>
      </View>
      <View style={[styles.breakdown, { borderColor: theme.colors.border }]}>
        {indicators.map((indicator) => (
          <View key={indicator.id} style={[styles.breakdownRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.breakdownLabel, { color: theme.colors.textMuted }]}>
              {indicator.name} · {indicator.weight}%
            </Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
              {assessment.scores[indicator.id]} / 5
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
        Assessed by {assessment.reviewer} on {formatDate(assessment.updatedAt)}.
        {assessment.notes ? `\n${assessment.notes}` : ''}
      </Text>
      <SelectField
        label="Overall year-end rating"
        value={rating}
        onChange={setRating}
        options={RATING_OPTIONS}
        placeholder="Choose overall rating"
        disabled={locked}
      />
      <SalaryPanel label={locked ? 'Salary before appraisal' : 'Current salary'} annual={currentAnnual} />
      <TextField
        label="Increment"
        value={increment}
        onChangeText={setIncrement}
        keyboardType="numeric"
        suffix="%"
        placeholder="e.g. 8"
        editable={!locked && Boolean(currentAnnual)}
      />
      {!locked ? (
        <View style={styles.chipRow}>
          {INCREMENT_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              disabled={!currentAnnual}
              onPress={() => setIncrement(String(preset))}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: incrementValid && incrementValue === preset ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                  borderColor: incrementValid && incrementValue === preset ? theme.colors.brandPrimary : theme.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: incrementValid && incrementValue === preset ? '#ffffff' : theme.colors.textMuted },
                ]}
              >
                {preset}%
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <SalaryPanel
        label="Appraised salary"
        tone="highlight"
        annual={appraisedAnnual}
        caption={appraisedAnnual && currentAnnual ? `+${rupees(raise)} / yr · +${rupees(raise / 12)} / month` : undefined}
      />
      <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
        {currentAnnual
          ? `Appraised salary = current annual salary × (1 + increment %). Monthly = annual ÷ 12. Allowed range 0–${MAX_INCREMENT_PERCENT}%.`
          : 'No salary is recorded for this employee. Add it in Onboarding before finalising.'}
      </Text>
      <TextField
        label="Development plan and appraisal summary"
        value={notes}
        onChangeText={setNotes}
        multiline
        editable={!locked}
      />
      {existing ? (
        <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.successBorder }]}>
          <View style={styles.lockedRow}>
            <Icon name="Lock" size={15} color={theme.colors.successText} />
            <Text style={[styles.lockedText, { color: theme.colors.successText }]}>
              Finalised by {existing.reviewer} on {formatDate(existing.completedAt)}
            </Text>
          </View>
        </Card>
      ) : (
        <Text style={[styles.formulaHint, { color: theme.colors.textSubtle }]}>
          Finalising records this review, updates the employee’s salary to the appraised amount and locks its
          KBI assessment for FY {assessment.year}.
        </Text>
      )}
      {store.error ? <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{store.error}</Text> : null}
      {!existing ? (
        <Button
          label="Finalise year-end appraisal"
          variant="primary"
          icon="Award"
          disabled={!currentAnnual || !incrementValid}
          onPress={finalise}
        />
      ) : null}
    </>
  );
};

/** Appraisal-mode register footnote with the KBI shortcut (web PerformanceViews.tsx:27). */
export const AppraisalFootnote: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HrStackNav>();
  return (
    <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>
      Employees without a saved assessment need a{' '}
      <Text
        onPress={() => navigation.navigate('KbiMetrics')}
        style={[styles.footnoteLink, { color: theme.colors.brandPrimary }]}
      >
        KBI assessment
      </Text>{' '}
      before their year-end appraisal.
    </Text>
  );
};

const styles = StyleSheet.create({
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
    flexWrap: 'wrap',
  },
  indicatorSelect: {
    width: 190,
  },
  cellTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cellSub: {
    fontSize: 10.5,
  },
  formulaHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  breakdown: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
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
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  footnote: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  footnoteLink: {
    fontWeight: '600',
  },
});
