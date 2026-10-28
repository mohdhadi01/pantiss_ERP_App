/**
 * Sub-components + modals for RecruitmentView (web-parity UI only).
 * All business logic stays in RecruitmentView via `store.commit`.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import {
  JobPosting,
  Candidate,
  Interview,
  OfferLetter,
  CandidateStage,
  InterviewRound,
  InterviewMode,
} from '../types';
import { formatRupees } from '../../../utils/formatCurrency';
import { financeAreas } from '../../finance/data';
import { formatDate } from '../../../utils/formatDate';
import { areaName } from '../helpers';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';

/** Amber star-rating color (web data-identity). */
const STAR_FILLED = '#f59e0b';

export const STAGE_OPTIONS: SelectOption[] = [
  'Applied',
  'Screening',
  'Interview Scheduled',
  'Technical Round',
  'HR Round',
  'Selected',
  'Offer Released',
  'Offer Accepted',
  'Rejected',
  'Onboarded',
].map((stage) => ({ value: stage, label: stage }));

const ROUND_OPTIONS: SelectOption[] = [
  'Initial Screening',
  'Technical Assessment',
  'Thematic Panel',
  'HR & Cultural Fit',
  'Final Leadership',
].map((round) => ({ value: round, label: round }));

const DURATION_OPTIONS: SelectOption[] = [30, 45, 60, 90].map((n) => ({
  value: String(n),
  label: `${n} Minutes`,
}));

const MODE_OPTIONS: SelectOption[] = (
  ['Google Meet', 'In-Person (HQ)', 'Phone Screen', 'Microsoft Teams'] as InterviewMode[]
).map((mode) => ({ value: mode, label: mode }));

const RATING_OPTIONS: SelectOption[] = [
  { value: '5', label: '5 / 5 · Outstanding' },
  { value: '4', label: '4 / 5 · Strong' },
  { value: '3', label: '3 / 5 · Meets expectations' },
  { value: '2', label: '2 / 5 · Needs improvement' },
  { value: '1', label: '1 / 5 · Poor' },
];

const RECOMMENDATION_OPTIONS: SelectOption[] = [
  { value: 'Select for Offer', label: 'Select for Offer (Move to Selected)' },
  { value: 'Advance to Next Round', label: 'Advance to Next Round' },
  { value: 'Hold', label: 'Hold for Comparison' },
  { value: 'Reject', label: 'Reject Candidate' },
];

const NOTICE_OPTIONS: SelectOption[] = ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days'].map(
  (n) => ({ value: n, label: n }),
);

export function daysLeft(closingDate: string): number {
  return Math.ceil((new Date(`${closingDate}T23:59:59`).getTime() - Date.now()) / 86_400_000);
}

export function pipelineCounts(candidates: Candidate[]) {
  const activeStages: CandidateStage[] = [
    'Interview Scheduled',
    'Technical Round',
    'HR Round',
    'Selected',
    'Offer Released',
    'Offer Accepted',
  ];
  return {
    applied: candidates.filter((c) => c.stage === 'Applied' || c.stage === 'Screening').length,
    active: candidates.filter((c) => activeStages.includes(c.stage)).length,
    onboarded: candidates.filter((c) => c.stage === 'Onboarded').length,
  };
}

export const Stars: React.FC<{ rating?: number; size?: number }> = ({ rating = 0, size = 12 }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="Star"
          size={size}
          color={n <= Math.round(rating) ? STAR_FILLED : theme.colors.borderStrong}
          strokeWidth={1.8}
        />
      ))}
      {rating > 0 ? (
        <Text style={[styles.starsValue, { color: theme.colors.textMuted }]}>{rating.toFixed(1)}</Text>
      ) : null}
    </View>
  );
};

/* ---------------------------------- Job card --------------------------------- */

