import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { attendanceIssue } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Icon } from '../../../components/ui/Icon';

export interface AttendanceViewProps {
  store: HRStore;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const { data } = store;

  const totalRecords = data.attendance.length;
  const punchIns = data.attendance.filter((r) => r.punchIn).length;
  const punchOuts = data.attendance.filter((r) => r.punchOut).length;

  const filtered = data.attendance.filter((rec) => {
    const emp = data.employees.find((e) => e.id === rec.employeeId);
    return (
      rec.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (emp && emp.name.toLowerCase().includes(search.toLowerCase())) ||
      rec.date.includes(search)
    );
  });

  return (
    <View style={styles.container}>
      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <MetricCard
          label="Total Records"
          value={totalRecords}
          subtitle="Platform logs"
          icon="CalendarCheck"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Punched In"
          value={punchIns}
          subtitle="Morning shift"
          icon="CheckCircle"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="Punched Out"
          value={punchOuts}
          subtitle="Completed day"
          icon="LogOut"
          accentColor={theme.colors.violet}
        />
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search attendance by staff name or date..."
      />

      <View style={styles.list}>
        {filtered.map((rec) => {
          const emp = data.employees.find((e) => e.id === rec.employeeId);
          const issue = attendanceIssue(rec);

          return (
            <View
              key={rec.id}
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
                <Avatar name={emp?.name || rec.employeeId} size={38} />
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {emp?.name || rec.employeeId}
                  </Text>
                  <Text style={[styles.dateText, { color: theme.colors.textSubtle }]}>
                    {formatDate(rec.date)} · ID: {rec.employeeId}
                  </Text>
                </View>
                <StatusChip status={issue} />
              </View>

              <View style={styles.divider} />

              <View style={styles.punchDetailsGrid}>
                {/* Punch In */}
                <View style={styles.punchCol}>
                  <Text style={[styles.punchHeader, { color: theme.colors.textSubtle }]}>
                    PUNCH IN
                  </Text>
                  {rec.punchIn ? (
                    <View style={styles.punchInfo}>
                      <Text style={[styles.timeText, { color: theme.colors.emerald }]}>
                        {new Date(rec.punchIn.time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={[styles.gpsText, { color: theme.colors.textMuted }]}>
                        GPS: {rec.punchIn.latitude.toFixed(3)}, {rec.punchIn.longitude.toFixed(3)}
                      </Text>
                      <Text style={[styles.accuracyText, { color: theme.colors.textSubtle }]}>
                        Accuracy: ±{rec.punchIn.accuracy}m
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.missingText, { color: theme.colors.danger }]}>
                      Missing punch-in
                    </Text>
                  )}
                </View>

                {/* Punch Out */}
                <View style={styles.punchCol}>
                  <Text style={[styles.punchHeader, { color: theme.colors.textSubtle }]}>
                    PUNCH OUT
                  </Text>
                  {rec.punchOut ? (
                    <View style={styles.punchInfo}>
                      <Text style={[styles.timeText, { color: theme.colors.brandPrimary }]}>
                        {new Date(rec.punchOut.time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={[styles.gpsText, { color: theme.colors.textMuted }]}>
                        GPS: {rec.punchOut.latitude.toFixed(3)}, {rec.punchOut.longitude.toFixed(3)}
                      </Text>
                      <Text style={[styles.accuracyText, { color: theme.colors.textSubtle }]}>
                        Accuracy: ±{rec.punchOut.accuracy}m
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.missingText, { color: theme.colors.warning }]}>
                      Awaiting punch-out
                    </Text>
                  )}
                </View>
              </View>
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
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
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  punchDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  punchCol: {
    flex: 1,
  },
  punchHeader: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  punchInfo: {
    gap: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  gpsText: {
    fontSize: 11,
  },
  accuracyText: {
    fontSize: 10,
  },
  missingText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
