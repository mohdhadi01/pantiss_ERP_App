import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { AttendanceRecord, Employee } from '../types';
import { attendanceIssue } from '../helpers';
import { exportCsv } from '../csv';
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
import {
  ImportFormatSheet,
  ImportSheet,
  PunchEvidenceCard,
  parseAttendance,
  timestampLabel,
} from './AttendanceParts';

export interface AttendanceViewProps {
  store: HRStore;
}

interface RegisterRow {
  employee: Employee;
  record?: AttendanceRecord;
}

const elapsedLabel = (record?: AttendanceRecord): string => {
  if (!record?.punchIn || !record.punchOut) return '—';
  const minutes = Math.round(
    (new Date(record.punchOut.time).getTime() - new Date(record.punchIn.time).getTime()) / 60000,
  );
  if (minutes < 0) return '—';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export const AttendanceView: React.FC<AttendanceViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { data, commit } = store;
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(data.attendance.map((r) => r.date).sort().at(-1) || '2026-10-09');
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const daily = useMemo(() => data.attendance.filter((r) => r.date === date), [data.attendance, date]);
  const entries = useMemo<RegisterRow[]>(
    () =>
      data.employees
        .filter((e) => e.joiningDate <= date)
        .map((employee) => ({ employee, record: daily.find((r) => r.employeeId === employee.id) })),
    [data.employees, daily, date],
  );

  const visible = entries.filter(({ employee, record }) => {
    const q = search.trim().toLowerCase();
    const matches = `${employee.name} ${employee.id}`.toLowerCase().includes(q);
    return matches && (!exceptionsOnly || attendanceIssue(record) !== 'Evidence received');
  });

  const punchedIn = daily.filter((r) => r.punchIn).length;
  const missingOut = daily.filter((r) => r.punchIn && !r.punchOut).length;
  const evidenceComplete = daily.filter((r) => attendanceIssue(r) === 'Evidence received').length;
  const noPunchIn = entries.filter((e) => !e.record?.punchIn).length;

  const evidenceRecord = evidenceId ? data.attendance.find((r) => r.id === evidenceId) : undefined;

  const handleExport = () => {
    exportCsv(`attendance-${date}`, [
      ['Employee ID', 'Employee', 'Date', 'Punch-in', 'Punch-out', 'Elapsed', 'Evidence'],
      ...visible.map(({ employee, record }) => [
        employee.id,
        employee.name,
        date,
        record?.punchIn?.time || '',
        record?.punchOut?.time || '',
        elapsedLabel(record),
        attendanceIssue(record),
      ]),
    ]).catch(() => {});
  };

  const handleImport = async () => {
    setImporting(true);
    setImportError('');
    try {
      const rows = parseAttendance(
        JSON.stringify([
          {
            id: 'PUNCH-001',
            employeeId: data.employees[0]?.id,
            date: '2026-10-09',
            punchIn: {
              time: '2026-10-09T09:20:00+05:30',
              latitude: 20.844,
              longitude: 85.151,
              accuracy: 15,
              photoUrl: 'https://your-platform.example/punch-in.jpg',
            },
            punchOut: {
              time: '2026-10-09T18:00:00+05:30',
              latitude: 20.844,
              longitude: 85.151,
              accuracy: 12,
              photoUrl: 'https://your-platform.example/punch-out.jpg',
            },
          },
        ]),
        data.employees,
      );
      const ok = await commit(
        (prev) => {
          const keys = new Set(rows.map((r) => `${r.employeeId}:${r.date}`));
          const existing = prev.attendanceImportedAt
            ? prev.attendance.filter((r) => !keys.has(`${r.employeeId}:${r.date}`))
            : [];
          return { ...prev, attendance: [...existing, ...rows], attendanceImportedAt: new Date().toISOString() };
        },
        `${rows.length} attendance records imported. Evidence remains read-only.`,
      );
      if (ok) {
        setDate(rows.map((r) => r.date).sort().at(-1)!);
        setShowImport(false);
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'The attendance file could not be read.');
    } finally {
      setImporting(false);
    }
  };

  const columns: DataColumn<RegisterRow>[] = [
    { key: 'employee', label: 'Employee', flex: 1.3 },
    { key: 'in', label: 'Punch-in', width: 118 },
    { key: 'out', label: 'Punch-out', width: 118 },
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
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
            {data.attendanceImportedAt
              ? 'Platform export imported · Read-only evidence'
              : 'Employee attendance platform · Connection pending'}
          </Text>
          <Text style={[styles.bannerSub, { color: theme.colors.textMuted }]}>
            {data.attendanceImportedAt
              ? `Last import: ${timestampLabel(data.attendanceImportedAt)} IST. Records are from an uploaded export, not a live feed.`
              : 'Sample punch records are shown below. Live photos are not supplied in the sample. Connect the employee platform or import its export to review actual evidence.'}
          </Text>
        </View>
        <Button label="Import format" variant="outline" size="sm" onPress={() => setShowFormat(true)} />
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard label="Employees punched in" value={punchedIn} subtitle={`${entries.length} employees joined by this date`} style={styles.metric} />
        <MetricCard label="Missing punch-out" value={missingOut} subtitle="Requires employee follow-up" style={styles.metric} />
        <MetricCard label="Evidence complete" value={evidenceComplete} subtitle="Both punches include photo and GPS" style={styles.metric} />
        <MetricCard label="No punch-in" value={noPunchIn} subtitle="Not automatically classified as absent" style={styles.metric} />
      </View>

      <SectionCard
        title="Punch attendance"
        description="Punch-in and punch-out from the employee platform · Times in IST · Elapsed time excludes no breaks"
        action={
          <View style={styles.headerActions}>
            <Button
              label={importing ? 'Importing…' : 'Import export'}
              variant="outline"
              size="sm"
              icon="Upload"
              disabled={importing}
              onPress={() => {
                setImportError('');
                setShowImport(true);
              }}
            />
            <Button label="Export" variant="outline" size="sm" icon="Download" onPress={handleExport} />
          </View>
        }
      >
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search employee, email or ID" />
        <View style={styles.filterRow}>
          <View style={styles.dateCell}>
            <TextField label="Attendance date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
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
          rows={visible}
          keyExtractor={(row) => row.employee.id}
          emptyTitle="No records match this view"
          emptyDescription="Try another search or filter."
          emptyIcon="CalendarCheck"
          renderCell={({ employee, record }, column) => {
            switch (column.key) {
              case 'employee':
                return (
                  <View style={styles.personRow}>
                    <Avatar name={employee.name} size={32} />
                    <View style={styles.personMain}>
                      <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                        {employee.name}
                      </Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{employee.id}</Text>
                    </View>
                  </View>
                );
              case 'in':
                return (
                  <Text style={[styles.time, { color: record?.punchIn ? theme.colors.successText : theme.colors.dangerText }]}>
                    {timestampLabel(record?.punchIn?.time)}
                  </Text>
                );
              case 'out':
                return (
                  <Text style={[styles.time, { color: record?.punchOut ? theme.colors.brandPrimary : theme.colors.warningText }]}>
                    {timestampLabel(record?.punchOut?.time)}
                  </Text>
                );
              case 'elapsed':
                return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{elapsedLabel(record)}</Text>;
              case 'evidence':
                return (
                  <View style={styles.stack4}>
                    <StatusChip status={attendanceIssue(record)} />
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {record?.source ?? 'No platform record'}
                    </Text>
                  </View>
                );
              default:
                return (
                  <Button
                    label="View evidence"
                    variant="outline"
                    size="sm"
                    disabled={!record}
                    onPress={() => record && setEvidenceId(record.id)}
                  />
                );
            }
          }}
          renderMobileCard={({ employee, record }) => (
            <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
              <View style={styles.personRow}>
                <Avatar name={employee.name} size={36} />
                <View style={styles.personMain}>
                  <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{employee.name}</Text>
                  <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{employee.id}</Text>
                </View>
                <View style={styles.chipWrapper}>
                  <StatusChip status={attendanceIssue(record)} />
                </View>
              </View>
              <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>
                In {timestampLabel(record?.punchIn?.time)} · Out {timestampLabel(record?.punchOut?.time)} ·{' '}
                {elapsedLabel(record)}
              </Text>
              <View style={styles.mobileActionRow}>
                <Button
                  label="View evidence"
                  variant="outline"
                  size="sm"
                  disabled={!record}
                  onPress={() => record && setEvidenceId(record.id)}
                />
              </View>
            </View>
          )}
        />
      </SectionCard>

      {evidenceRecord ? (
        <ModalSheet
          key={evidenceRecord.id}
          visible
          onClose={() => setEvidenceId(null)}
          label={`Punch evidence · ${evidenceRecord.date} · IST`}
          title={data.employees.find((e) => e.id === evidenceRecord.employeeId)?.name ?? evidenceRecord.employeeId}
          size="xl"
        >
          <Text style={[styles.sheetDescription, { color: theme.colors.textMuted }]}>
            {evidenceRecord.source}. Photos and GPS evidence are supplied by the employee platform. HR cannot
            capture, replace or alter a punch here.
          </Text>
          <View style={styles.evidenceGrid}>
            <PunchEvidenceCard title="Punch-in" punch={evidenceRecord.punchIn} />
            <PunchEvidenceCard title="Punch-out" punch={evidenceRecord.punchOut} />
          </View>
        </ModalSheet>
      ) : null}

      <ImportFormatSheet
        visible={showFormat}
        onClose={() => setShowFormat(false)}
        employeeId={data.employees[0]?.id}
      />
      <ImportSheet
        visible={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        importing={importing}
        error={importError}
      />
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
    flexWrap: 'wrap',
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
    minWidth: 200,
    gap: 4,
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
    marginBottom: 16,
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
    fontSize: 11,
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
  chipWrapper: {
    flexShrink: 0,
  },
  mobileActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  sheetDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
