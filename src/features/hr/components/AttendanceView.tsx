import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { AttendanceRecord, Punch } from '../types';
import { attendanceIssue } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { MetricCard } from '../../../components/ui/MetricCard';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';

export interface AttendanceViewProps {
  store: HRStore;
}

const timeLabel = (value?: string) =>
  value
    ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

const elapsedLabel = (record: AttendanceRecord): string => {
  if (!record.punchIn || !record.punchOut) return '—';
  const minutes = Math.round(
    (new Date(record.punchOut.time).getTime() - new Date(record.punchIn.time).getTime()) / 60000,
  );
  if (minutes < 0) return '—';
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const EvidenceCard: React.FC<{ title: string; punch?: Punch }> = ({ title, punch }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.evidenceCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.evidenceTitle, { color: theme.colors.textSubtle }]}>{title}</Text>
      <Text style={[styles.evidenceTime, { color: theme.colors.text }]}>
        {punch ? new Date(punch.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Not received'}
      </Text>
      <View
        style={[
          styles.photoBox,
          { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.visualBg },
        ]}
      >
        <Icon name="Camera" size={22} color={theme.colors.textSubtle} strokeWidth={1.6} />
        <Text style={[styles.photoText, { color: theme.colors.textSubtle }]}>Live photo not received</Text>
      </View>
      <View style={styles.gpsRow}>
        <Icon name="MapPin" size={13} color={theme.colors.textSubtle} />
        <Text style={[styles.gpsText, { color: theme.colors.textMuted }]}>
          {punch ? `${punch.latitude.toFixed(4)}, ${punch.longitude.toFixed(4)}` : 'No GPS fix'}
        </Text>
      </View>
      <Text style={[styles.accuracyText, { color: theme.colors.textSubtle }]}>
        GPS accuracy: ±{punch ? punch.accuracy : '—'} m
      </Text>
    </View>
  );
};

