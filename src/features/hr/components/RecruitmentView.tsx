import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { JobPosting, Candidate, Interview, OfferLetter } from '../types';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import {
  onboardCandidateFromOffer,
  updateCandidateStage,
  updateOfferStatus,
} from '../helpers';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface RecruitmentViewProps {
  store: HRStore;
}

type TabKey = 'postings' | 'candidates' | 'interviews' | 'offers';

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('candidates');
  const [search, setSearch] = useState('');

  const { data, commit } = store;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'candidates', label: 'Candidates', count: data.candidates.length },
    { key: 'postings', label: 'Job Postings', count: data.jobPostings.length },
    { key: 'interviews', label: 'Interviews', count: data.interviews.length },
    { key: 'offers', label: 'Offer Letters', count: data.offerLetters.length },
  ];

  const handleTabChange = (key: TabKey) => {
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(key);
  };

  const handleOnboardCandidate = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => {
      return onboardCandidateFromOffer(prev, offerId);
    }, 'Candidate onboarded into ERP successfully as Active Employee!');
  };

  const handleAdvanceStage = (candidateId: string) => {
    Haptics.selectionAsync().catch(() => {});
    commit((prev) => {
      return updateCandidateStage(prev, candidateId, 'Selected', 'Qualified through panel evaluation.');
    }, 'Candidate stage updated to Selected.');
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Tabs */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.colors.surfaceSoft,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isActive ? theme.colors.brandPrimary : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: isActive ? '#ffffff' : theme.colors.textMuted,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label} ({tab.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder={`Search ${activeTab}...`}
      />

      {/* Tab: Candidates */}
      {activeTab === 'candidates' && (
        <View style={styles.list}>
          {data.candidates
            .filter(
              (c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.stage.toLowerCase().includes(search.toLowerCase())
            )
            .map((candidate) => (
              <View
                key={candidate.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.border,
                    ...theme.shadows.card,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {candidate.name}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                      {candidate.email} · {candidate.phone}
                    </Text>
                  </View>
                  <StatusChip status={candidate.stage} />
                </View>

                <View style={styles.detailsRow}>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Exp: <Text style={{ color: theme.colors.text }}>{candidate.experienceYears} yrs</Text>
                  </Text>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Expected: <Text style={{ color: theme.colors.emerald }}>{formatRupees(candidate.expectedSalary)}</Text>
                  </Text>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Notice: <Text style={{ color: theme.colors.text }}>{candidate.noticePeriod}</Text>
                  </Text>
                </View>

                {candidate.resumeSummary && (
                  <Text style={[styles.notes, { color: theme.colors.textMuted }]}>
                    {candidate.resumeSummary}
                  </Text>
                )}

                {candidate.stage !== 'Selected' && candidate.stage !== 'Offer Released' && candidate.stage !== 'Onboarded' && (
                  <View style={styles.actionRow}>
                    <Button
                      label="Select for Offer"
                      onPress={() => handleAdvanceStage(candidate.id)}
                      size="sm"
                      variant="primary"
                    />
                  </View>
                )}
              </View>
            ))}
        </View>
      )}

      {/* Tab: Job Postings */}
      {activeTab === 'postings' && (
        <View style={styles.list}>
          {data.jobPostings
            .filter(
              (j) =>
                j.title.toLowerCase().includes(search.toLowerCase()) ||
                j.department.toLowerCase().includes(search.toLowerCase())
            )
            .map((job) => (
              <View
                key={job.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.border,
                    ...theme.shadows.card,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {job.title}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                      {job.department} · {job.location}
                    </Text>
                  </View>
                  <Badge label={job.status} tone={job.status === 'Active' ? 'emerald' : 'neutral'} />
                </View>

                <Text style={[styles.notes, { color: theme.colors.textMuted }]}>
                  {job.description}
                </Text>

                <View style={styles.detailsRow}>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Openings: <Text style={{ color: theme.colors.text }}>{job.openings}</Text>
                  </Text>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Range: <Text style={{ color: theme.colors.text }}>{formatRupees(job.minSalary)} – {formatRupees(job.maxSalary)}</Text>
                  </Text>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Tab: Interviews */}
      {activeTab === 'interviews' && (
        <View style={styles.list}>
          {data.interviews.map((intv) => {
            const cand = data.candidates.find((c) => c.id === intv.candidateId);
            return (
              <View
                key={intv.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.border,
                    ...theme.shadows.card,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {cand?.name || intv.candidateId}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                      {intv.round} · {intv.mode}
                    </Text>
                  </View>
                  <StatusChip status={intv.status} />
                </View>

                <View style={styles.detailsRow}>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Time: <Text style={{ color: theme.colors.text }}>{formatDate(intv.scheduledAt)}</Text>
                  </Text>
                  <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                    Panel: <Text style={{ color: theme.colors.text }}>{intv.interviewer}</Text>
                  </Text>
                </View>

                {intv.feedback && (
                  <Text style={[styles.notes, { color: theme.colors.textMuted }]}>
                    "{intv.feedback}"
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Tab: Offer Letters */}
      {activeTab === 'offers' && (
        <View style={styles.list}>
          {data.offerLetters.map((offer) => (
            <View
              key={offer.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {offer.candidateName}
                  </Text>
                  <Text style={[styles.email, { color: theme.colors.textMuted }]}>
                    {offer.designationTitle} · Joining: {formatDate(offer.joiningDate)}
                  </Text>
                </View>
                <StatusChip status={offer.status} />
              </View>

              <View style={styles.detailsRow}>
                <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                  CTC: <Text style={{ color: theme.colors.emerald, fontWeight: '700' }}>{formatRupees(offer.annualSalary)}/yr</Text>
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.textSubtle }]}>
                  Monthly: <Text style={{ color: theme.colors.text }}>{formatRupees(offer.monthlySalary)}</Text>
                </Text>
              </View>

              {offer.status !== 'Onboarded' && (
                <View style={styles.actionRow}>
                  <Button
                    label="Onboard into ERP"
                    onPress={() => handleOnboardCandidate(offer.id)}
                    size="sm"
                    variant="emerald"
                    icon="UserCheck"
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  tabBar: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
  },
  tabContent: {
    gap: 6,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tabButtonText: {
    fontSize: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingVertical: 4,
  },
  detailItem: {
    fontSize: 12,
  },
  notes: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
});
