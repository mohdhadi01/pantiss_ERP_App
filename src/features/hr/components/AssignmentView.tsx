import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { projects, projectCenters } from '../seed';
import { areaName, assignEmployee } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { hrSectionDescriptions } from '../constants';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { Employee } from '../types';

export interface AssignmentViewProps {
  store: HRStore;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { data, commit } = store;
  const params = useLocalSearchParams<{ employee?: string }>();

  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('');
  const [centerId, setCenterId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deepLinked, setDeepLinked] = useState(false);

  const openAssign = (employeeId: string) => {
    Haptics.selectionAsync().catch(() => {});
    const emp = data.employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const existing = data.assignments.find((a) => a.employeeId === employeeId);
    const project = existing ? projects.find((p) => p.id === existing.projectId) : undefined;
    setTargetId(employeeId);
    setProjectId(project?.id ?? '');
    setCenterId(existing?.centerId ?? '');
    setStartDate(
      existing?.startDate ?? (new Date().toISOString().slice(0, 10) < emp.joiningDate ? emp.joiningDate : new Date().toISOString().slice(0, 10)),
    );
  };

  useEffect(() => {
    if (!deepLinked && params.employee) {
      setDeepLinked(true);
      openAssign(String(params.employee));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.employee, deepLinked]);

  const handleSave = async () => {
    if (!targetId) return;
    const ok = await commit(
      (prev) => assignEmployee(prev, { employeeId: targetId, projectId, centerId, startDate }),
      'Project and centre assigned successfully.',
    );
    if (ok) setTargetId(null);
  };

  const filteredEmployees = data.employees.filter((emp) => {
    const q = search.trim().toLowerCase();
    return emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q);
  });

  const target = targetId ? data.employees.find((e) => e.id === targetId) : undefined;
  const centers = projectId ? projectCenters(projectId) : [];

  const columns: Array<DataColumn<Employee>> = [
    { key: 'employee', label: 'Employee', flex: 1.4 },
    { key: 'area', label: 'Thematic area', flex: 1.1 },
    { key: 'project', label: 'Primary project', flex: 1.3 },
    { key: 'centre', label: 'Centre / worksite', flex: 1.1 },
    { key: 'from', label: 'Effective from', width: 110 },
    { key: 'action', label: 'Action', width: 128 },
  ];

  return (
    <View style={styles.container}>
      <Card padding={18} style={styles.banner}>
        <View style={[styles.bannerTile, { backgroundColor: theme.colors.brandSoft }]}>
          <Icon name="Building2" size={20} color={theme.colors.brandPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.bannerText}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
            Deploy employees within their thematic area.
          </Text>
          <Text style={[styles.bannerSub, { color: theme.colors.textMuted }]}>
            {hrSectionDescriptions['project-assignment']}
          </Text>
        </View>
      </Card>

      <SectionCard title="Project assignments" description="Primary deployment · Thematic area → Project → Centre">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search staff to review deployment…"
        />
        <DataTable
          columns={columns}
          rows={filteredEmployees}
          keyExtractor={(row) => row.id}
          emptyTitle="No employees match"
          emptyDescription="Adjust the search to review deployments."
          emptyIcon="Network"
          renderCell={(emp, column) => {
            const assignment = data.assignments.find((a) => a.employeeId === emp.id);
            const project = assignment ? projects.find((p) => p.id === assignment.projectId) : undefined;
            const center = assignment
              ? projectCenters(assignment.projectId).find((c) => c.id === assignment.centerId)
              : undefined;
            switch (column.key) {
              case 'employee':
                return (
                  <View style={styles.personRow}>
                    <Avatar name={emp.name} size={32} />
                    <View style={styles.personMain}>
                      <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>{emp.name}</Text>
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{emp.id}</Text>
                    </View>
                  </View>
                );
              case 'area':
                return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{areaName(emp.areaId)}</Text>;
              case 'project':
                return (
                  <Text style={[styles.cellText, { color: project ? theme.colors.text : theme.colors.textSubtle }]}>
                    {project ? `${project.name} (${project.id})` : '—'}
                  </Text>
                );
              case 'centre':
                return (
                  <Text style={[styles.cellText, { color: center ? theme.colors.textMuted : theme.colors.warningText }]}>
                    {center?.name ?? 'Unassigned'}
                  </Text>
                );
              case 'from':
                return (
                  <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>
                    {assignment ? formatDate(assignment.startDate) : '—'}
                  </Text>
                );
              default:
                return (
                  <View style={styles.actionCell}>
                    {assignment ? null : <StatusChip status="Unassigned" tone="warning" />}
                    <Button
                      label={assignment ? 'Reassign' : 'Assign'}
                      variant="outline"
                      size="sm"
                      onPress={() => openAssign(emp.id)}
                    />
                  </View>
                );
            }
          }}
          renderMobileCard={(emp) => {
            const assignment = data.assignments.find((a) => a.employeeId === emp.id);
            const project = assignment ? projects.find((p) => p.id === assignment.projectId) : undefined;
            const center = assignment
              ? projectCenters(assignment.projectId).find((c) => c.id === assignment.centerId)
              : undefined;
            return (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.personRow}>
                  <Avatar name={emp.name} size={36} />
                  <View style={styles.personMain}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{emp.name}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {emp.id} · {areaName(emp.areaId)}
                    </Text>
                    <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>
                      {project ? `${project.name} · ${center?.name ?? '—'}` : 'Unassigned'}
                    </Text>
                  </View>
                  <StatusChip status={assignment ? 'Assigned' : 'Unassigned'} />
                </View>
                <View style={styles.actionCell}>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                    {assignment ? `Effective from ${formatDate(assignment.startDate)}` : 'Primary project / centre needed'}
                  </Text>
                  <Button label={assignment ? 'Reassign' : 'Assign'} variant="outline" size="sm" onPress={() => openAssign(emp.id)} />
                </View>
              </View>
            );
          }}
        />
      </SectionCard>

      {target ? (
        <ModalSheet
          key={target.id}
          visible
          onClose={() => setTargetId(null)}
          label="Deployment"
          title="Project assignment"
          description={target.name}
          size="md"
          footer={
            <>
              <Button label="Cancel" variant="outline" onPress={() => setTargetId(null)} />
              <Button label="Save assignment" variant="primary" icon="Check" onPress={handleSave} />
            </>
          }
        >
          <Text style={[styles.caption, { color: theme.colors.textMuted }]}>
            {areaName(target.areaId)} · Joined {formatDate(target.joiningDate)}
          </Text>
          <SelectField
            label="Project"
            value={projectId}
            onChange={(v) => {
              setProjectId(v);
              setCenterId('');
            }}
            options={projects
              .filter((p) => p.areaId === target.areaId)
              .map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))}
            placeholder="Select a project in this thematic area"
          />
          <SelectField
            label="Centre / worksite"
            value={centerId}
            onChange={setCenterId}
            options={centers.map((c) => ({ value: c.id, label: c.name }))}
            disabled={!projectId}
            placeholder={projectId ? 'Select centre' : 'Choose a project first'}
          />
          <TextField label="Effective from" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
          <Text style={[styles.hint, { color: theme.colors.textSubtle }]}>
            The assignment date must be on or after the joining date.
          </Text>
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
    gap: 3,
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 17,
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
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
  },
});
