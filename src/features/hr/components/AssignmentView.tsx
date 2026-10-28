import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { projects, projectCenters } from '../seed';
import { areaName, assignEmployee } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export interface AssignmentViewProps {
  store: HRStore;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const { data, commit } = store;

  const handleQuickAssign = (employeeId: string, areaId: string) => {
    const areaProjects = projects.filter((p) => p.areaId === areaId);
    if (!areaProjects.length) return;
    const project = areaProjects[0];
    const centers = projectCenters(project.id);
    const center = centers[0];

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    commit((prev) => {
      return assignEmployee(prev, {
        employeeId,
        projectId: project.id,
        centerId: center.id,
        startDate: new Date().toISOString().slice(0, 10),
      });
    }, 'Project and centre assigned successfully.');
  };

  const filteredEmployees = data.employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search staff to review deployment..."
      />

      <View style={styles.list}>
        {filteredEmployees.map((emp) => {
          const assignment = data.assignments.find((a) => a.employeeId === emp.id);
          const project = assignment ? projects.find((p) => p.id === assignment.projectId) : undefined;
          const centers = project ? projectCenters(project.id) : [];
          const center = assignment ? centers.find((c) => c.id === assignment.centerId) : undefined;

          return (
            <View
              key={emp.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.topRow}>
                <Avatar name={emp.name} size={40} />
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {emp.name}
                  </Text>
                  <Text style={[styles.sub, { color: theme.colors.textSubtle }]}>
                    {areaName(emp.areaId)} · {emp.id}
                  </Text>
                </View>
                <Badge
                  label={assignment ? 'Assigned' : 'Unassigned'}
                  tone={assignment ? 'emerald' : 'warning'}
                />
              </View>

              <View style={styles.divider} />

              {assignment && project ? (
                <View style={styles.assignmentDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="FolderKanban" size={15} color={theme.colors.brandPrimary} />
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                        ACTIVE PROJECT
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {project.name} ({project.id})
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="MapPin" size={15} color={theme.colors.emerald} />
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                        DEPLOYMENT CENTRE
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {center?.name || assignment.centerId}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="Calendar" size={15} color={theme.colors.textMuted} />
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>
                        SINCE
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {formatDate(assignment.startDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.unassignedBox}>
                  <Text style={[styles.unassignedText, { color: theme.colors.warning }]}>
                    Staff member is not yet deployed to a thematic project or centre.
                  </Text>
                  <Button
                    label="Assign Default Project"
                    onPress={() => handleQuickAssign(emp.id, emp.areaId)}
                    size="sm"
                    variant="secondary"
                    icon="Plus"
                  />
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
  topRow: {
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
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  assignmentDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  unassignedBox: {
    gap: 10,
    alignItems: 'flex-start',
  },
  unassignedText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
