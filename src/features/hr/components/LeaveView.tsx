import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { leaves } from '../constants';
import { decideLeave } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface LeaveViewProps {
  store: HRStore;
}

export const LeaveView: React.FC<LeaveViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'decided'>('all');

  const { data, commit } = store;

  const handleDecide = (leaveId: string, status: 'Approved' | 'Rejected') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => {
      return decideLeave(prev, leaveId, {
        status,
        reason: status === 'Approved' ? 'HR clearance approved based on leave balance.' : 'Operational coverage required.',
        actor: 'Ritika Sen (HR Manager)',
        at: new Date().toISOString(),
      });
    }, `Leave request marked as ${status}.`);
  };

  const filtered = leaves.filter((req) => {
    const emp = data.employees.find((e) => e.id === req.employeeId);
    const decision = data.leaveDecisions[req.id];
    const isReady = req.adminStatus === 'Approved' && !decision;

    const matchesSearch =
      (emp && emp.name.toLowerCase().includes(search.toLowerCase())) ||
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.type.toLowerCase().includes(search.toLowerCase());

    if (filter === 'ready') return matchesSearch && isReady;
    if (filter === 'decided') return matchesSearch && Boolean(decision);
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search employee leave requests..."
        filters={[
          { id: 'all', label: 'All Requests', count: leaves.length },
          {
            id: 'ready',
            label: 'Ready for HR',
            count: leaves.filter((l) => l.adminStatus === 'Approved' && !data.leaveDecisions[l.id]).length,
          },
          {
            id: 'decided',
            label: 'HR Decided',
            count: Object.keys(data.leaveDecisions).length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={(f) => setFilter(f as any)}
      />

      <View style={styles.list}>
        {filtered.map((req) => {
          const emp = data.employees.find((e) => e.id === req.employeeId);
          const decision = data.leaveDecisions[req.id];
          const isReady = req.adminStatus === 'Approved' && !decision;

          return (
            <View
              key={req.id}
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
                <Avatar name={emp?.name || req.employeeId} size={40} />
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {emp?.name || req.employeeId}
                  </Text>
                  <Text style={[styles.typeText, { color: theme.colors.brandPrimary }]}>
                    {req.type} · {req.days} Day(s)
                  </Text>
                  <Text style={[styles.dateSub, { color: theme.colors.textSubtle }]}>
                    {formatDate(req.start)} to {formatDate(req.end)}
                  </Text>
                </View>

                <View style={styles.badgesCol}>
                  <Badge
                    label={`Admin: ${req.adminStatus}`}
                    tone={req.adminStatus === 'Approved' ? 'emerald' : req.adminStatus === 'Rejected' ? 'danger' : 'warning'}
                    size="sm"
                  />
                  {decision && (
                    <Badge
                      label={`HR: ${decision.status}`}
                      tone={decision.status === 'Approved' ? 'emerald' : 'danger'}
                      size="sm"
                    />
                  )}
                </View>
              </View>

              <Text style={[styles.reason, { color: theme.colors.textMuted }]}>
                "{req.reason}"
              </Text>

              {req.adminNote && (
                <View style={[styles.noteBox, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Text style={[styles.noteLabel, { color: theme.colors.textSubtle }]}>
                    ADMIN NOTE:
                  </Text>
                  <Text style={[styles.noteText, { color: theme.colors.text }]}>
                    {req.adminNote}
                  </Text>
                </View>
              )}

              <View style={styles.detailsRow}>
                <Text style={[styles.balanceText, { color: theme.colors.textSubtle }]}>
                  Leave Balance remaining: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{req.balance} days</Text>
                </Text>
              </View>

              {isReady && (
                <View style={styles.actionsRow}>
                  <Button
                    label="Reject"
                    onPress={() => handleDecide(req.id, 'Rejected')}
                    size="sm"
                    variant="outline"
                    icon="XCircle"
                  />
                  <Button
                    label="Approve Leave"
                    onPress={() => handleDecide(req.id, 'Approved')}
                    size="sm"
                    variant="emerald"
                    icon="CheckCircle2"
                  />
                </View>
              )}

              {decision && (
                <View style={styles.decisionRow}>
                  <Icon
                    name={decision.status === 'Approved' ? 'CheckCircle2' : 'XCircle'}
                    size={14}
                    color={decision.status === 'Approved' ? theme.colors.emerald : theme.colors.danger}
                  />
                  <Text
                    style={[
                      styles.decisionText,
                      {
                        color: decision.status === 'Approved' ? theme.colors.emerald : theme.colors.danger,
                      },
                    ]}
                  >
                    HR {decision.status} by {decision.actor}
                  </Text>
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
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  dateSub: {
    fontSize: 11,
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  reason: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  noteBox: {
    padding: 10,
    borderRadius: 10,
    gap: 3,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  noteText: {
    fontSize: 11,
  },
  detailsRow: {
    paddingTop: 4,
  },
  balanceText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  decisionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
