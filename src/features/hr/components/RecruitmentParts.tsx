import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import {
  JobPosting,
  Candidate,
  Interview,
  OfferLetter,
  InterviewRound,
  InterviewMode,
} from '../types';
import { formatRupees } from '../../../utils/formatCurrency';
import { financeAreas } from '../../finance/data';
import { formatDate, formatDateTime } from '../../../utils/formatDate';
import { areaName } from '../helpers';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';

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
  label: n === 60 ? '60 Minutes (1 Hour)' : `${n} Minutes`,
}));

const MODE_OPTIONS: SelectOption[] = (
  ['Google Meet', 'In-Person (HQ)', 'Phone Screen', 'Microsoft Teams'] as InterviewMode[]
).map((mode) => ({ value: mode, label: mode }));

const RATING_OPTIONS: SelectOption[] = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: `${n} / 5 ${n === 5 ? '· Outstanding' : n === 4 ? '· Strong Fit' : n === 3 ? '· Acceptable' : '· Substandard'}`,
}));

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

export function urgencyLabel(days: number): { label: string; tone: 'ok' | 'warn' | 'danger' } {
  if (days < 0) return { label: 'Closed', tone: 'danger' };
  if (days <= 5) return { label: `${days}d left`, tone: 'danger' };
  if (days <= 14) return { label: `${days}d left`, tone: 'warn' };
  return { label: `${days}d left`, tone: 'ok' };
}

export function pipelineCounts(candidates: Candidate[]) {
  return {
    applied: candidates.length,
    active: candidates.filter((c) => c.stage !== 'Applied' && c.stage !== 'Rejected').length,
    onboarded: candidates.filter((c) => c.stage === 'Onboarded').length,
  };
}

export function vacanciesLabel(n: number): string {
  return `${n} vacanc${n > 1 ? 'ies' : 'y'}`;
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
        <MetaRow icon="Users" text={vacanciesLabel(job.openings)} />
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
          {candidate.resumeSummary ? (
            <Text numberOfLines={2} style={[styles.resumeBlurb, { color: theme.colors.textMuted }]}>
              &ldquo;{candidate.resumeSummary}&rdquo;
            </Text>
          ) : null}
        </View>
        <View style={styles.applicantSide}>
          <StatusChip status={candidate.stage} />
          <Stars rating={candidate.rating} />
        </View>
      </View>
      <View style={[styles.applicantActions, { borderTopColor: theme.colors.border }]}>
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
      title={initial ? `Edit Requisition · ${initial.title}` : 'Create Job Requisition'}
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
      <TextField
        label="Job Description & Core Purpose"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Detailed responsibilities, team leadership, field expectations..."
      />
      <TextField
        label="Key Requirements (One requirement per line)"
        value={requirements}
        onChangeText={setRequirements}
        multiline
        placeholder={'Diploma / B.Tech degree required\nTOT certification preferred\nProficiency in Odia & English...'}
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

export const ApplicantModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  defaultJobId?: string;
  error?: string;
  onSave: (candidate: Candidate) => void;
}> = ({ visible, onClose, jobs, defaultJobId, error, onSave }) => {
  const { theme } = useTheme();
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
          <Button label="Register Candidate" variant="primary" icon="Check" onPress={save} />
        </>
      }
    >
      <FieldRow>
        <TextField label="Candidate Full Name" value={name} onChangeText={setName} placeholder="e.g. Ananya Das" />
        <TextField label="Email Address" value={email} onChangeText={setEmail} placeholder="candidate@example.org" autoCapitalize="none" />
      </FieldRow>
      <FieldRow>
        <TextField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+91 98000 00000" keyboardType="phone-pad" />
        <SelectField
          label="Target Job Requisition"
          value={jobId}
          onChange={setJobId}
          options={jobs.map((job) => ({ value: job.id, label: `${job.title} (${areaName(job.areaId)})` }))}
        />
      </FieldRow>
      <FieldRow>
        <TextField label="Total Experience (Years)" value={experience} onChangeText={setExperience} keyboardType="numeric" placeholder="e.g. 4" />
        <SelectField label="Notice Period" value={notice} onChange={setNotice} options={NOTICE_OPTIONS} />
      </FieldRow>
      <FieldRow>
        <TextField label="Current Company / Employer" value={company} onChangeText={setCompany} placeholder="Optional" />
        <TextField label="Expected Annual CTC" value={expected} onChangeText={setExpected} keyboardType="numeric" suffix="₹" />
      </FieldRow>
      <TextField
        label="Profile & Experience Summary"
        value={summary}
        onChangeText={setSummary}
        multiline
        placeholder="Key qualifications, degree, past projects, skill highlights..."
      />
      {error ? <Text style={[styles.modalError, { color: theme.colors.dangerText }]}>{error}</Text> : null}
    </ModalSheet>
  );
};

