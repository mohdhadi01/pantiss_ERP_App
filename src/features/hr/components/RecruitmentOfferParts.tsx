/**
 * Candidate interaction surfaces for RecruitmentView: profile modal, Release
 * Offer form (all 8 web fields) and the formal offer letter view with actions.
 * Web reference: Pantiss_ERP/src/features/hr/RecruitmentViews.tsx
 * (CandidateDetailView 1384-1561, CreateOfferForm 2227-2458, OfferLetterDocumentView 2464-2651).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { Candidate, CandidateStage, Interview, JobPosting, OfferLetter } from '../types';
import { annualFromMonthly, areaName, monthlyFromAnnual, rupees } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { SalaryPanel } from './SalaryPanel';
import { STAGE_OPTIONS, areaOptions } from './RecruitmentParts';

export interface ReleaseOfferPayload {
  candidateId: string;
  designationTitle: string;
  areaId: string;
  joiningDate: string;
  expiryDate: string;
  annualSalary: number;
  monthlySalary: number;
  termsNotes: string;
}

const DEFAULT_TERMS =
  'Probation period: 6 months. Annual performance review cycle in March. Standard medical and field travel allowances apply.';

const plusDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

/* ------------------------------ Candidate profile ----------------------------- */

export const ProfileModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidate: Candidate;
  job?: JobPosting;
  offer?: OfferLetter;
  interviews: Interview[];
  onStageChange: (stage: CandidateStage, note?: string) => void;
  onSchedule: () => void;
  onMakeOffer: () => void;
  onReject: () => void;
}> = ({ visible, onClose, candidate, job, offer, interviews, onStageChange, onSchedule, onMakeOffer, onReject }) => {
  const { theme } = useTheme();
  const gate = candidate.stage !== 'Rejected' && candidate.stage !== 'Onboarded';
  return (
    <ModalSheet visible={visible} onClose={onClose} label={`Applicant Profile · ${candidate.id}`} title={candidate.name} size="md">
      <View style={styles.profileTop}>
        <Avatar name={candidate.name} size={46} />
        <View style={styles.profileHeadText}>
          <Text style={[styles.appliedLine, { color: theme.colors.textMuted }]}>
            Applied for: <Text style={[styles.appliedLine, { color: theme.colors.text, fontWeight: '600' }]}>
              {job?.title ?? 'General'}
            </Text>{' '}
            · {areaName(job?.areaId ?? '')}
          </Text>
          <Text style={[styles.applicantSub, { color: theme.colors.textSubtle }]}>
            {candidate.email} · {candidate.phone} · Notice: {candidate.noticePeriod}
          </Text>
        </View>
        <StatusChip status={candidate.stage} />
      </View>
      <SelectField
        label="Change stage:"
        value={candidate.stage}
        onChange={(v) => onStageChange(v as CandidateStage)}
        options={STAGE_OPTIONS}
      />
      <View style={[styles.compCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
        <View style={styles.compHeader}>
          <Text style={[styles.compLabel, { color: theme.colors.textSubtle }]}>Compensation Expectation</Text>
          <Text style={[styles.compCaption, { color: theme.colors.textSubtle }]}>
            {candidate.currentCompany ? `Current: ${candidate.currentCompany}` : 'New entrant'}
          </Text>
        </View>
        <View style={styles.compRow}>
          <Text style={[styles.compTerm, { color: theme.colors.textMuted }]}>Expected CTC</Text>
          <Text style={[styles.compValue, { color: theme.colors.text }]}>{rupees(candidate.expectedSalary)}</Text>
        </View>
        <View style={styles.compRow}>
          <Text style={[styles.compTerm, { color: theme.colors.textMuted }]}>Current CTC</Text>
          <Text style={[styles.compValue, { color: theme.colors.text }]}>
            {candidate.currentSalary ? rupees(candidate.currentSalary) : '—'}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.compCard,
          { backgroundColor: offer ? theme.colors.successSoft : theme.colors.surfaceSoft, borderColor: offer ? theme.colors.successBorder : theme.colors.border },
        ]}
      >
        <View style={styles.compHeader}>
          <Text style={[styles.compLabel, { color: offer ? theme.colors.successText : theme.colors.textSubtle }]}>
            Offer Letter Status
          </Text>
          <Text style={[styles.compCaption, { color: offer ? theme.colors.successText : theme.colors.textSubtle }]}>
            {offer ? offer.status : 'No offer issued yet'}
          </Text>
        </View>
        {offer ? (
          <>
            <View style={styles.compRow}>
              <Text style={[styles.compTerm, { color: theme.colors.textMuted }]}>Offered Annual CTC</Text>
              <Text style={[styles.compValue, { color: theme.colors.text }]}>{rupees(offer.annualSalary)}</Text>
            </View>
            <View style={styles.compRow}>
              <Text style={[styles.compTerm, { color: theme.colors.textMuted }]}>Monthly Gross</Text>
              <Text style={[styles.compValue, { color: theme.colors.text }]}>{rupees(offer.monthlySalary)}</Text>
            </View>
          </>
        ) : (
          <Text style={[styles.compNote, { color: theme.colors.textMuted }]}>
            Mark candidate as <Text style={styles.compNoteStrong}>Selected</Text> once panel rounds are complete to
            generate and release an official offer letter.
          </Text>
        )}
      </View>
      {candidate.resumeSummary ? (
        <View>
          <Text style={[styles.sectionMiniTitle, { color: theme.colors.text }]}>Resume Highlights &amp; Competencies</Text>
          <Text style={[styles.resumeCode, { color: theme.colors.textMuted, backgroundColor: theme.colors.moduleBg }]}>
            {candidate.resumeSummary}
          </Text>
        </View>
      ) : null}
      <View>
        <View style={styles.roundsHeader}>
          <Text style={[styles.sectionMiniTitle, { color: theme.colors.text, marginBottom: 0 }]}>
            Interview Rounds ({interviews.length})
          </Text>
          {gate ? <Button label="Schedule Round" variant="outline" size="sm" icon="CalendarPlus" onPress={onSchedule} /> : null}
        </View>
        {interviews.length ? (
          <Timeline
            items={interviews.map((interview) => ({
              key: interview.id,
              title: interview.round,
              actor: `Interviewer: ${interview.interviewer} (${interview.mode})`,
              detail: interview.feedback ?? `${interview.mode} · ${interview.durationMinutes} min`,
              time: formatDate(interview.scheduledAt),
              color: interview.status === 'Completed' ? theme.colors.success : theme.colors.brandPrimary,
            }))}
          />
        ) : (
          <Text style={[styles.emptyMini, { color: theme.colors.textSubtle }]}>No interview rounds scheduled yet.</Text>
        )}
      </View>
      <View style={[styles.footerRow, { borderTopColor: theme.colors.border }]}>
        {candidate.stage === 'Selected' && !offer ? (
          <Button label="Release Formal Offer" variant="primary" size="sm" icon="Sparkles" onPress={onMakeOffer} />
        ) : null}
        {gate ? (
          <Button label="Mark Rejected" variant="outline" size="sm" icon="XCircle" onPress={onReject} />
        ) : null}
        <Button label="Close" variant="outline" size="sm" onPress={onClose} />
      </View>
    </ModalSheet>
  );
};