export const AttendanceView: React.FC<AttendanceViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { data } = store;
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);

  const latestDate = data.attendance.map((r) => r.date).sort().at(-1) ?? '—';
  const daily = useMemo(
    () => data.attendance.filter((r) => r.date === latestDate),
    [data.attendance, latestDate],
  );

  const punchedIn = daily.filter((r) => r.punchIn).length;
  const missingOut = daily.filter((r) => r.punchIn && !r.punchOut).length;
  const evidenceComplete = daily.filter((r) => attendanceIssue(r) === 'Evidence received').length;
  const noPunchIn = daily.filter((r) => !r.punchIn).length;

  const filtered = data.attendance.filter((rec) => {
    const emp = data.employees.find((e) => e.id === rec.employeeId);
    const q = search.trim().toLowerCase();
    const matches =
      rec.employeeId.toLowerCase().includes(q) ||
      (emp ? emp.name.toLowerCase().includes(q) : false) ||
      rec.date.includes(search.trim());
    const matchesDate = !dateFilter.trim() || rec.date === dateFilter.trim();
    const matchesExceptions = !exceptionsOnly || attendanceIssue(rec) !== 'Evidence received';
    return matches && matchesDate && matchesExceptions;
  });

  const evidenceRecord = evidenceId ? data.attendance.find((r) => r.id === evidenceId) : undefined;

  const columns: Array<DataColumn<AttendanceRecord>> = [
    { key: 'employee', label: 'Employee', flex: 1.3 },
    { key: 'in', label: 'Punch-in', width: 86 },
    { key: 'out', label: 'Punch-out', width: 86 },
    { key: 'elapsed', label: 'Elapsed', width: 80 },
    { key: 'evidence', label: 'Evidence', flex: 1.2 },
    { key: 'action', label: 'Action', width: 122 },
  ];

  return (
    <View style={styles.container}>
      <Card padding={18} style={styles.banner}>
        <View style={[styles.bannerTile, { backgroundColor: theme.colors.brandSoft }]}>
          <Icon name="Camera" size={20} color={theme.colors.brandPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.bannerText}>
          <View style={styles.bannerTitleRow}>
            <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Camera punch platform</Text>
            <StatusChip status="Connected" tone="success" />
          </View>
          <Text style={[styles.bannerSub, { color: theme.colors.textMuted }]}>
            Punch-in and punch-out records stream live from the employee platform · Latest record {formatDate(latestDate)}
          </Text>
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard label="Employees punched in" value={punchedIn} subtitle={`${punchedIn} of ${daily.length} latest-day records`} style={styles.metric} />
        <MetricCard label="Missing punch-out" value={missingOut} subtitle="Requires employee follow-up" style={styles.metric} />
        <MetricCard label="Evidence complete" value={evidenceComplete} subtitle="Both punches include photo and GPS" style={styles.metric} />
        <MetricCard label="No punch-in" value={noPunchIn} subtitle="Not automatically classified as absent" style={styles.metric} />
      </View>

      <SectionCard
        title="Punch attendance"
        description="Punch-in and punch-out from the employee platform · Times in IST"
        action={
          <View style={styles.headerActions}>
            <Button label="Import export" variant="outline" size="sm" icon="Upload" />
            <Button label="Export" variant="outline" size="sm" icon="Download" />
          </View>
        }
      >
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search attendance by staff name or date…" />
        <View style={styles.filterRow}>
          <View style={styles.dateCell}>
            <TextField label="Date" value={dateFilter} onChangeText={setDateFilter} placeholder="YYYY-MM-DD" />
          </View>
          <Pressable
            onPress={() => setExceptionsOnly((v) => !v)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.toggleChip,
              {
                backgroundColor: exceptionsOnly ? theme.colors.brandPrimary : theme.colors.surfaceSoft,
                borderColor: exceptionsOnly ? theme.colors.brandPrimary : theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Icon
              name={exceptionsOnly ? 'CheckCircle2' : 'AlertTriangle'}
              size={14}
              color={exceptionsOnly ? '#ffffff' : theme.colors.warning}
            />
            <Text style={[styles.toggleText, { color: exceptionsOnly ? '#ffffff' : theme.colors.textMuted }]}>
              Exceptions only
            </Text>
          </Pressable>
        </View>
        <DataTable
          columns={columns}
          rows={filtered}
          keyExtractor={(row) => row.id}
          emptyTitle="No attendance records match"
          emptyDescription="Adjust the search, date or exceptions filter."
          emptyIcon="CalendarCheck"
          renderCell={(rec, column) => {
            const emp = data.employees.find((e) => e.id === rec.employeeId);
            switch (column.key) {
              case 'employee':
                return (
                  <View style={styles.personRow}>
                    <Avatar name={emp?.name ?? rec.employeeId} size={32} />
                    <View style={styles.personMain}>
                      <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                        {emp?.name ?? rec.employeeId}
                      </Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{rec.employeeId}</Text>
                    </View>
                  </View>
                );
              case 'in':
                return (
                  <Text style={[styles.time, { color: rec.punchIn ? theme.colors.successText : theme.colors.dangerText }]}>
                    {timeLabel(rec.punchIn?.time)}
                  </Text>
                );
              case 'out':
                return (
                  <Text style={[styles.time, { color: rec.punchOut ? theme.colors.brandPrimary : theme.colors.warningText }]}>
                    {timeLabel(rec.punchOut?.time)}
                  </Text>
                );
              case 'elapsed':
                return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{elapsedLabel(rec)}</Text>;
              case 'evidence':
                return (
                  <View style={styles.stack4}>
                    <StatusChip status={attendanceIssue(rec)} />
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{rec.source}</Text>
                  </View>
                );
              default:
                return (
                  <Button label="View evidence" variant="outline" size="sm" onPress={() => setEvidenceId(rec.id)} />
                );
            }
          }}
          renderMobileCard={(rec) => {
            const emp = data.employees.find((e) => e.id === rec.employeeId);
            return (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.personRow}>
                  <Avatar name={emp?.name ?? rec.employeeId} size={36} />
                  <View style={styles.personMain}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{emp?.name ?? rec.employeeId}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {rec.employeeId} · {formatDate(rec.date)}
                    </Text>
                  </View>
                  <StatusChip status={attendanceIssue(rec)} />
                </View>
                <View style={styles.mobileTimes}>
                  <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>
                    In {timeLabel(rec.punchIn?.time)} · Out {timeLabel(rec.punchOut?.time)} · {elapsedLabel(rec)}
                  </Text>
                  <Button label="View evidence" variant="outline" size="sm" onPress={() => setEvidenceId(rec.id)} />
                </View>
              </View>
            );
          }}
        />
      </SectionCard>

      {evidenceRecord ? (
        <ModalSheet
          key={evidenceRecord.id}
          visible
          onClose={() => setEvidenceId(null)}
          label={`${formatDate(evidenceRecord.date)} · ${evidenceRecord.source}`}
          title={data.employees.find((e) => e.id === evidenceRecord.employeeId)?.name ?? evidenceRecord.employeeId}
          description="Live photo and GPS evidence per punch"
          size="xl"
        >
          <View style={styles.evidenceGrid}>
            <EvidenceCard title="Punch-in" punch={evidenceRecord.punchIn} />
            <EvidenceCard title="Punch-out" punch={evidenceRecord.punchOut} />
          </View>
        </ModalSheet>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerTile: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 17,
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
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
  },
  dateCell: {
    flexGrow: 1,
    flexBasis: 180,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stack4: {
    gap: 4,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  mobileTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceCard: {
    flexGrow: 1,
    flexBasis: 260,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  evidenceTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  evidenceTime: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  photoBox: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoText: {
    fontSize: 11,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsText: {
    fontSize: 11.5,
  },
  accuracyText: {
    fontSize: 10.5,
  },
});
