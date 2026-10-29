import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { HRStore } from '../store';
import { JobPosting, Candidate, Interview, OfferLetter, CandidateStage } from '../types';
import { formatDate } from '../../../utils/formatDate';
import {
  areaName,
  onboardCandidateFromOffer,
  releaseOfferLetter,
  rupees,
  saveCandidate,
  saveJobPosting,
  scheduleInterview,
  submitInterviewFeedback,
  updateCandidateStage,
  updateOfferStatus,
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
  FeedbackModal,
  FieldRow,
  JobCard,
  OfferCandidateCard,
  PostingModal,
  ScheduleModal,
  Stars,
  daysLeft,
  pipelineCounts,
  urgencyLabel,
  vacanciesLabel,
} from './RecruitmentParts';
import { OfferLetterModal, ProfileModal, ReleaseOfferModal, ReleaseOfferPayload } from './RecruitmentOfferParts';

export interface RecruitmentViewProps {
  store: HRStore;
}

type TabKey = 'postings' | 'interviews' | 'offers' | 'ats';
const HR_ACTOR = 'Ritika Sen (HR Manager)';
const OFFER_STAGES: CandidateStage[] = ['Selected', 'Offer Released', 'Offer Accepted', 'Onboarded'];
const INTERVIEW_STAGES: CandidateStage[] = ['Screening', 'Interview Scheduled', 'Technical Round', 'HR Round'];

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { data, commit, setNotice } = store;

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
          if (stage.key === 'interviews') return INTERVIEW_STAGES.includes(c.stage);
          if (stage.key === 'selected') return c.stage === 'Selected';
          if (stage.key === 'offered') return c.stage === 'Offer Released' || c.stage === 'Offer Accepted';
          return c.stage === 'Onboarded';
        }).length;
        return { key: stage.key, label: stage.label, count, color: stage.color };
      }),
    [data.candidates],
  );

  const pipelineCount = data.candidates.filter((c) => c.stage !== 'Rejected' && c.stage !== 'Onboarded').length;
  const totalOpenings = data.jobPostings
    .filter((j) => j.status === 'Active')
    .reduce((sum, j) => sum + j.openings, 0);
  const activeRoles = data.jobPostings.filter((j) => j.status === 'Active').length;
  const pendingInterviews = data.interviews.filter((i) => i.status === 'Scheduled').length;
  const completedInterviews = data.interviews.filter((i) => i.status === 'Completed').length;
  const onboardedCount = data.candidates.filter((c) => c.stage === 'Onboarded').length;
  const offersInPlay = data.offerLetters.filter((o) => o.status === 'Released' || o.status === 'Accepted').length;
  const acceptedOffers = data.offerLetters.filter((o) => o.status === 'Accepted').length;
  const onboardedOffers = data.offerLetters.filter((o) => o.status === 'Onboarded').length;

  const jobApplicants = data.candidates.filter((c) => c.jobId === selectedJob?.id);
  const filteredApplicants = jobApplicants.filter((c) => {
    const q = applicantSearch.trim().toLowerCase();
    const matches = `${c.name} ${c.email} ${c.currentCompany ?? ''}`.toLowerCase().includes(q);
    const stageOK =
      applicantFilter === 'all'
        ? true
        : applicantFilter === 'applied'
          ? c.stage === 'Applied'
          : INTERVIEW_STAGES.includes(c.stage);
    return matches && stageOK;
  });

  const interviewCandidates = jobApplicants.filter((c) => INTERVIEW_STAGES.includes(c.stage));
  const offerFor = (candidateId: string) => data.offerLetters.find((o) => o.candidateId === candidateId);

  const atsRows = data.candidates.filter((c) => {
    const q = atsSearch.trim().toLowerCase();
    const matches = `${c.name} ${c.email} ${c.phone} ${c.currentCompany ?? ''}`.toLowerCase().includes(q);
    return matches && (atsStage === 'all' || c.stage === atsStage) && (atsJobId === 'all' || c.jobId === atsJobId);
  });

  const handleTab = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(key as TabKey);
  };

  const handleSavePosting = (posting: JobPosting) => {
    commit((prev) => saveJobPosting(prev, posting), `Job requisition ${posting.title} saved.`);
    setSelectedJobId(posting.id);
    setPostingModal({ open: false });
  };

  const handleSaveApplicant = (candidate: Candidate) => {
    commit((prev) => saveCandidate(prev, candidate), 'New candidate registered in ATS pipeline.');
    setApplicantModalOpen(false);
  };

  const handleStageChange = (candidateId: string, stage: CandidateStage, note?: string, message?: string) => {
    commit((prev) => updateCandidateStage(prev, candidateId, stage, note), message ?? `Candidate moved to ${stage}.`);
  };

  const handleSchedule = (interview: Interview) => {
    const candidate = data.candidates.find((c) => c.id === interview.candidateId);
    commit((prev) => scheduleInterview(prev, interview), `Interview scheduled with ${candidate?.name ?? 'candidate'}.`);
    setScheduleCandidate(null);
  };

  const handleSubmitFeedback = (
    interviewId: string,
    feedback: string,
    rating: number,
    recommendation: NonNullable<Interview['recommendation']>,
  ) => {
    const interview = data.interviews.find((i) => i.id === interviewId);
    const candidate = data.candidates.find((c) => c.id === interview?.candidateId);
    commit(
      (prev) => submitInterviewFeedback(prev, interviewId, feedback, rating, recommendation),
      `Interview evaluation submitted for ${candidate?.name ?? 'candidate'}.`,
    );
    setFeedbackInterview(null);
  };

  const handleReleaseOffer = (payload: ReleaseOfferPayload) => {
    const candidate = data.candidates.find((c) => c.id === payload.candidateId);
    if (!candidate) return;
    const basicHra = Math.round(payload.monthlySalary * 0.7);
    const offer: OfferLetter = {
      id: `OFR-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      designationTitle: payload.designationTitle,
      areaId: payload.areaId,
      joiningDate: payload.joiningDate,
      annualSalary: payload.annualSalary,
      monthlySalary: payload.monthlySalary,
      basicHra,
      allowance: payload.monthlySalary - basicHra,
      expiryDate: payload.expiryDate,
      status: 'Released',
      releasedAt: new Date().toISOString(),
      releasedBy: HR_ACTOR,
      termsNotes: payload.termsNotes,
    };
    commit(
      (prev) => releaseOfferLetter(prev, offer),
      `Offer letter released for ${offer.candidateName} at ${rupees(offer.annualSalary)}/yr.`,
    );
    setReleaseTarget(null);
  };

  const handleOnboard = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => onboardCandidateFromOffer(prev, offerId), 'Candidate onboarded into ERP successfully as Active Employee!');
  };

  const tabs = [
    { key: 'postings', label: 'Job Postings', icon: 'Briefcase', count: data.jobPostings.length },
    {
      key: 'interviews',
      label: 'Interviews',
      icon: 'CalendarClock',
      count: data.candidates.filter((c) => INTERVIEW_STAGES.includes(c.stage)).length,
    },
    { key: 'offers', label: 'Offers & Selection', icon: 'FileCheck', count: data.offerLetters.length },
    { key: 'ats', label: 'All Applicants (ATS)', icon: 'Users', count: data.candidates.length },
  ];

  const renderJobList = () => (
    <SectionCard
      title="Job Requisitions & Openings"
      description="Select a job card to view applicants, review resumes, and shortlist candidates."
      action={<Button label="Post New Role" variant="primary" size="sm" icon="Plus" onPress={() => setPostingModal({ open: true })} />}
      style={isMd ? styles.leftCol : styles.fullWidth}
    >
      <View style={styles.stack}>
        {data.jobPostings.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            applicants={data.candidates.filter((c) => c.jobId === job.id)}
            selected={job.id === selectedJob?.id}
            onPress={() => setSelectedJobId(job.id)}
          />
        ))}
      </View>
    </SectionCard>
  );

  const renderPostingDetail = () => {
    if (!selectedJob) return <EmptyState icon="Briefcase" title="No job requisitions" description="Post a new role to start hiring." />;
    const counts = pipelineCounts(jobApplicants);
    const urgency = urgencyLabel(daysLeft(selectedJob.closingDate));
    return (
      <Card padding={22} style={[isMd ? styles.rightCol : styles.fullWidth, styles.postingCard]}>
        <View style={[styles.jobPanelHeader, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.jobPanelHeaderContent}>
            <View style={styles.tagRow}>
              <Badge label={areaName(selectedJob.areaId)} tone="brand" size="sm" />
              <Badge label={selectedJob.status} tone={selectedJob.status === 'Active' ? 'success' : 'neutral'} size="sm" />
              <Badge
                label={`Closes ${formatDate(selectedJob.closingDate)} · ${urgency.label}`}
                tone={urgency.tone === 'ok' ? 'neutral' : urgency.tone === 'warn' ? 'warning' : 'danger'}
                size="sm"
              />
            </View>
            <Text style={[styles.jobPanelTitle, { color: theme.colors.text }]}>{selectedJob.title}</Text>
            <View style={styles.metaRowInline}>
              {selectedJob.department ? (
                <View style={styles.metaItem}>
                  <Icon name="Briefcase" size={12} color={theme.colors.textSubtle} />
                  <Text style={[styles.metaItemText, { color: theme.colors.textMuted }]}>
                    {selectedJob.department}
                  </Text>
                </View>
              ) : null}
              <View style={styles.metaItem}>
                <Icon name="Building2" size={12} color={theme.colors.textSubtle} />
                <Text style={[styles.metaItemText, { color: theme.colors.textMuted }]}>
                  {selectedJob.location}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="Clock" size={12} color={theme.colors.textSubtle} />
                <Text style={[styles.metaItemText, { color: theme.colors.textMuted }]}>{selectedJob.experience}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="Users" size={12} color={theme.colors.textSubtle} />
                <Text style={[styles.metaItemText, { color: theme.colors.textMuted }]}>{vacanciesLabel(selectedJob.openings)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.editBtnContainer}>
            <Button
              label="Edit Posting"
              variant="outline"
              size="sm"
              icon="Settings2"
              onPress={() => setPostingModal({ open: true, editing: selectedJob })}
            />
          </View>
        </View>

        {(selectedJob.description || selectedJob.requirements.length > 0) && (
          <View style={[styles.jobPanelDescSection, { borderBottomColor: theme.colors.border }]}>
            {selectedJob.description ? (
              <Text style={[styles.detailBody, { color: theme.colors.textMuted }]}>{selectedJob.description}</Text>
            ) : null}
            {selectedJob.requirements.length > 0 && (
              <View style={styles.requirementsList}>
                {selectedJob.requirements.map((req) => (
                  <View key={req} style={styles.reqRow}>
                    <Icon name="Check" size={13} color={theme.colors.brandPrimary} />
                    <Text style={[styles.reqText, { color: theme.colors.textMuted }]}>{req}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.applicantsSection}>
          <View style={styles.applicantsHeader}>
            <View style={styles.applicantsHeaderTitleWrap}>
              <View style={styles.applicantsTitleRow}>
                <Text style={[styles.applicantsTitleText, { color: theme.colors.text }]}>Applicants</Text>
                <View style={[styles.countPillMini, { backgroundColor: theme.colors.brandSoft }]}>
                  <Text style={[styles.countPillMiniText, { color: theme.colors.brandPrimary }]}>
                    {jobApplicants.length}
                  </Text>
                </View>
              </View>
              <Text style={[styles.pipelineLine, { color: theme.colors.textSubtle }]}>
                {counts.applied} applied › {counts.active} active › {counts.onboarded} onboarded
              </Text>
            </View>
            <Button
              label="Add Applicant"
              variant="primary"
              size="sm"
              icon="UserPlus"
              onPress={() => setApplicantModalOpen(true)}
            />
          </View>

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
                count: jobApplicants.filter((c) => c.stage !== 'Applied' && c.stage !== 'Rejected').length,
              },
            ]}
            activeFilter={applicantFilter}
            onFilterChange={setApplicantFilter}
          />

          {filteredApplicants.length ? (
            <View style={styles.applicantsStack}>
              {filteredApplicants.map((candidate) => (
                <ApplicantRow
                  key={candidate.id}
                  candidate={candidate}
                  onProfile={() => setProfileCandidate(candidate)}
                  onShortlist={() =>
                    handleStageChange(candidate.id, 'Screening', 'Shortlisted by HR.', `${candidate.name} shortlisted for interview scheduling.`)
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="Users" title="No applicants match" description="Adjust the search or add a new applicant." />
          )}
        </View>
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
                        {candidate.email} · {candidate.experienceYears} yrs exp
                      </Text>
                      <Text numberOfLines={1} style={[styles.detailMeta, { color: theme.colors.textSubtle }]}>
                        Notice: {candidate.noticePeriod} · Expected: {rupees(candidate.expectedSalary)}/yr
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
                      onPress={() => handleStageChange(candidate.id, 'Selected', undefined, `${candidate.name} marked as Selected.`)}
                    />
                    <Button
                      label="Rejected"
                      variant="outline"
                      size="sm"
                      icon="XCircle"
                      onPress={() => handleStageChange(candidate.id, 'Rejected', undefined, `${candidate.name} marked as Rejected.`)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="CalendarClock"
            title="No shortlisted candidates for this job yet."
            description="Go to Job Postings and shortlist applicants first."
          />
        )}
      </SectionCard>
    </View>
  );

  const atsColumns: DataColumn<Candidate>[] = [
    { key: 'candidate', label: 'Candidate', flex: 1.4 },
    { key: 'role', label: 'Applied Role', flex: 1.3 },
    { key: 'exp', label: 'Experience & CTC', flex: 1.1 },
    { key: 'stage', label: 'Stage', flex: 1 },
    { key: 'rating', label: 'Rating', width: 110 },
    { key: 'applied', label: 'Applied Date', width: 110 },
    { key: 'actions', label: 'Action', width: 118 },
  ];

  return (
    <View style={styles.container}>
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
        <MetricCard
          label="Active Job Openings"
          value={activeRoles}
          subtitle={`${totalOpenings} open positions across projects`}
          style={styles.metric}
        />
        <MetricCard
          label="Candidates in Pipeline"
          value={pipelineCount}
          subtitle={`${data.candidates.length} total applicants tracked`}
          style={styles.metric}
        />
        <MetricCard
          label="Interviews Pending"
          value={pendingInterviews}
          subtitle={`${completedInterviews} rounds completed`}
          style={styles.metric}
        />
        <MetricCard
          label="Offers in Play"
          value={offersInPlay}
          subtitle={`${acceptedOffers} accepted · ${onboardedOffers} onboarded`}
          style={styles.metric}
        />
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
        <SectionCard title="Offer Letters & Appointment Releases" description="Click a job card to see selected candidates. Release formal offer letters and onboard to ERP.">
          {data.candidates.filter((c) => OFFER_STAGES.includes(c.stage)).length ? (
            <View style={styles.stack}>
              {data.candidates
                .filter((c) => OFFER_STAGES.includes(c.stage))
                .map((candidate) => (
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
                      commit(
                        (prev) => updateOfferStatus(prev, offerFor(candidate.id)!.id, 'Accepted'),
                        `Offer accepted by ${candidate.name}.`,
                      )
                    }
                    onDecline={() =>
                      commit(
                        (prev) => updateOfferStatus(prev, offerFor(candidate.id)!.id, 'Declined'),
                        `Offer declined by ${candidate.name}.`,
                      )
                    }
                    onOnboard={() => {
                      const offer = offerFor(candidate.id);
                      if (offer) handleOnboard(offer.id);
                    }}
                  />
                ))}
            </View>
          ) : (
            <EmptyState icon="FileCheck" title="No selected candidates yet for this job." description="Mark candidates as Selected in Interview Schedule first." />
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
            <SearchFilterBar searchQuery={atsSearch} onSearchChange={setAtsSearch} placeholder="Search employee, email or ID" style={styles.flex1Search} />
          </FieldRow>
          <FieldRow>
            <View style={styles.selectHalf}>
              <SelectField
                label="Stage filter"
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
                label="Job filter"
                value={atsJobId}
                onChange={setAtsJobId}
                options={[{ value: 'all', label: 'All job openings' }, ...data.jobPostings.map((j) => ({ value: j.id, label: j.title }))]}
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
              const stage = row.stage;
              switch (column.key) {
                case 'candidate':
                  return (
                    <Pressable onPress={() => setProfileCandidate(row)} style={styles.cellPerson}>
                      <Avatar name={row.name} size={30} />
                      <View style={styles.cellPersonText}>
                        <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{row.name}</Text>
                        <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textMuted }]}>{row.email}</Text>
                      </View>
                    </Pressable>
                  );
                case 'role':
                  return (
                    <View>
                      <Text style={[styles.cellText, { color: theme.colors.text }]}>
                        {data.jobPostings.find((j) => j.id === row.jobId)?.title ?? 'General Application'}
                      </Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>
                        {areaName(data.jobPostings.find((j) => j.id === row.jobId)?.areaId ?? '')}
                      </Text>
                    </View>
                  );
                case 'exp':
                  return (
                    <View>
                      <Text style={[styles.cellText, { color: theme.colors.text }]}>{row.experienceYears} yrs exp</Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>Exp: {rupees(row.expectedSalary)} / yr</Text>
                    </View>
                  );
                case 'stage':
                  return <StatusChip status={row.stage} />;
                case 'rating':
                  return row.rating ? <Stars rating={row.rating} /> : <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Unrated</Text>;
                case 'applied':
                  return (
                    <View>
                      <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{formatDate(row.appliedDate)}</Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{row.noticePeriod} notice</Text>
                    </View>
                  );
                default: {
                  const gated = stage !== 'Rejected' && stage !== 'Onboarded';
                  return (
                    <View style={styles.cellActions}>
                      <Pressable onPress={() => setProfileCandidate(row)} hitSlop={6} accessibilityLabel="View candidate profile">
                        <Icon name="Eye" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                      {gated ? (
                        <Pressable onPress={() => setScheduleCandidate(row)} hitSlop={6} accessibilityLabel="Schedule interview round">
                          <Icon name="CalendarPlus" size={16} color={theme.colors.textMuted} />
                        </Pressable>
                      ) : null}
                      {stage === 'Selected' ? (
                        <Pressable
                          onPress={() => setReleaseTarget({ candidate: row, job: data.jobPostings.find((j) => j.id === row.jobId) })}
                          hitSlop={6}
                          accessibilityLabel="Release offer"
                        >
                          <Icon name="Sparkles" size={16} color={theme.colors.brandPrimary} />
                        </Pressable>
                      ) : null}
                    </View>
                  );
                }
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
                      {row.experienceYears} yrs · {rupees(row.expectedSalary)}/yr · {formatDate(row.appliedDate)}
                    </Text>
                  </View>
                  <StatusChip status={row.stage} />
                </View>
                <View style={styles.cellActions}>
                  {row.rating ? <Stars rating={row.rating} /> : <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Unrated</Text>}
                  <Button label="View" variant="outline" size="sm" icon="Eye" onPress={() => setProfileCandidate(row)} />
                </View>
              </View>
            )}
          />
        </SectionCard>
      ) : null}

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
          error={store.error}
          onSave={handleSaveApplicant}
        />
      ) : null}
      {profileCandidate ? (
        <ProfileModal
          key={profileCandidate.id}
          visible
          onClose={() => setProfileCandidate(null)}
          candidate={data.candidates.find((c) => c.id === profileCandidate.id) ?? profileCandidate}
          job={data.jobPostings.find((j) => j.id === profileCandidate.jobId)}
          offer={offerFor(profileCandidate.id)}
          interviews={data.interviews.filter((i) => i.candidateId === profileCandidate.id)}
          onStageChange={(stage) => {
            handleStageChange(profileCandidate.id, stage, undefined, `Candidate moved to ${stage}.`);
          }}
          onSchedule={() => {
            setScheduleCandidate(profileCandidate);
            setProfileCandidate(null);
          }}
          onMakeOffer={() => {
            setReleaseTarget({ candidate: profileCandidate, job: data.jobPostings.find((j) => j.id === profileCandidate.jobId) });
            setProfileCandidate(null);
          }}
          onReject={() => {
            handleStageChange(profileCandidate.id, 'Rejected', 'Rejected after panel review.', `${profileCandidate.name} marked as Rejected.`);
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
          candidateName={data.candidates.find((c) => c.id === feedbackInterview.candidateId)?.name}
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
          candidates={data.candidates}
          jobs={data.jobPostings}
          candidate={releaseTarget.candidate}
          error={store.error}
          onRelease={handleReleaseOffer}
        />
      ) : null}
      {letterOffer ? (
        <OfferLetterModal
          visible
          onClose={() => setLetterOffer(null)}
          offer={letterOffer}
          onNotice={(message) => setNotice(message)}
          onAccept={() =>
            commit((prev) => updateOfferStatus(prev, letterOffer.id, 'Accepted'), `Offer marked as Accepted by ${letterOffer.candidateName}.`)
          }
          onDecline={() =>
            commit((prev) => updateOfferStatus(prev, letterOffer.id, 'Declined'), `Offer marked as Declined by ${letterOffer.candidateName}.`)
          }
          onOnboard={() => handleOnboard(letterOffer.id)}
        />
      ) : null}
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
    gap: 16,
  },
  fullWidth: {
    width: '100%',
    gap: 16,
  },
  postingCard: {
    gap: 18,
  },
  jobPanelHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  jobPanelHeaderContent: {
    gap: 8,
  },
  jobPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  metaRowInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    rowGap: 8,
    width: '100%',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    flexShrink: 1,
  },
  metaItemText: {
    fontSize: 11.5,
    lineHeight: 16,
    flexShrink: 1,
  },
  editBtnContainer: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  jobPanelDescSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  detailBody: {
    fontSize: 12.5,
    lineHeight: 19,
  },
  requirementsList: {
    gap: 8,
    marginTop: 2,
  },
  reqRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  reqText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
  applicantsSection: {
    gap: 14,
  },
  applicantsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  applicantsHeaderTitleWrap: {
    flex: 1,
    gap: 4,
  },
  applicantsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applicantsTitleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countPillMini: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countPillMiniText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pipelineLine: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  applicantsStack: {
    gap: 10,
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
  detailMeta: {
    fontSize: 11.5,
    lineHeight: 16,
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