export const JobCard: React.FC<{
  job: JobPosting;
  applicants: Candidate[];
  selected: boolean;
  extraBadge?: React.ReactNode;
  onPress: () => void;
}> = ({ job, applicants, selected, extraBadge, onPress }) => {
  const { theme } = useTheme();
  const counts = pipelineCounts(applicants);
  const left = daysLeft(job.closingDate);
  const urgent = job.status !== 'Active' || left < 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.jobCard,
        {
          backgroundColor: theme.colors.moduleBg,
          borderColor: selected ? theme.colors.brandPrimary : theme.colors.border,
          opacity: pressed ? 0.92 : 1,
          ...(theme.shadows.card as object),
        },
      ]}
    >
      <View style={styles.tagRow}>
        <Badge label={areaName(job.areaId)} tone="brand" size="sm" />
        {urgent ? (
          <StatusChip status={job.status === 'Active' ? 'Closed' : job.status} tone={job.status === 'Draft' ? 'neutral' : 'danger'} />
        ) : (
          <StatusChip status={`${left}d left`} tone="warning" />
        )}
        {extraBadge}
        <View style={[styles.countPill, { backgroundColor: theme.colors.brandSoft }]}>
          <Text style={[styles.countPillText, { color: theme.colors.brandPrimary }]}>
            {applicants.length} applicants
          </Text>
        </View>
      </View>
      <Text numberOfLines={2} style={[styles.jobTitle, { color: theme.colors.text }]}>
        {job.title}
      </Text>
      <View style={styles.metaCol}>
        <MetaRow icon="Building2" text={job.location} />
        <MetaRow icon="Clock" text={job.experience} />
        <MetaRow icon="Users" text={`${job.openings} vacancies`} />
      </View>
      <Text style={[styles.pipelineLine, { color: theme.colors.textSubtle }]}>
        {counts.applied} applied › {counts.active} active › {counts.onboarded} onboarded
      </Text>
      <View style={[styles.jobFooter, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.salaryRange, { color: theme.colors.text }]}>
          {formatRupees(Math.round(job.minSalary / 12))}–{formatRupees(Math.round(job.maxSalary / 12))}/mo
        </Text>
        <Text style={[styles.viewLink, { color: theme.colors.brandPrimary }]}>View ›</Text>
      </View>
    </Pressable>
  );
};

const MetaRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.metaRow}>
      <Icon name={icon} size={13} color={theme.colors.textSubtle} />
      <Text numberOfLines={1} style={[styles.metaText, { color: theme.colors.textMuted }]}>
        {text}
      </Text>
    </View>
  );
};

