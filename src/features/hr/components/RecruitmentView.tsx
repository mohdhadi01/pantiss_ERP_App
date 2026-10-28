import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { HRStore } from '../store';
import { JobPosting, Candidate, Interview, OfferLetter, CandidateStage } from '../types';
import { formatDate } from '../../../utils/formatDate';
import {
  onboardCandidateFromOffer,
  saveCandidate,
  saveJobPosting,
  scheduleInterview,
  submitInterviewFeedback,
  updateCandidateStage,
  updateOfferStatus,
  releaseOfferLetter,
} from '../helpers';
import { funnelStages } from '../../../theme/gradients';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { FunnelBars } from '../../../components/ui/FunnelBars';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { SelectField } from '../../../components/ui/SelectField';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import {
  ApplicantModal,
  ApplicantRow,
  AreaSelect,
  FeedbackModal,
  FieldRow,
  JobCard,
  OfferCandidateCard,
  OfferLetterModal,
  PostingModal,
  ProfileModal,
  ReleaseOfferModal,
  SalaryBandCard,
  ScheduleModal,
  Stars,
  pipelineCounts,
} from './RecruitmentParts';

export interface RecruitmentViewProps {
  store: HRStore;
}

type TabKey = 'postings' | 'interviews' | 'offers' | 'ats';
const HR_ACTOR = 'Ritika Sen (HR Manager)';
const OFFER_STAGES: CandidateStage[] = ['Selected', 'Offer Released', 'Offer Accepted', 'Onboarded'];

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { data, commit } = store;

  const [activeTab, setActiveTab] = useState<TabKey>('postings');
  const [selectedJobId, setSelectedJobId] = useState<string>(data.jobPostings[0]?.id ?? '');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('all');
  const [atsSearch, setAtsSearch] = useState('');
  const [atsStage, setAtsStage] = useState('all');
  const [atsJobId, setAtsJobId] = useState('all');

  const [postingModal, setPostingModal] = useState<{ open: boolean; editing?: JobPosting }>({ open: false });
  const [applicantModalOpen, setApplicantModalOpen] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<Candidate | null>(null);
  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
  const [feedbackInterview, setFeedbackInterview] = useState<Interview | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<{ candidate: Candidate; job?: JobPosting } | null>(null);
  const [letterOffer, setLetterOffer] = useState<OfferLetter | null>(null);

  const selectedJob = data.jobPostings.find((j) => j.id === selectedJobId) ?? data.jobPostings[0];

  const funnel = useMemo(
    () =>
      funnelStages.map((stage) => {
        const count = data.candidates.filter((c) => {
          if (stage.key === 'applied') return c.stage === 'Applied';
          if (stage.key === 'shortlisted') return c.stage === 'Screening';
          if (stage.key === 'interviews')
            return ['Interview Scheduled', 'Technical Round', 'HR Round'].includes(c.stage);
          if (stage.key === 'selected') return c.stage === 'Selected';
          if (stage.key === 'offered') return c.stage === 'Offer Released' || c.stage === 'Offer Accepted';
          return c.stage === 'Onboarded';
        }).length;
        return { key: stage.key, label: stage.label, count, color: stage.color };
      }),
    [data.candidates],
  );

  const pipelineCount = data.candidates.filter((c) => c.stage !== 'Rejected' && c.stage !== 'Onboarded').length;
  const activeRoles = data.jobPostings.filter((j) => j.status === 'Active').length;
  const pendingInterviews = data.interviews.filter((i) => i.status === 'Scheduled').length;
  const onboardedCount = data.candidates.filter((c) => c.stage === 'Onboarded').length;
  const offersInPlay = data.offerLetters.filter((o) => o.status !== 'Onboarded' && o.status !== 'Declined').length;

  const jobApplicants = data.candidates.filter((c) => c.jobId === selectedJob?.id);
  const filteredApplicants = jobApplicants.filter((c) => {
    const q = applicantSearch.trim().toLowerCase();
    const matches = `${c.name} ${c.email} ${c.currentCompany ?? ''}`.toLowerCase().includes(q);
    const stageOK =
      applicantFilter === 'all'
        ? true
        : applicantFilter === 'applied'
          ? c.stage === 'Applied'
          : ['Screening', 'Interview Scheduled', 'Technical Round', 'HR Round'].includes(c.stage);
    return matches && stageOK;
  });

  const interviewCandidates = jobApplicants.filter((c) =>
    ['Applied', 'Screening', 'Interview Scheduled', 'Technical Round', 'HR Round'].includes(c.stage),
  );
  const offerCandidates = data.candidates.filter((c) => OFFER_STAGES.includes(c.stage));
  const offerFor = (candidateId: string) => data.offerLetters.find((o) => o.candidateId === candidateId);

  const atsRows = data.candidates.filter((c) => {
    const q = atsSearch.trim().toLowerCase();
    const matches = `${c.name} ${c.email} ${c.currentCompany ?? ''}`.toLowerCase().includes(q);
    return matches && (atsStage === 'all' || c.stage === atsStage) && (atsJobId === 'all' || c.jobId === atsJobId);
  });

  const handleTab = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(key as TabKey);
  };

  const handleSavePosting = (posting: JobPosting) => {
    commit((prev) => saveJobPosting(prev, posting), 'Job requisition saved.');
    setSelectedJobId(posting.id);
    setPostingModal({ open: false });
  };

  const handleSaveApplicant = (candidate: Candidate) => {
    commit((prev) => saveCandidate(prev, candidate), 'Applicant added to the pipeline.');
    setApplicantModalOpen(false);
  };

  const handleStageChange = (candidateId: string, stage: CandidateStage, note?: string, message?: string) => {
    commit((prev) => updateCandidateStage(prev, candidateId, stage, note), message ?? 'Candidate stage updated.');
  };

  const handleSchedule = (interview: Interview) => {
    commit((prev) => scheduleInterview(prev, interview), `Interview scheduled for ${formatDate(interview.scheduledAt)}.`);
    setScheduleCandidate(null);
  };

  const handleSubmitFeedback = (
    interviewId: string,
    feedback: string,
    rating: number,
    recommendation: NonNullable<Interview['recommendation']>,
  ) => {
    commit(
      (prev) => submitInterviewFeedback(prev, interviewId, feedback, rating, recommendation),
      'Interview evaluation submitted.',
    );
    setFeedbackInterview(null);
  };

  const handleReleaseOffer = (annualSalary: number, joiningDate: string) => {
    if (!releaseTarget) return;
    const { candidate, job } = releaseTarget;
    const monthly = Math.round(annualSalary / 12);
    const offer: OfferLetter = {
      id: `OFR-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      designationTitle: job?.title ?? 'Programme Officer',
      areaId: job?.areaId ?? '',
      joiningDate,
      annualSalary,
      monthlySalary: monthly,
      basicHra: Math.round(monthly * 0.7),
      allowance: Math.round(monthly * 0.3),
      expiryDate: new Date(
        new Date(`${joiningDate}T12:00:00`).getTime() - 21 * 86_400_000,
      ).toISOString().slice(0, 10),
      status: 'Released',
      releasedAt: new Date().toISOString(),
      releasedBy: HR_ACTOR,
    };
    commit((prev) => releaseOfferLetter(prev, offer), 'Offer letter released to the candidate.');
    setReleaseTarget(null);
  };

  const handleOnboard = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => onboardCandidateFromOffer(prev, offerId), 'Candidate onboarded into ERP successfully as Active Employee!');
  };

  const tabs = [
    { key: 'postings', label: 'Job Postings', icon: 'Briefcase', count: data.jobPostings.length },
    { key: 'interviews', label: 'Interviews', icon: 'CalendarClock', count: data.interviews.length },
    { key: 'offers', label: 'Offers & Selection', icon: 'FileCheck', count: offerCandidates.length },
    { key: 'ats', label: 'All Applicants (ATS)', icon: 'Users', count: data.candidates.length },
  ];

  const renderJobList = () => (
    <SectionCard
      title="Job Requisitions & Openings"
      action={<Button label="Post New Role" variant="primary" size="sm" icon="Plus" onPress={() => setPostingModal({ open: true })} />}
      style={isMd ? styles.leftCol : styles.fullWidth}
    >
      <View style={styles.stack}>
        {data.jobPostings.map((job) => {
          const applicants = data.candidates.filter((c) => c.jobId === job.id);
          const interviewsForJob = data.interviews.filter((i) => i.jobId === job.id && i.status === 'Scheduled');
          return (
            <JobCard
              key={job.id}
              job={job}
              applicants={applicants}
              selected={job.id === selectedJob?.id}
              extraBadge={
                activeTab === 'interviews' && interviewsForJob.length ? (
                  <View style={[styles.countPill, { backgroundColor: theme.colors.warningSoft }]}>
                    <Text style={[styles.countPillText, { color: theme.colors.warningText }]}>
                      {interviewsForJob.length} interviews
                    </Text>
                  </View>
                ) : undefined
              }
              onPress={() => setSelectedJobId(job.id)}
            />
          );
        })}
      </View>
    </SectionCard>
  );

  const renderPostingDetail = () => {
    if (!selectedJob) return <EmptyState icon="Briefcase" title="No job requisitions" description="Post a new role to start hiring." />;
    const counts = pipelineCounts(jobApplicants);
    return (
      <Card padding={20} style={isMd ? styles.rightCol : styles.fullWidth}>
        <View style={styles.tagRow}>
          <Badge label={selectedJob.status} tone={selectedJob.status === 'Active' ? 'success' : 'neutral'} size="sm" />
          <Badge label={formatDate(selectedJob.closingDate)} tone="neutral" size="sm" />
        </View>
        <Text style={[theme.fontStyles.h2, { color: theme.colors.text }]}>{selectedJob.title}</Text>
        <Text style={[styles.detailMeta, { color: theme.colors.textMuted }]}>
          {selectedJob.department} · {selectedJob.location} · {selectedJob.experience} · {selectedJob.openings} vacancies
        </Text>
        <Button label="Edit Posting" variant="outline" size="sm" icon="Settings2" onPress={() => setPostingModal({ open: true, editing: selectedJob })} />
        <SalaryBandCard job={selectedJob} />
        <Text style={[styles.detailBody, { color: theme.colors.textMuted }]}>{selectedJob.description}</Text>
        <View style={styles.stack}>
          {selectedJob.requirements.map((req) => (
            <View key={req} style={styles.reqRow}>
              <Icon name="Check" size={13} color={theme.colors.brandPrimary} />
              <Text style={[styles.reqText, { color: theme.colors.textMuted }]}>{req}</Text>
            </View>
          ))}
        </View>
        <View style={styles.applicantsHeader}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Applicants ({jobApplicants.length})</Text>
          <Button label="Add Applicant" variant="primary" size="sm" icon="UserPlus" onPress={() => setApplicantModalOpen(true)} />
        </View>
        <Text style={[styles.pipelineLine, { color: theme.colors.textSubtle }]}>
          {counts.applied} applied › {counts.active} active › {counts.onboarded} onboarded
        </Text>
        <SearchFilterBar
          searchQuery={applicantSearch}
          onSearchChange={setApplicantSearch}
          placeholder="Search applicants by name, email, company…"
          filters={[
            { id: 'all', label: 'All', count: jobApplicants.length },
            { id: 'applied', label: 'Applied', count: jobApplicants.filter((c) => c.stage === 'Applied').length },
            {
              id: 'shortlisted',
              label: 'Shortlisted',
              count: jobApplicants.filter((c) => ['Screening', 'Interview Scheduled', 'Technical Round', 'HR Round'].includes(c.stage)).length,
            },
          ]}
          activeFilter={applicantFilter}
          onFilterChange={setApplicantFilter}
        />
        {filteredApplicants.length ? (
          <View style={styles.stack}>
            {filteredApplicants.map((candidate) => (
              <ApplicantRow
                key={candidate.id}
                candidate={candidate}
                onProfile={() => setProfileCandidate(candidate)}
                onShortlist={() =>
                  handleStageChange(candidate.id, 'Screening', 'Shortlisted by HR.', 'Candidate shortlisted.')
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="Users" title="No applicants match" description="Adjust the search or add a new applicant." />
        )}
      </Card>
    );
  };

  const renderInterviewsTab = () => (
    <View style={[styles.splitRow, isMd && styles.splitRowWide]}>
      {renderJobList()}
      <SectionCard
        title={`Shortlisted Candidates (${interviewCandidates.length})`}
        description={selectedJob ? selectedJob.title : undefined}
        style={isMd ? styles.rightCol : styles.fullWidth}
      >
        {interviewCandidates.length ? (
          <View style={styles.stack}>
            {interviewCandidates.map((candidate) => {
              const rounds = data.interviews.filter((i) => i.candidateId === candidate.id);
              return (
                <View key={candidate.id} style={[styles.interviewCard, { borderColor: theme.colors.border }]}>
                  <View style={styles.applicantTop}>
                    <Avatar name={candidate.name} size={36} />
                    <View style={styles.applicantMain}>
                      <Text style={[styles.applicantName, { color: theme.colors.text }]}>{candidate.name}</Text>
                      <Text numberOfLines={1} style={[styles.detailMeta, { color: theme.colors.textSubtle }]}>
                        {candidate.experienceYears} yrs exp · {formatDate(candidate.appliedDate)}
                      </Text>
                    </View>
                    <StatusChip status={candidate.stage} />
                  </View>
                  {rounds.map((round) => (
                    <View key={round.id} style={[styles.roundRow, { backgroundColor: theme.colors.surfaceSoft }]}>
                      <View style={styles.roundMain}>
                        <View style={styles.tagRow}>
                          <Badge label={round.round} tone="brand" size="sm" />
                          <StatusChip status={round.status} dot={false} />
                        </View>
                        <Text style={[styles.detailMeta, { color: theme.colors.textMuted }]}>
                          {formatDate(round.scheduledAt)} · {round.interviewer}
                        </Text>
                      </View>
                      <View style={styles.roundSide}>
                        {round.rating ? <Stars rating={round.rating} /> : null}
                        <Button
                          label={round.status === 'Completed' ? 'View Feedback' : 'Submit Feedback'}
                          variant={round.status === 'Completed' ? 'outline' : 'primary'}
                          size="sm"
                          onPress={() => setFeedbackInterview(round)}
                        />
                      </View>
                    </View>
                  ))}
                  <View style={styles.applicantActions}>
                    <Button label="Schedule Interview" variant="primary" size="sm" icon="CalendarPlus" onPress={() => setScheduleCandidate(candidate)} />
                    <Button
                      label="Selected"
                      variant="outline"
                      size="sm"
                      icon="Check"
                      onPress={() => handleStageChange(candidate.id, 'Selected', 'Cleared all interview rounds.', 'Candidate moved to Selected.')}
                    />
                    <Button
                      label="Rejected"
                      variant="outline"
                      size="sm"
                      icon="XCircle"
                      onPress={() => handleStageChange(candidate.id, 'Rejected', 'Rejected after interview rounds.', 'Candidate marked Rejected.')}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState icon="CalendarClock" title="No candidates in the interview pipeline" description="Shortlist applicants to schedule their interview rounds." />
        )}
      </SectionCard>
    </View>
  );

  const atsColumns: Array<DataColumn<Candidate>> = [
    { key: 'candidate', label: 'Candidate', flex: 1.4 },
    { key: 'role', label: 'Applied Role', flex: 1.3 },
    { key: 'exp', label: 'Experience & CTC', flex: 1.1 },
    { key: 'stage', label: 'Stage', flex: 1 },
    { key: 'rating', label: 'Rating', width: 110 },
    { key: 'applied', label: 'Applied Date', width: 100 },
    { key: 'actions', label: 'Actions', width: 132 },
  ];

  return (
    <View style={styles.container}>
      {/* Header block */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border, ...(theme.shadows.card as object) }]}>
        {isMd ? (
          <View style={[styles.iconTile, { backgroundColor: theme.colors.brandSoft }]}>
            <Icon name="UserCheck" size={19} color={theme.colors.brandPrimary} strokeWidth={1.9} />
          </View>
        ) : null}
        <View style={styles.headerMain}>
          <Text style={[theme.fontStyles.h2, { color: theme.colors.text }]}>Recruitment &amp; Hiring</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textMuted }]}>
            {activeRoles} active roles · {pipelineCount} in pipeline · {pendingInterviews} interviews pending
          </Text>
        </View>
        <View style={[styles.headerStat, { backgroundColor: theme.colors.successSoft }]}>
          <Icon name="TrendingUp" size={15} color={theme.colors.successText} />
          <Text style={[styles.headerStatText, { color: theme.colors.successText }]}>
            {onboardedCount} onboarded this cycle
          </Text>
        </View>
      </View>

      <SectionCard title="Recruitment funnel" description="Candidates across pipeline stages">
        <FunnelBars stages={funnel} />
      </SectionCard>

      <View style={styles.metricsGrid}>
        <MetricCard label="Active Job Openings" value={activeRoles} style={styles.metric} />
        <MetricCard label="Candidates in Pipeline" value={pipelineCount} style={styles.metric} />
        <MetricCard label="Interviews Pending" value={pendingInterviews} style={styles.metric} />
        <MetricCard label="Offers in Play" value={offersInPlay} style={styles.metric} />
      </View>

      <Tabs items={tabs} activeKey={activeTab} onChange={handleTab} accent={theme.colors.brandPrimary} />

      {activeTab === 'postings' || activeTab === 'interviews' ? (
        activeTab === 'postings' ? (
          <View style={[styles.splitRow, isMd && styles.splitRowWide]}>
            {renderJobList()}
            {renderPostingDetail()}
          </View>
        ) : (
          renderInterviewsTab()
        )
      ) : null}

      {activeTab === 'offers' ? (
        <SectionCard title="Offers & Selection" description="Release, track and onboard accepted candidates">
          {offerCandidates.length ? (
            <View style={styles.stack}>
              {offerCandidates.map((candidate) => (
                <OfferCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  offer={offerFor(candidate.id)}
                  onViewLetter={() => {
                    const offer = offerFor(candidate.id);
                    if (offer) setLetterOffer(offer);
                  }}
                  onRelease={() => setReleaseTarget({ candidate, job: data.jobPostings.find((j) => j.id === candidate.jobId) })}
                  onAccept={() =>
                    commit((prev) => updateOfferStatus(prev, offerFor(candidate.id)!.id, 'Accepted'), 'Offer acceptance recorded.')
                  }
                  onDecline={() =>
                    commit((prev) => updateOfferStatus(prev, offerFor(candidate.id)!.id, 'Declined'), 'Offer decline recorded.')
                  }
                  onOnboard={() => {
                    const offer = offerFor(candidate.id);
                    if (offer) handleOnboard(offer.id);
                  }}
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="FileCheck" title="No candidates at offer stage" description="Select candidates from interviews to release offer letters." />
          )}
        </SectionCard>
      ) : null}

      {activeTab === 'ats' ? (
        <SectionCard
          title="Applicant Pipeline"
          description="Candidate profiles, stage transitions, interview scoring and offer releases"
          action={<Button label="Add Candidate" variant="primary" size="sm" icon="UserPlus" onPress={() => setApplicantModalOpen(true)} />}
        >
          <FieldRow>
            <SearchFilterBar searchQuery={atsSearch} onSearchChange={setAtsSearch} placeholder="Search candidates…" style={styles.flex1Search} />
          </FieldRow>
          <FieldRow>
            <View style={styles.selectHalf}>
              <SelectField
                label="Stage"
                value={atsStage}
                onChange={setAtsStage}
                options={[
                  { value: 'all', label: `All stages (${data.candidates.length})` },
                  ...[
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
                  ].map((stage) => ({
                    value: stage,
                    label: `${stage} (${data.candidates.filter((c) => c.stage === stage).length})`,
                  })),
                ]}
              />
            </View>
            <View style={styles.selectHalf}>
              <SelectField
                label="Job requisition"
                value={atsJobId}
                onChange={setAtsJobId}
                options={[{ value: 'all', label: 'All requisitions' }, ...data.jobPostings.map((j) => ({ value: j.id, label: j.title }))]}
              />
            </View>
          </FieldRow>
          <DataTable
            columns={atsColumns}
            rows={atsRows}
            keyExtractor={(row) => row.id}
            emptyTitle="No applicants found"
            emptyDescription="Adjust the filters or add candidates to the pipeline."
            emptyIcon="Users"
            renderCell={(row, column) => {
              switch (column.key) {
                case 'candidate':
                  return (
                    <View style={styles.cellPerson}>
                      <Avatar name={row.name} size={30} />
                      <View style={styles.cellPersonText}>
                        <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{row.name}</Text>
                        <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textMuted }]}>{row.email}</Text>
                      </View>
                    </View>
                  );
                case 'role':
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{data.jobPostings.find((j) => j.id === row.jobId)?.title ?? '—'}</Text>;
                case 'exp':
                  return (
                    <Text style={[styles.cellText, { color: theme.colors.text }]}>
                      {row.experienceYears} yrs · ₹{row.expectedSalary.toLocaleString('en-IN')}/yr
                    </Text>
                  );
                case 'stage':
                  return <StatusChip status={row.stage} />;
                case 'rating':
                  return <Stars rating={row.rating} />;
                case 'applied':
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{formatDate(row.appliedDate)}</Text>;
                default:
                  return (
                    <View style={styles.cellActions}>
                      <Pressable onPress={() => setProfileCandidate(row)} hitSlop={6}>
                        <Icon name="Eye" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => setScheduleCandidate(row)} hitSlop={6}>
                        <Icon name="CalendarPlus" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => setReleaseTarget({ candidate: row, job: data.jobPostings.find((j) => j.id === row.jobId) })} hitSlop={6}>
                        <Icon name="Sparkles" size={16} color={theme.colors.brandPrimary} />
                      </Pressable>
                    </View>
                  );
              }
            }}
            renderMobileCard={(row) => (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.applicantTop}>
                  <Avatar name={row.name} size={36} />
                  <View style={styles.applicantMain}>
                    <Text style={[styles.applicantName, { color: theme.colors.text }]}>{row.name}</Text>
                    <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textMuted }]}>{row.email}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {row.experienceYears} yrs · ₹{row.expectedSalary.toLocaleString('en-IN')}/yr · {formatDate(row.appliedDate)}
                    </Text>
                  </View>
                  <StatusChip status={row.stage} />
                </View>
                <Stars rating={row.rating} />
              </View>
            )}
          />
        </SectionCard>
      ) : null}

      {/* Modals */}
      {postingModal.open ? (
        <PostingModal
          key={postingModal.editing?.id ?? 'new-posting'}
          visible
          onClose={() => setPostingModal({ open: false })}
          initial={postingModal.editing}
          onSave={handleSavePosting}
        />
      ) : null}
      {applicantModalOpen ? (
        <ApplicantModal
          key={selectedJob?.id ?? 'new-applicant'}
          visible
          onClose={() => setApplicantModalOpen(false)}
          jobs={data.jobPostings}
          defaultJobId={activeTab === 'ats' ? undefined : selectedJob?.id}
          onSave={handleSaveApplicant}
        />
      ) : null}
      {profileCandidate ? (
        <ProfileModal
          key={profileCandidate.id}
          visible
          onClose={() => setProfileCandidate(null)}
          candidate={profileCandidate}
          interviews={data.interviews.filter((i) => i.candidateId === profileCandidate.id)}
          onStageChange={(stage) => {
            handleStageChange(profileCandidate.id, stage);
            setProfileCandidate(null);
          }}
        />
      ) : null}
      {scheduleCandidate ? (
        <ScheduleModal
          key={scheduleCandidate.id}
          visible
          onClose={() => setScheduleCandidate(null)}
          candidate={scheduleCandidate}
          onSave={handleSchedule}
        />
      ) : null}
      {feedbackInterview ? (
        <FeedbackModal
          key={feedbackInterview.id}
          visible
          onClose={() => setFeedbackInterview(null)}
          interview={feedbackInterview}
          onSubmit={(feedback, rating, recommendation) =>
            handleSubmitFeedback(feedbackInterview.id, feedback, rating, recommendation)
          }
        />
      ) : null}
      {releaseTarget ? (
        <ReleaseOfferModal
          key={releaseTarget.candidate.id}
          visible
          onClose={() => setReleaseTarget(null)}
          candidate={releaseTarget.candidate}
          job={releaseTarget.job}
          onRelease={handleReleaseOffer}
        />
      ) : null}
      {letterOffer ? <OfferLetterModal visible onClose={() => setLetterOffer(null)} offer={letterOffer} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 13,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  headerSub: {
    fontSize: 12,
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  headerStatText: {
    fontSize: 11,
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
    alignItems: 'flex-start',
  },
  leftCol: {
    flexGrow: 1,
    flexBasis: 320,
  },
  rightCol: {
    flexGrow: 1.35,
    flexBasis: 320,
  },
  fullWidth: {
    width: '100%',
  },
  stack: {
    gap: 10,
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
  detailMeta: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  detailBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  reqRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
  },
  reqText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
  applicantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  pipelineLine: {
    fontSize: 10.5,
  },
  interviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 9,
  },
  applicantTop: {
    flexDirection: 'row',
    gap: 10,
  },
  applicantMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  applicantName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  applicantActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  roundRow: {
    borderRadius: 12,
    padding: 11,
    gap: 8,
  },
  roundMain: {
    gap: 5,
  },
  roundSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  flex1Search: {
    marginBottom: 0,
    flex: 1,
    minWidth: 220,
  },
  selectHalf: {
    flexGrow: 1,
    flexBasis: 200,
  },
  cellPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  cellPersonText: {
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
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  cellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 9,
  },
});