export const ScheduleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  candidate: Candidate;
  onSave: (interview: Interview) => void;
}> = ({ visible, onClose, candidate, onSave }) => {
  const { theme } = useTheme();
  const defaultSlot = () => {
    const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    d.setHours(11, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [round, setRound] = useState<string>('Technical Assessment');
  const [when, setWhen] = useState(defaultSlot);
  const [duration, setDuration] = useState('45');
  const [interviewer, setInterviewer] = useState('Dr. Alok Verma (Lead Technical Panel)');
  const [mode, setMode] = useState<string>('Google Meet');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/pan-interview-room');

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
          <Button label="Confirm & Schedule Round" variant="primary" icon="CalendarClock" onPress={save} />
        </>
      }
    >
      <SelectField label="Interview Round" value={round} onChange={setRound} options={ROUND_OPTIONS} />
      <TextField label="Interview Date & Time" value={when} onChangeText={setWhen} placeholder="YYYY-MM-DDTHH:MM" autoCapitalize="none" />
      <FieldRow>
        <SelectField label="Duration (Minutes)" value={duration} onChange={setDuration} options={DURATION_OPTIONS} />
        <TextField
          label="Interviewer / Panel Name"
          value={interviewer}
          onChangeText={setInterviewer}
          placeholder="e.g. Ramesh Chandra Das (Programme Director)"
        />
      </FieldRow>
      <SelectField label="Interview Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
      {mode === 'Google Meet' || mode === 'Microsoft Teams' ? (
        <TextField label="Meeting URL" value={meetLink} onChangeText={setMeetLink} placeholder="https://meet.google.com/..." autoCapitalize="none" />
      ) : null}
    </ModalSheet>
  );
};

export const FeedbackModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  interview: Interview;
  candidateName?: string;
  onSubmit: (feedback: string, rating: number, recommendation: NonNullable<Interview['recommendation']>) => void;
}> = ({ visible, onClose, interview, candidateName, onSubmit }) => {
  const { theme } = useTheme();
  const isCompleted = interview.status === 'Completed';
  const [rating, setRating] = useState(String(interview.rating ?? 4));
  const [recommendation, setRecommendation] = useState<string>(interview.recommendation ?? 'Select for Offer');
  const [feedback, setFeedback] = useState(interview.feedback ?? '');

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label={candidateName ?? interview.round}
      title={`Interview Evaluation · ${interview.round}`}
      size="md"
      footer={
        isCompleted ? (
          <Button label="Close" variant="outline" onPress={onClose} />
        ) : (
          <Button
            label="Save Evaluation & Update Candidate Stage"
            variant="primary"
            icon="Check"
            onPress={() => onSubmit(feedback, Number(rating) || 0, recommendation as NonNullable<Interview['recommendation']>)}
          />
        )
      }
    >
      <View style={[styles.evalHead, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
        <Text style={[styles.evalHeadName, { color: theme.colors.text }]}>
          {candidateName ?? 'Candidate'} · {interview.round}
        </Text>
        <Text style={[styles.evalHeadNote, { color: theme.colors.textMuted }]}>
          Interviewer: {interview.interviewer} · Scheduled: {formatDateTime(interview.scheduledAt)}
        </Text>
      </View>
      <FieldRow>
        <SelectField label="Evaluation Rating (1–5 Stars)" value={rating} onChange={setRating} options={RATING_OPTIONS} disabled={isCompleted} />
        <SelectField label="Recommendation Decision" value={recommendation} onChange={setRecommendation} options={RECOMMENDATION_OPTIONS} disabled={isCompleted} />
      </FieldRow>
      <TextField
        label="Panel Observations & Technical Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        editable={!isCompleted}
        placeholder="Record strengths, technical knowledge, safety compliance, communication skills..."
      />
    </ModalSheet>
  );
};

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
    padding: 14,
    gap: 12,
  },
  applicantTop: {
    flexDirection: 'row',
    gap: 12,
  },
  applicantMain: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  applicantSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  applicantSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  resumeBlurb: {
    fontSize: 11.5,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalError: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  evalHead: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  evalHeadName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  evalHeadNote: {
    fontSize: 11,
  },
  activeMark: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
  },
  applicantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
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