export const SalaryBandCard: React.FC<{ job: JobPosting }> = ({ job }) => {
  const { theme } = useTheme();
  const cells = [
    { label: 'Min Annual', value: formatRupees(job.minSalary) },
    { label: 'Max Annual', value: formatRupees(job.maxSalary) },
    { label: 'Min Monthly', value: formatRupees(Math.round(job.minSalary / 12)) },
    { label: 'Max Monthly', value: formatRupees(Math.round(job.maxSalary / 12)) },
  ];
  return (
    <View style={[styles.bandCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.bandTitle, { color: theme.colors.textMuted }]}>Salary Band (Annual CTC)</Text>
      <View style={styles.bandGrid}>
        {cells.map((cell) => (
          <View key={cell.label} style={styles.bandCell}>
            <Text style={[styles.bandLabel, { color: theme.colors.textSubtle }]}>{cell.label}</Text>
            <Text style={[styles.bandValue, { color: theme.colors.text }]}>{cell.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/* -------------------------------- Applicant row ------------------------------ */

export const ApplicantRow: React.FC<{
  candidate: Candidate;
  onProfile: () => void;
  onShortlist: () => void;
}> = ({ candidate, onProfile, onShortlist }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.applicantCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
      <View style={styles.applicantTop}>
        <Avatar name={candidate.name} size={38} />
        <View style={styles.applicantMain}>
          <Text style={[styles.applicantName, { color: theme.colors.text }]}>{candidate.name}</Text>
          <Text numberOfLines={1} style={[styles.applicantSub, { color: theme.colors.textMuted }]}>
            {candidate.email} · {candidate.phone}
          </Text>
          <Text numberOfLines={1} style={[styles.applicantSub, { color: theme.colors.textSubtle }]}>
            {candidate.experienceYears} yrs exp · Exp. {formatRupees(candidate.expectedSalary)}/yr
            {candidate.currentCompany ? ` · ${candidate.currentCompany}` : ''}
          </Text>
        </View>
        <View style={styles.applicantSide}>
          <StatusChip status={candidate.stage} />
          <Stars rating={candidate.rating} />
        </View>
      </View>
      <View style={styles.applicantActions}>
        <Button label="Profile" variant="outline" size="sm" icon="Eye" onPress={onProfile} />
        {candidate.stage === 'Applied' ? (
          <Button label="Shortlist" variant="primary" size="sm" icon="CheckCircle2" onPress={onShortlist} />
        ) : (
          <Text style={[styles.activeMark, { color: theme.colors.successText }]}>✓ Active</Text>
        )}
      </View>
    </View>
  );
};

/* ----------------------------- Offer tab candidate ---------------------------- */

export const OfferCandidateCard: React.FC<{
  candidate: Candidate;
  offer?: OfferLetter;
  onViewLetter: () => void;
  onRelease: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onOnboard: () => void;
}> = ({ candidate, offer, onViewLetter, onRelease, onAccept, onDecline, onOnboard }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.applicantCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
      <View style={styles.applicantTop}>
        <Avatar name={candidate.name} size={38} />
        <View style={styles.applicantMain}>
          <Text style={[styles.applicantName, { color: theme.colors.text }]}>{candidate.name}</Text>
          <Text numberOfLines={1} style={[styles.applicantSub, { color: theme.colors.textMuted }]}>
            {offer?.designationTitle ?? 'Designation pending'}
          </Text>
          {offer ? (
            <>
              <Text style={[styles.offerLine, { color: theme.colors.text }]}>
                Offer: {formatRupees(offer.annualSalary)}/yr · {formatRupees(offer.monthlySalary)}/mo
              </Text>
              <Text style={[styles.applicantSub, { color: theme.colors.textSubtle }]}>
                Joining: {formatDate(offer.joiningDate)} · Expiry: {formatDate(offer.expiryDate)}
              </Text>
            </>
          ) : null}
        </View>
        <StatusChip status={candidate.stage} />
      </View>
      <View style={styles.applicantActions}>
        {offer ? (
          <Button label="View Offer Letter" variant="outline" size="sm" icon="FileText" onPress={onViewLetter} />
        ) : null}
        {!offer ? (
          <Button label="Release Offer Letter" variant="primary" size="sm" icon="Sparkles" onPress={onRelease} />
        ) : null}
        {offer?.status === 'Released' ? (
          <>
            <Button label="Accepted" variant="outline" size="sm" icon="Check" onPress={onAccept} />
            <Button label="Declined" variant="outline" size="sm" icon="XCircle" onPress={onDecline} />
          </>
        ) : null}
        {offer?.status === 'Accepted' ? (
          <Button label="Onboard to ERP" variant="emerald" size="sm" icon="UserPlus" onPress={onOnboard} />
        ) : null}
      </View>
    </View>
  );
};

/* -------------------------- Create / edit job requisition --------------------- */

export const PostingModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  initial?: JobPosting;
  onSave: (posting: JobPosting) => void;
}> = ({ visible, onClose, initial, onSave }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [areaId, setAreaId] = useState(initial?.areaId ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [experience, setExperience] = useState(initial?.experience ?? '');
  const [openings, setOpenings] = useState(String(initial?.openings ?? 1));
  const [minSalary, setMinSalary] = useState(String(initial?.minSalary ?? ''));
  const [maxSalary, setMaxSalary] = useState(String(initial?.maxSalary ?? ''));
  const [closingDate, setClosingDate] = useState(initial?.closingDate ?? '');
  const [status, setStatus] = useState<string>(initial?.status ?? 'Active');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [requirements, setRequirements] = useState(initial?.requirements.join('\n') ?? '');

  const minAnnual = Number(minSalary) || 0;
  const maxAnnual = Number(maxSalary) || 0;

  const save = () => {
    onSave({
      id: initial?.id ?? `JOB-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      title,
      areaId,
      department,
      location,
      experience,
      openings: Number(openings) || 1,
      minSalary: minAnnual,
      maxSalary: maxAnnual,
      status: status as JobPosting['status'],
      postedDate: initial?.postedDate ?? new Date().toISOString().slice(0, 10),
      closingDate,
      description,
      requirements: requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Recruitment"
      title={initial ? 'Edit Job Requisition' : 'Create Job Requisition'}
      size="lg"
      footer={
        <>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Save Job Requisition" variant="primary" icon="Check" onPress={save} />
        </>
      }
    >
      <FieldRow>
        <TextField label="Job Title" value={title} onChangeText={setTitle} placeholder="e.g. Community Livelihood Coordinator" />
      </FieldRow>
      <AreaSelect value={areaId} onChange={setAreaId} />
      <FieldRow>
        <TextField label="Department" value={department} onChangeText={setDepartment} placeholder="e.g. Field Operations" />
        <TextField label="Deployment Workstation / Centre" value={location} onChangeText={setLocation} placeholder="e.g. Angul Skill Centre" />
      </FieldRow>
      <FieldRow>
        <TextField label="Experience Range" value={experience} onChangeText={setExperience} placeholder="e.g. 3–5 Years" />
        <TextField label="Number of Open Vacancies" value={openings} onChangeText={setOpenings} keyboardType="numeric" />
      </FieldRow>
      <FieldRow>
        <TextField label="Minimum Salary (Annual CTC)" value={minSalary} onChangeText={setMinSalary} keyboardType="numeric" suffix="₹" />
        <TextField label="Maximum Salary (Annual CTC)" value={maxSalary} onChangeText={setMaxSalary} keyboardType="numeric" suffix="₹" />
      </FieldRow>
      <FieldRow>
        <TextField label="Closing Application Date" value={closingDate} onChangeText={setClosingDate} placeholder="YYYY-MM-DD" />
        <SelectField
          label="Posting Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Closed', label: 'Closed' },
          ]}
        />
      </FieldRow>
      <View style={[styles.monthBand, { backgroundColor: theme.colors.brandSoft }]}>
        <Text style={[styles.monthBandTitle, { color: theme.colors.brandPrimary }]}>
          Calculated Monthly Salary Band
        </Text>
        <View style={styles.bandGrid}>
          <View style={styles.bandCell}>
            <Text style={[styles.bandLabel, { color: theme.colors.textMuted }]}>Min Monthly Gross</Text>
            <Text style={[styles.bandValue, { color: theme.colors.text }]}>{formatRupees(Math.round(minAnnual / 12))}</Text>
          </View>
          <View style={styles.bandCell}>
            <Text style={[styles.bandLabel, { color: theme.colors.textMuted }]}>Max Monthly Gross</Text>
            <Text style={[styles.bandValue, { color: theme.colors.text }]}>{formatRupees(Math.round(maxAnnual / 12))}</Text>
          </View>
        </View>
        <Text style={[styles.monthBandHint, { color: theme.colors.textMuted }]}>Monthly = Annual ÷ 12</Text>
      </View>
      <TextField label="Job Description" value={description} onChangeText={setDescription} multiline placeholder="Role purpose, scope and reporting line…" />
      <TextField
        label="Key Requirements (One requirement per line)"
        value={requirements}
        onChangeText={setRequirements}
        multiline
        placeholder="Postgraduate degree in relevant field…"
      />
    </ModalSheet>
  );
};

export const AreaSelect: React.FC<{ value: string; onChange: (v: string) => void; label?: string }> = ({
  value,
  onChange,
  label = 'Thematic Area',
}) => {
  const options = areaOptions();
  return <SelectField label={label} value={value} onChange={onChange} options={options} placeholder="Select thematic area" />;
};

export const areaOptions = (): SelectOption[] =>
  financeAreas.map((area) => ({ value: area.id, label: area.name }));

/* ------------------------------- Add applicant ------------------------------- */

export const ApplicantModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  defaultJobId?: string;
  onSave: (candidate: Candidate) => void;
}> = ({ visible, onClose, jobs, defaultJobId, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState(defaultJobId ?? jobs[0]?.id ?? '');
  const [experience, setExperience] = useState('');
  const [notice, setNotice] = useState('30 Days');
  const [company, setCompany] = useState('');
  const [expected, setExpected] = useState('');
  const [summary, setSummary] = useState('');

  const save = () => {
    onSave({
      id: `APP-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      jobId,
      name,
      email,
      phone,
      currentCompany: company || undefined,
      experienceYears: Number(experience) || 0,
      currentSalary: undefined,
      expectedSalary: Number(expected) || 0,
      noticePeriod: notice,
      stage: 'Applied',
      appliedDate: new Date().toISOString().slice(0, 10),
      resumeSummary: summary || undefined,
    });
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Applicant tracking"
      title="Add Job Applicant"
      size="lg"
      footer={
        <>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Save Applicant" variant="primary" icon="Check" onPress={save} />
        </>
      }
    >
      <FieldRow>
        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Candidate full name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" />
      </FieldRow>
      <FieldRow>
        <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 …" keyboardType="phone-pad" />
        <SelectField
          label="Target Job Requisition"
          value={jobId}
          onChange={setJobId}
          options={jobs.map((job) => ({ value: job.id, label: job.title }))}
        />
      </FieldRow>
      <FieldRow>
        <TextField label="Total Experience (years)" value={experience} onChangeText={setExperience} keyboardType="numeric" placeholder="e.g. 4" />
        <SelectField label="Notice Period" value={notice} onChange={setNotice} options={NOTICE_OPTIONS} />
      </FieldRow>
      <FieldRow>
        <TextField label="Current Company" value={company} onChangeText={setCompany} placeholder="e.g. Pradan Foundation" />
        <TextField label="Expected Annual CTC" value={expected} onChangeText={setExpected} keyboardType="numeric" suffix="₹" />
      </FieldRow>
      <TextField label="Profile Summary" value={summary} onChangeText={setSummary} multiline placeholder="Qualifications, field exposure and key strengths…" />
    </ModalSheet>
  );
};

/* ------------------------------ Candidate profile ----------------------------- */

export const ProfileModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidate: Candidate;
  interviews: Interview[];
  onStageChange: (stage: CandidateStage) => void;
}> = ({ visible, onClose, candidate, interviews, onStageChange }) => {
  const { theme } = useTheme();
  return (
    <ModalSheet visible={visible} onClose={onClose} label="Candidate profile" title={candidate.name} size="md">
      <View style={styles.profileTop}>
        <Avatar name={candidate.name} size={46} />
        <View style={styles.profileHeadText}>
          <Text style={[styles.applicantSub, { color: theme.colors.textMuted }]}>
            {candidate.email} · {candidate.phone}
          </Text>
          <Stars rating={candidate.rating} size={14} />
        </View>
      </View>
      <SelectField
        label="Pipeline stage"
        value={candidate.stage}
        onChange={(v) => onStageChange(v as CandidateStage)}
        options={STAGE_OPTIONS}
      />
      <View style={styles.bandGrid}>
        <View style={[styles.bandCell, styles.compCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
          <Text style={[styles.bandLabel, { color: theme.colors.textSubtle }]}>Expected CTC</Text>
          <Text style={[styles.bandValue, { color: theme.colors.text }]}>{formatRupees(candidate.expectedSalary)}/yr</Text>
        </View>
        <View style={[styles.bandCell, styles.compCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
          <Text style={[styles.bandLabel, { color: theme.colors.textSubtle }]}>Current CTC</Text>
          <Text style={[styles.bandValue, { color: theme.colors.text }]}>
            {candidate.currentSalary ? `${formatRupees(candidate.currentSalary)}/yr` : '—'}
          </Text>
        </View>
      </View>
      {candidate.resumeSummary ? (
        <Text style={[styles.notesText, { color: theme.colors.textMuted }]}>&ldquo;{candidate.resumeSummary}&rdquo;</Text>
      ) : null}
      <View>
        <Text style={[styles.sectionMiniTitle, { color: theme.colors.text }]}>Interview Rounds</Text>
        {interviews.length ? (
          <Timeline
            items={interviews.map((interview) => ({
              key: interview.id,
              title: interview.round,
              actor: interview.interviewer,
              detail: interview.feedback ?? `${interview.mode} · ${interview.durationMinutes} min`,
              time: formatDate(interview.scheduledAt),
              color: interview.status === 'Completed' ? theme.colors.success : theme.colors.brandPrimary,
            }))}
          />
        ) : (
          <Text style={[styles.emptyMini, { color: theme.colors.textSubtle }]}>No interview rounds scheduled yet.</Text>
        )}
      </View>
    </ModalSheet>
  );
};

/* ------------------------------ Schedule interview ---------------------------- */

export const ScheduleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidate: Candidate;
  onSave: (interview: Interview) => void;
}> = ({ visible, onClose, candidate, onSave }) => {
  const [round, setRound] = useState<string>('Initial Screening');
  const [when, setWhen] = useState('');
  const [duration, setDuration] = useState('45');
  const [interviewer, setInterviewer] = useState('');
  const [mode, setMode] = useState<string>('Google Meet');
  const [meetLink, setMeetLink] = useState('');

  const save = () => {
    onSave({
      id: `INT-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      round: round as InterviewRound,
      scheduledAt: when,
      durationMinutes: Number(duration) || 45,
      interviewer,
      mode: mode as InterviewMode,
      meetLink: meetLink || undefined,
      status: 'Scheduled',
    });
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Interview scheduling"
      title={`Schedule Interview · ${candidate.name}`}
      size="md"
      footer={
        <>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Schedule Interview" variant="primary" icon="CalendarClock" onPress={save} />
        </>
      }
    >
      <SelectField label="Round" value={round} onChange={setRound} options={ROUND_OPTIONS} />
      <TextField label="Date & Time" value={when} onChangeText={setWhen} placeholder="YYYY-MM-DDTHH:MM" autoCapitalize="none" />
      <FieldRow>
        <SelectField label="Duration" value={duration} onChange={setDuration} options={DURATION_OPTIONS} />
        <TextField label="Interviewer / Panel Name" value={interviewer} onChangeText={setInterviewer} placeholder="e.g. Dr. Minati Biswal" />
      </FieldRow>
      <SelectField label="Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
      {mode === 'Google Meet' || mode === 'Microsoft Teams' ? (
        <TextField label="Meeting URL" value={meetLink} onChangeText={setMeetLink} placeholder="https://meet.google.com/…" autoCapitalize="none" />
      ) : null}
    </ModalSheet>
  );
};

/* ----------------------------- Interview evaluation --------------------------- */

export const FeedbackModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  interview: Interview;
  onSubmit: (feedback: string, rating: number, recommendation: NonNullable<Interview['recommendation']>) => void;
}> = ({ visible, onClose, interview, onSubmit }) => {
  const [rating, setRating] = useState(String(interview.rating ?? 4));
  const [recommendation, setRecommendation] = useState<string>(interview.recommendation ?? 'Advance to Next Round');
  const [feedback, setFeedback] = useState(interview.feedback ?? '');

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label={`${interview.round} · ${interview.status}`}
      title="Interview Evaluation"
      size="md"
      footer={
        <Button
          label="Submit Evaluation"
          variant="primary"
          icon="Check"
          onPress={() => onSubmit(feedback, Number(rating) || 0, recommendation as NonNullable<Interview['recommendation']>)}
        />
      }
    >
      <FieldRow>
        <SelectField label="Rating" value={rating} onChange={setRating} options={RATING_OPTIONS} />
        <SelectField label="Recommendation Decision" value={recommendation} onChange={setRecommendation} options={RECOMMENDATION_OPTIONS} />
      </FieldRow>
      <TextField
        label="Panel Observations & Technical Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        placeholder="Domain depth, field readiness, communication and culture fit…"
      />
    </ModalSheet>
  );
};

/* ------------------------------- Release offer ------------------------------- */

export const ReleaseOfferModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidate: Candidate;
  job?: JobPosting;
  onRelease: (annualSalary: number, joiningDate: string) => void;
}> = ({ visible, onClose, candidate, job, onRelease }) => {
  const [salary, setSalary] = useState(String(candidate.expectedSalary || ''));
  const [joiningDate, setJoiningDate] = useState('');

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Offer release"
      title={`Release Offer Letter · ${candidate.name}`}
      description={job ? `${job.title} · ${areaName(job.areaId)}` : undefined}
      size="sm"
      footer={
        <Button
          label="Release Offer Letter"
          variant="primary"
          icon="Sparkles"
          onPress={() => onRelease(Number(salary) || 0, joiningDate)}
        />
      }
    >
      <TextField label="Annual CTC" value={salary} onChangeText={setSalary} keyboardType="numeric" suffix="₹" />
      <TextField label="Joining Date" value={joiningDate} onChangeText={setJoiningDate} placeholder="YYYY-MM-DD" />
      <Text style={styles.monthBandHint}>
        Monthly = Annual ÷ 12. The letter is valid for 21 days before the joining date.
      </Text>
    </ModalSheet>
  );
};

/* ------------------------------- Offer letter view ---------------------------- */

export const OfferLetterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  offer: OfferLetter;
}> = ({ visible, onClose, offer }) => {
  const { theme } = useTheme();
  const refDate = new Date(offer.releasedAt).toISOString().slice(0, 10);
  const compensation = [
    { label: 'Basic Salary & HRA', value: formatRupees(offer.basicHra * 12) },
    { label: 'Special Field Allowances', value: formatRupees(offer.allowance * 12) },
  ];
  return (
    <ModalSheet visible={visible} onClose={onClose} label="Offer letter" title={`OFR · ${offer.candidateName}`} size="md">
      <View style={[styles.letterHead, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.letterOrg, { color: theme.colors.brandPrimary }]}>PANTISS FOUNDATION</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textMuted }]}>
          Centre for Skill &amp; Rural Transformation
        </Text>
      </View>
      <View style={styles.letterMeta}>
        <MetaRow icon="FileText" text={`Ref No: ${offer.id}`} />
        <MetaRow icon="Calendar" text={`Date: ${refDate}`} />
        <MetaRow icon="Clock" text={`Validity: ${formatDate(offer.expiryDate)}`} />
      </View>
      <Text style={[styles.letterSubject, { color: theme.colors.text }]}>
        SUBJECT: LETTER OF EMPLOYMENT OFFER AND APPOINTMENT
      </Text>
      <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>
        Dear {offer.candidateName}, we are pleased to offer you the position of {offer.designationTitle} at
        Pantiss Foundation, joining on {formatDate(offer.joiningDate)}. Your compensation is structured as
        follows:
      </Text>
      <View style={[styles.compTable, { borderColor: theme.colors.border }]}>
        {compensation.map((row) => (
          <View key={row.label} style={[styles.compRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.compLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
            <Text style={[styles.compValue, { color: theme.colors.text }]}>{row.value}</Text>
          </View>
        ))}
        <View style={styles.compRow}>
          <Text style={[styles.compLabel, { color: theme.colors.text }]}>Total CTC</Text>
          <Text style={[styles.compValue, { color: theme.colors.brandPrimary }]}>{formatRupees(offer.annualSalary)}</Text>
        </View>
      </View>
      <Text style={[styles.letterTermsTitle, { color: theme.colors.text }]}>TERMS OF APPOINTMENT</Text>
      <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>
        {offer.termsNotes ??
          'Probationary period: 6 months. Workstation: as per the assigned project centre.'}{' '}
        This offer is valid until {formatDate(offer.expiryDate)}. Acceptance confirms your availability from
        the joining date and adherence to foundation policies.
      </Text>
      <View style={styles.signature}>
        <Text style={[styles.letterBody, { color: theme.colors.textMuted }]}>For Pantiss Foundation</Text>
        <Text style={[styles.signatureName, { color: theme.colors.text }]}>Ritika Sen</Text>
        <Text style={[styles.letterSub, { color: theme.colors.textSubtle }]}>HR Manager</Text>
      </View>
    </ModalSheet>
  );
};

/* --------------------------------- Helpers ----------------------------------- */

export const FieldRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.fieldRow}>
    {React.Children.map(children, (child, index) => (
      <View key={index} style={styles.fieldCell}>
        {child}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldCell: {
    flexGrow: 1,
    flexBasis: 200,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsValue: {
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 3,
    fontVariant: ['tabular-nums'],
  },
  jobCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 9,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    lineHeight: 19,
  },
  metaCol: {
    gap: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaText: {
    flex: 1,
    fontSize: 11.5,
  },
  pipelineLine: {
    fontSize: 10.5,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  salaryRange: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  bandCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  bandTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bandCell: {
    flexGrow: 1,
    flexBasis: 100,
    gap: 2,
  },
  bandLabel: {
    fontSize: 10.5,
  },
  bandValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  monthBand: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  monthBandTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  monthBandHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  applicantCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  applicantTop: {
    flexDirection: 'row',
    gap: 11,
  },
  applicantMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  applicantSide: {
    alignItems: 'flex-end',
    gap: 5,
  },
  applicantName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  applicantSub: {
    fontSize: 11,
  },
  activeMark: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
  },
  applicantActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  offerLine: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileHeadText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  compCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sectionMiniTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyMini: {
    fontSize: 11.5,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  letterHead: {
    alignItems: 'center',
    gap: 3,
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
  },
  letterMeta: {
    gap: 5,
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
  },
  compTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  compValue: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  signature: {
    gap: 3,
    marginTop: 6,
  },
  signatureName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