/* ------------------------------- Release offer -------------------------------- */

export const ReleaseOfferModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobs: JobPosting[];
  candidate: Candidate;
  error?: string;
  onRelease: (payload: ReleaseOfferPayload) => void;
}> = ({ visible, onClose, candidates, jobs, candidate, error, onRelease }) => {
  const { theme } = useTheme();
  const [candidateId, setCandidateId] = useState(candidate.id);
  const selected = candidates.find((c) => c.id === candidateId) ?? candidate;
  const targetJob = jobs.find((j) => j.id === selected.jobId);
  const [designationTitle, setDesignationTitle] = useState(targetJob?.title ?? 'Project Coordinator');
  const [areaId, setAreaId] = useState(targetJob?.areaId ?? 'skill-development');
  const [joiningDate, setJoiningDate] = useState(plusDays(20));
  const [expiryDate, setExpiryDate] = useState(plusDays(10));
  const [annual, setAnnual] = useState(String(selected.expectedSalary || 480000));
  const [monthly, setMonthly] = useState(String(monthlyFromAnnual(selected.expectedSalary || 480000)));
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  const annualNum = Number(annual) || 0;
  const monthlyNum = Number(monthly) || 0;
  const basicHra = Math.round(monthlyNum * 0.7);
  const allowance = monthlyNum - basicHra;

  const editAnnual = (value: string) => {
    setAnnual(value);
    const n = Number(value);
    if (n > 0) setMonthly(String(monthlyFromAnnual(n)));
  };
  const editMonthly = (value: string) => {
    setMonthly(value);
    const n = Number(value);
    if (n > 0) setAnnual(String(annualFromMonthly(n)));
  };

  const pickCandidate = (id: string) => {
    setCandidateId(id);
    const next = candidates.find((c) => c.id === id);
    if (!next) return;
    const job = jobs.find((j) => j.id === next.jobId);
    if (job) {
      setDesignationTitle(job.title);
      setAreaId(job.areaId);
    }
    if (next.expectedSalary) {
      setAnnual(String(next.expectedSalary));
      setMonthly(String(monthlyFromAnnual(next.expectedSalary)));
    }
  };

  const release = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onRelease({
      candidateId,
      designationTitle: designationTitle.trim(),
      areaId,
      joiningDate,
      expiryDate,
      annualSalary: annualNum,
      monthlySalary: monthlyNum,
      termsNotes: terms.trim(),
    });
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label={targetJob ? targetJob.title : 'Employment Offer'}
      title={`Prepare Offer Letter · ${selected.name}`}
      size="md"
      footer={
        <>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Release & Generate Formal Letter" variant="primary" icon="Sparkles" onPress={release} />
        </>
      }
    >
      <SelectField
        label="Select Candidate"
        value={candidateId}
        onChange={pickCandidate}
        options={candidates.map((c) => ({
          value: c.id,
          label: `${c.name} · ${c.stage} (${rupees(c.expectedSalary)} expected)`,
        }))}
      />
      <TextField
        label="Designation Title (Appointment Role)"
        value={designationTitle}
        onChangeText={setDesignationTitle}
        maxLength={100}
      />
      <SelectField
        label="Thematic Area"
        value={areaId}
        onChange={setAreaId}
        options={areaOptions()}
        placeholder="Select thematic area"
      />
      <TextField label="Expected Joining Date" value={joiningDate} onChangeText={setJoiningDate} placeholder="YYYY-MM-DD" />
      <TextField
        label="Offer Acceptance Expiry Date"
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="YYYY-MM-DD"
      />
      <View style={styles.salaryPair}>
        <TextField
          label="Offered Annual CTC (Yearly)"
          value={annual}
          onChangeText={editAnnual}
          keyboardType="numeric"
          suffix="₹"
        />
        <TextField
          label="Offered Monthly Gross"
          value={monthly}
          onChangeText={editMonthly}
          keyboardType="numeric"
          suffix="₹"
        />
      </View>
      <SalaryPanel
        label="Offered Compensation Package"
        tone="highlight"
        annual={annualNum > 0 ? annualNum : undefined}
        caption={`Basic + HRA: ${rupees(basicHra)}/mo · Allowance: ${rupees(allowance)}/mo`}
      />
      <TextField label="Special Offer Terms & Conditions" value={terms} onChangeText={setTerms} multiline />
      {error ? <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{error}</Text> : null}
    </ModalSheet>
  );
};

