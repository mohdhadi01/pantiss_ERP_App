import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { leaves } from '../constants';
import { decideLeave } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { LeaveRequest } from '../types';

export interface LeaveViewProps {
  store: HRStore;
}

type AdminFilter = 'all' | 'Pending' | 'Approved' | 'Rejected';

export const LeaveView: React.FC<LeaveViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { data, commit } = store;
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState<AdminFilter>('all');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const decisionFor = (id: string) => data.leaveDecisions[id];
  const ready = leaves.filter((l) => l.adminStatus === 'Approved' && !data.leaveDecisions[l.id]).length;
  const approvedDays = leaves
    .filter((l) => l.adminStatus === 'Approved' && decisionFor(l.id)?.status === 'Approved')
    .reduce((sum, l) => sum + l.days, 0);

  const handleDecide = async (req: LeaveRequest, status: 'Approved' | 'Rejected') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const ok = await commit(
      (prev) =>
        decideLeave(prev, req.id, {
          status,
          reason:
            status === 'Approved'
              ? 'HR clearance approved based on leave balance.'
              : note.trim() || 'Operational coverage required.',
          actor: 'Ritika Sen (HR Manager)',
          at: new Date().toISOString(),
        }),
      `Leave request marked as ${status}.`,
    );
    if (ok) {
      setReviewId(null);
      setNote('');
    }
  };

  const filtered = leaves.filter((req) => {
    const emp = data.employees.find((e) => e.id === req.employeeId);
    const q = search.trim().toLowerCase();
    const matches =
      (emp ? emp.name.toLowerCase().includes(q) : false) ||
      req.id.toLowerCase().includes(q) ||
      req.type.toLowerCase().includes(q);
    return matches && (adminFilter === 'all' || req.adminStatus === adminFilter);
  });

  const reviewRequest = reviewId ? leaves.find((l) => l.id === reviewId) : undefined;
  const reviewDecision = reviewRequest ? decisionFor(reviewRequest.id) : undefined;

  const columns: Array<DataColumn<LeaveRequest>> = [
    { key: 'employee', label: 'Employee', flex: 1.3 },
    { key: 'request', label: 'Leave request', flex: 1.1 },
    { key: 'dates', label: 'Dates', flex: 1.2 },
    { key: 'balance', label: 'Balance', width: 84 },
    { key: 'admin', label: 'Admin', flex: 0.9 },
    { key: 'hr', label: 'HR', flex: 0.9 },
    { key: 'action', label: 'Action', width: 100 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Awaiting Admin"
          value={leaves.filter((l) => l.adminStatus === 'Pending').length}
          subtitle="No HR action available yet"
          style={styles.metric}
        />
        <MetricCard label="Ready for HR" value={ready} subtitle="Admin has approved" style={styles.metric} />
        <MetricCard label="Approved leave days" value={approvedDays} subtitle="After both approvals" style={styles.metric} />
        <MetricCard
          label="Rejected by Admin"
          value={leaves.filter((l) => l.adminStatus === 'Rejected').length}
          subtitle="Returned before HR review"
          style={styles.metric}
        />
      </View>

      <SectionCard title="Leave requests" description="Admin clearance and HR decisions shown separately">
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search employee leave requests…" />
        <View style={styles.filterRow}>
          <View style={styles.filterCell}>
            <SelectField
              label="Admin decision"
              value={adminFilter}
              onChange={(v) => setAdminFilter(v as AdminFilter)}
              options={[
                { value: 'all', label: `All requests (${leaves.length})` },
                { value: 'Pending', label: `Pending (${leaves.filter((l) => l.adminStatus === 'Pending').length})` },
                { value: 'Approved', label: `Approved (${leaves.filter((l) => l.adminStatus === 'Approved').length})` },
                { value: 'Rejected', label: `Rejected (${leaves.filter((l) => l.adminStatus === 'Rejected').length})` },
              ]}
            />
          </View>
        </View>
        <DataTable
          columns={columns}
          rows={filtered}
          keyExtractor={(row) => row.id}
          emptyTitle="No leave requests match"
          emptyDescription="Adjust the search or Admin-decision filter."
          emptyIcon="CalendarDays"
          renderCell={(req, column) => {
            const emp = data.employees.find((e) => e.id === req.employeeId);
            const decision = decisionFor(req.id);
            switch (column.key) {
              case 'employee':
                return (
                  <View style={styles.personRow}>
                    <Avatar name={emp?.name ?? req.employeeId} size={32} />
                    <View style={styles.personMain}>
                      <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                        {emp?.name ?? req.employeeId}
                      </Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{req.id}</Text>
                    </View>
                  </View>
                );
              case 'request':
                return (
                  <View style={styles.stack4}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{req.type}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{req.days} day(s)</Text>
                  </View>
                );
              case 'dates':
                return (
                  <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>
                    {formatDate(req.start)} to {formatDate(req.end)}
                  </Text>
                );
              case 'balance':
                return <Text style={[styles.balance, { color: theme.colors.text }]}>{req.balance} days</Text>;
              case 'admin':
                return (
                  <StatusChip
                    status={`Admin ${req.adminStatus}`}
                    tone={req.adminStatus === 'Approved' ? 'success' : req.adminStatus === 'Rejected' ? 'danger' : 'warning'}
                  />
                );
              case 'hr':
                return (
                  <StatusChip
                    status={decision ? `HR ${decision.status}` : 'Awaiting HR'}
                    tone={decision ? (decision.status === 'Approved' ? 'success' : 'danger') : 'neutral'}
                  />
                );
              default:
                return (
                  <Button
                    label="Review"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setNote('');
                      setReviewId(req.id);
                    }}
                  />
                );
            }
          }}
          renderMobileCard={(req) => {
            const emp = data.employees.find((e) => e.id === req.employeeId);
            const decision = decisionFor(req.id);
            return (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.personRow}>
                  <Avatar name={emp?.name ?? req.employeeId} size={36} />
                  <View style={styles.personMain}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{emp?.name ?? req.employeeId}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>
                      {req.type} · {req.days} day(s) · {formatDate(req.start)} to {formatDate(req.end)}
                    </Text>
                  </View>
                  <View style={styles.stack4}>
                    <StatusChip status={`Admin ${req.adminStatus}`} />
                    <StatusChip
                      status={decision ? `HR ${decision.status}` : 'Awaiting HR'}
                      tone={decision ? (decision.status === 'Approved' ? 'success' : 'danger') : 'neutral'}
                    />
                  </View>
                </View>
                <View style={styles.mobileFooter}>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Balance: {req.balance} days</Text>
                  <Button
                    label="Review"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setNote('');
                      setReviewId(req.id);
                    }}
                  />
                </View>
              </View>
            );
          }}
        />
      </SectionCard>

      {reviewRequest ? (
        <ModalSheet
          key={reviewRequest.id}
          visible
          onClose={() => setReviewId(null)}
          label="HR leave review"
          title={data.employees.find((e) => e.id === reviewRequest.employeeId)?.name ?? reviewRequest.employeeId}
          description={reviewRequest.id}
          size="md"
          footer={
            reviewRequest.adminStatus === 'Approved' && !reviewDecision ? (
              <>
                <Button
                  label="Reject leave"
                  variant="danger"
                  icon="XCircle"
                  disabled={!note.trim()}
                  onPress={() => handleDecide(reviewRequest, 'Rejected')}
                />
                <Button
                  label="Approve leave"
                  variant="primary"
                  icon="CheckCircle2"
                  onPress={() => handleDecide(reviewRequest, 'Approved')}
                />
              </>
            ) : undefined
          }
        >
          <View style={styles.decisionRow}>
            <View style={[styles.decisionCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
              <Text style={[styles.decisionTitle, { color: theme.colors.textSubtle }]}>Admin decision</Text>
              <StatusChip
                status={`Admin ${reviewRequest.adminStatus}`}
                tone={reviewRequest.adminStatus === 'Approved' ? 'success' : reviewRequest.adminStatus === 'Rejected' ? 'danger' : 'warning'}
              />
              <Text style={[styles.decisionMeta, { color: theme.colors.textMuted }]}>
                {reviewRequest.adminBy ?? 'Awaiting Admin'}
              </Text>
              <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                {reviewRequest.adminAt ? formatDate(reviewRequest.adminAt) : '—'}
              </Text>
            </View>
            <View style={[styles.decisionCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
              <Text style={[styles.decisionTitle, { color: theme.colors.textSubtle }]}>HR decision</Text>
              <StatusChip
                status={reviewDecision ? `HR ${reviewDecision.status}` : 'Awaiting HR'}
                tone={reviewDecision ? (reviewDecision.status === 'Approved' ? 'success' : 'danger') : 'neutral'}
              />
              <Text style={[styles.decisionMeta, { color: theme.colors.textMuted }]}>
                {reviewDecision?.actor ?? 'Awaiting HR review'}
              </Text>
              <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                {reviewDecision ? formatDate(reviewDecision.at) : '—'}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryBox, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[styles.summaryLine, { color: theme.colors.text }]}>
              {reviewRequest.type} · {formatDate(reviewRequest.start)} – {formatDate(reviewRequest.end)} ·{' '}
              {reviewRequest.days} day(s)
            </Text>
            <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>Employee: {reviewRequest.reason}</Text>
            {reviewRequest.adminNote ? (
              <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>Admin: {reviewRequest.adminNote}</Text>
            ) : null}
            <Text style={[styles.balanceLine, { color: theme.colors.text }]}>
              Balance before approval: {reviewRequest.balance} days. Balance after approval:{' '}
              {reviewDecision?.status === 'Approved' ? reviewRequest.balance - reviewRequest.days : reviewRequest.balance} days.
            </Text>
          </View>

          {reviewRequest.adminStatus === 'Pending' ? (
            <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warningBorder }]}>
              <View style={styles.lockedRow}>
                <Icon name="Lock" size={15} color={theme.colors.warningText} />
                <Text style={[styles.lockedText, { color: theme.colors.warningText }]}>
                  Waiting for Admin approval before HR review.
                </Text>
              </View>
            </Card>
          ) : null}
          {reviewRequest.adminStatus === 'Rejected' ? (
            <Card padding={14} flat style={[styles.lockedBanner, { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.dangerBorder }]}>
              <View style={styles.lockedRow}>
                <Icon name="XCircle" size={15} color={theme.colors.dangerText} />
                <Text style={[styles.lockedText, { color: theme.colors.dangerText }]}>
                  Admin rejected this request. HR approval is unavailable.
                </Text>
              </View>
            </Card>
          ) : null}

          {reviewRequest.adminStatus === 'Approved' && !reviewDecision ? (
            <TextField
              label="HR note"
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Context for the approval or the operational reason for rejection…"
              hint="A note is required when rejecting a request."
            />
          ) : null}
        </ModalSheet>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  balance: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stack4: {
    gap: 4,
    alignItems: 'flex-end',
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
  decisionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  decisionCard: {
    flexGrow: 1,
    flexBasis: 200,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  decisionTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  decisionMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryBox: {
    borderRadius: 14,
    padding: 14,
    gap: 7,
  },
  summaryLine: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  balanceLine: {
    fontSize: 11.5,
    lineHeight: 16,
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