/* ------------------------------- Offer letter --------------------------------- */

export const OfferLetterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  offer: OfferLetter;
  onNotice: (message: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onOnboard: () => void;
}> = ({ visible, onClose, offer, onNotice, onAccept, onDecline, onOnboard }) => {
  const { theme } = useTheme();
  const rows = [
    { label: 'Basic Salary & House Rent Allowance (HRA)', monthly: offer.basicHra, annual: offer.basicHra * 12 },
    { label: 'Special Field & Operational Allowances', monthly: offer.allowance, annual: offer.allowance * 12 },
    { label: 'Total Cost to Organization (Gross CTC)', monthly: offer.monthlySalary, annual: offer.annualSalary, total: true },
  ];
  const draftEmail = () => {
    const subject = `Formal Employment Offer Letter - ${offer.designationTitle} (Pantiss Foundation)`;
    const body = `Dear ${offer.candidateName},\n\nWe are pleased to extend an offer of employment for the position of ${offer.designationTitle} at Pantiss Foundation with an Annual CTC of ₹${offer.annualSalary.toLocaleString('en-IN')} (Monthly Gross: ₹${offer.monthlySalary.toLocaleString('en-IN')}).\n\nYour joining date is scheduled for ${offer.joiningDate}.\n\nPlease review the attached offer letter and confirm your acceptance before ${offer.expiryDate}.\n\nBest regards,\n${offer.releasedBy}\nPantiss Human Resources`;
    Linking.openURL(
      `mailto:${encodeURIComponent(offer.candidateEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    ).catch(() => {});
  };
  return (
    <ModalSheet visible={visible} onClose={onClose} label={`Document Ref: ${offer.id}`} title={`Letter of Employment Offer · ${offer.candidateName}`} size="lg">
      <View style={[styles.letterHead, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.letterOrg, { color: theme.colors.brandPrimary }]}>PANTISS FOUNDATION</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>
          Centre for Skill &amp; Rural Transformation · Registered Section 8 Enterprise{'\n'}Plot 42, Infocity
          Avenue, Bhubaneswar, Odisha — 751024
        </Text>
      </View>
      <View style={styles.letterMeta}>
        <Text style={[styles.letterMetaStrong, { color: theme.colors.text }]}>Ref: {offer.id}</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>Date: {formatDate(offer.releasedAt)}</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>Validity: {formatDate(offer.expiryDate)}</Text>
      </View>
      <Text style={[styles.letterConfidential, { color: theme.colors.text }]}>CONFIDENTIAL &amp; PERSONAL</Text>
      <View style={styles.letterAddressBlock}>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>To,</Text>
        <Text style={[styles.letterCandidate, { color: theme.colors.text }]}>{offer.candidateName}</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>
          {offer.candidateEmail}
          {offer.candidatePhone ? ` · ${offer.candidatePhone}` : ''}
        </Text>
      </View>
      <Text style={[styles.letterSubject, { color: theme.colors.text }]}>
        SUBJECT: LETTER OF EMPLOYMENT OFFER AND APPOINTMENT
      </Text>
      <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>
        Dear {offer.candidateName}, with reference to your application and subsequent interview evaluations with
        our selection panel, we are pleased to offer you the position of{' '}
        <Text style={{ fontWeight: '600' }}>{offer.designationTitle}</Text> within the{' '}
        <Text style={{ fontWeight: '600' }}>{areaName(offer.areaId)}</Text> programme at Pantiss Foundation.
      </Text>
      <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>
        Your scheduled date of joining will be{' '}
        <Text style={{ fontWeight: '600' }}>{formatDate(offer.joiningDate)}</Text>. Please report to the project
        office at 09:30 AM for your onboarding verification and equipment provisioning.
      </Text>
      <Text style={[styles.letterTermsTitle, { color: theme.colors.text }]}>
        ANNEXURE A: COMPENSATION &amp; BENEFITS BREAKDOWN
      </Text>
      <View style={[styles.compTable, { borderColor: theme.colors.border }]}>
        <View style={[styles.compHeadRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.compHeadCell, { color: theme.colors.textSubtle }]}>Salary Component</Text>
          <Text style={[styles.compHeadCellRight, { color: theme.colors.textSubtle }]}>Monthly (₹)</Text>
          <Text style={[styles.compHeadCellRight, { color: theme.colors.textSubtle }]}>Annual (₹)</Text>
        </View>
        {rows.map((row) => (
          <View key={row.label} style={[styles.compRow3, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.compCellLabel, { color: row.total ? theme.colors.text : theme.colors.textMuted }]}>
              {row.label}
            </Text>
            <Text style={[styles.compCellValue, { color: theme.colors.text }]}>{rupees(row.monthly)}</Text>
            <Text style={[styles.compCellValue, { color: theme.colors.text }]}>{rupees(row.annual)}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.letterTermsTitle, { color: theme.colors.text }]}>TERMS OF APPOINTMENT</Text>
      <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>
        {offer.termsNotes ||
          'Your appointment is subject to satisfactory verification of professional credentials and background checks.'}{' '}
        This offer remains valid until <Text style={{ fontWeight: '600' }}>{formatDate(offer.expiryDate)}</Text>.
        Please indicate your acceptance by signing a duplicate copy or confirming via email response.
      </Text>
      <View style={[styles.signRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.signBox}>
          <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>For Pantiss Foundation</Text>
          <Text style={[styles.sealText, { color: theme.colors.brandPrimary }]}>
            <Icon name="Sparkles" size={10} color={theme.colors.brandPrimary} /> Digitally Authenticated HR Release
          </Text>
          <Text style={[styles.signatureName, { color: theme.colors.text }]}>{offer.releasedBy}</Text>
          <Text style={[styles.letterSub, { color: theme.colors.textSubtle }]}>Head of Human Resources</Text>
        </View>
        <View style={[styles.signBox, styles.signBoxRight]}>
          <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>Candidate Acceptance</Text>
          <Text style={[styles.signLine, { color: theme.colors.text, borderTopColor: theme.colors.border }]}>
            {offer.status === 'Accepted' ? '✓ Accepted Electronically' : '__________________'}
          </Text>
          <Text style={[styles.letterSub, { color: theme.colors.textSubtle }]}>{offer.candidateName}</Text>
        </View>
      </View>
      <View style={[styles.footerRow, { borderTopColor: theme.colors.border }]}>
        <Button
          label="Print / Save PDF"
          variant="outline"
          size="sm"
          icon="Printer"
          onPress={() =>
            onNotice('Offer letter prepared for printing. Use the device share or print option to save it as a PDF.')
          }
        />
        <Button label="Draft Email" variant="outline" size="sm" icon="Mail" onPress={draftEmail} />
      </View>
      <View style={[styles.footerRow, { borderTopWidth: 0 }]}>
        {offer.status === 'Released' ? (
          <>
            <Button
              label="Mark as Accepted"
              variant="primary"
              size="sm"
              icon="Check"
              onPress={() => {
                onAccept();
                onClose();
              }}
            />
            <Button
              label="Mark Declined"
              variant="outline"
              size="sm"
              icon="XCircle"
              onPress={() => {
                onDecline();
                onClose();
              }}
            />
          </>
        ) : null}
        {offer.status === 'Accepted' ? (
          <Button
            label="Transfer to ERP Onboarding"
            variant="emerald"
            size="sm"
            icon="UserPlus"
            onPress={() => {
              onOnboard();
              onClose();
            }}
          />
        ) : null}
        <Button label="Close" variant="outline" size="sm" onPress={onClose} />
      </View>
    </ModalSheet>
  );
};

/* --------------------------------- Styles ------------------------------------ */

const styles = StyleSheet.create({
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileHeadText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  appliedLine: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  applicantSub: {
    fontSize: 11,
  },
  compCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  compHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  compLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  compCaption: {
    fontSize: 10.5,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compTerm: {
    fontSize: 12,
  },
  compValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  compNote: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  compNoteStrong: {
    fontWeight: '600',
  },
  sectionMiniTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 12,
  },
  resumeCode: {
    fontSize: 11.5,
    lineHeight: 16,
    borderRadius: 10,
    padding: 10,
  },
  roundsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  emptyMini: {
    fontSize: 11.5,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
  },
  salaryPair: {
    gap: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  letterHead: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  letterOrg: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  letterSub: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  letterMeta: {
    gap: 3,
    alignItems: 'flex-end',
  },
  letterMetaStrong: {
    fontSize: 12,
    fontWeight: '700',
  },
  letterConfidential: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  letterAddressBlock: {
    gap: 2,
  },
  letterCandidate: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  letterSubject: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  letterBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  letterTermsTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  compTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compHeadRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,144,168,0.08)',
  },
  compHeadCell: {
    flex: 1.6,
    fontSize: 10.5,
    fontWeight: '600',
  },
  compHeadCellRight: {
    flex: 0.8,
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'right',
  },
  compRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  compCellLabel: {
    flex: 1.6,
    fontSize: 11.5,
    lineHeight: 15,
  },
  compCellValue: {
    flex: 0.8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
  },
  signBox: {
    flex: 1,
    gap: 4,
  },
  signBoxRight: {
    alignItems: 'flex-end',
  },
  sealText: {
    fontSize: 10.5,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signLine: {
    fontSize: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 6,
    marginTop: 26,
    minWidth: 140,
    textAlign: 'right',
  },
  signatureName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
