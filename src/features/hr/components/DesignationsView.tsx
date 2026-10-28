import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { HRStore } from '../store';
import { financeAreas } from '../../finance/data';
import { Designation } from '../types';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';

export interface DesignationsViewProps {
  store: HRStore;
}

const LEVEL_OPTIONS = ['Individual contributor', 'Team lead', 'Manager', 'Head of function'].map((level) => ({
  value: level,
  label: level,
}));

export const DesignationsView: React.FC<DesignationsViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const { data, commit } = store;
  const [search, setSearch] = useState('');
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Individual contributor');
  const [description, setDescription] = useState('');

  const area = financeAreas.find((a) => a.id === activeArea);

  const employeesInArea = (areaId: string) => data.employees.filter((e) => e.areaId === areaId).length;
  const designationsInArea = (areaId: string) =>
    data.designations.filter(
      (d) =>
        d.areaId === areaId &&
        `${d.title} ${d.description}`.toLowerCase().includes(search.trim().toLowerCase()),
    );

  const handleCreate = async () => {
    if (!activeArea) return;
    const ok = await commit(
      (prev) => {
        if (!title.trim()) throw new Error('Designation title is required.');
        const designation: Designation = {
          id: `${activeArea}:role:${Date.now().toString(36).slice(-4)}`,
          areaId: activeArea,
          title: title.trim(),
          level,
          description: description.trim() || 'Responsibilities to be added.',
        };
        return { ...prev, designations: [...prev.designations, designation] };
      },
      'Designation created.',
    );
    if (ok) {
      setFormOpen(false);
      setTitle('');
      setLevel('Individual contributor');
      setDescription('');
    }
  };

  const columns: Array<DataColumn<Designation>> = [
    { key: 'title', label: 'Job designation', flex: 1.1 },
    { key: 'level', label: 'Level', flex: 1 },
    { key: 'responsibilities', label: 'Responsibilities', flex: 1.8 },
    { key: 'employees', label: 'Employees', width: 100 },
  ];

  if (area) {
    const areaDesignations = designationsInArea(area.id);
    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => setActiveArea(null)}
          style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.backText, { color: theme.colors.brandPrimary }]}>← All thematic areas</Text>
        </Pressable>
        <SectionCard
          title={`${area.name} designations`}
          description="Available when onboarding employees in this thematic area"
          action={
            <Button label="Create designation" variant="primary" size="sm" icon="Plus" onPress={() => setFormOpen(true)} />
          }
        >
          <DataTable
            columns={columns}
            rows={areaDesignations}
            keyExtractor={(row) => row.id}
            emptyTitle="No designations yet"
            emptyDescription="Create the first designation for this thematic area."
            emptyIcon="BriefcaseBusiness"
            renderCell={(role, column) => {
              switch (column.key) {
                case 'title':
                  return <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{role.title}</Text>;
                case 'level':
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{role.level}</Text>;
                case 'responsibilities':
                  return <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{role.description}</Text>;
                default:
                  return (
                    <Text style={[styles.cellCount, { color: theme.colors.text }]}>
                      {data.employees.filter((e) => e.designationId === role.id).length}
                    </Text>
                  );
              }
            }}
            renderMobileCard={(role) => (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.mobileTop}>
                  <View style={styles.mobileMain}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{role.title}</Text>
                    <Text style={[styles.cellText, { color: theme.colors.textSubtle }]}>{role.level}</Text>
                    <Text style={[styles.cellText, { color: theme.colors.textMuted }]}>{role.description}</Text>
                  </View>
                  <Text style={[styles.cellCount, { color: theme.colors.brandPrimary }]}>
                    {data.employees.filter((e) => e.designationId === role.id).length}
                  </Text>
                </View>
              </View>
            )}
          />
        </SectionCard>

        {formOpen ? (
          <ModalSheet
            visible
            onClose={() => setFormOpen(false)}
            label="Role design"
            title="Create designation"
            description={area.name}
            size="md"
            footer={
              <>
                <Button label="Cancel" variant="outline" onPress={() => setFormOpen(false)} />
                <Button label="Create designation" variant="primary" icon="Check" onPress={handleCreate} />
              </>
            }
          >
            <TextField label="Designation title" value={title} onChangeText={setTitle} placeholder="e.g. Field Coordinator" />
            <SelectField label="Level" value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
            <TextField
              label="Responsibilities"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Core responsibilities and expectations…"
            />
          </ModalSheet>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search job designation titles…"
      />
      <View style={[styles.grid, isMd && styles.gridWide]}>
        {financeAreas.map((item) => {
          const count = data.designations.filter((d) => d.areaId === item.id).length;
          return (
            <Pressable key={item.id} onPress={() => { Haptics.selectionAsync().catch(() => {}); setActiveArea(item.id); }}>
              <Card padding={18} style={[styles.areaCard, { borderColor: theme.colors.border }]}>
                <View style={[styles.areaTile, { backgroundColor: theme.colors.brandSoft }]}>
                  <Icon name="Building2" size={18} color={theme.colors.brandPrimary} strokeWidth={1.9} />
                </View>
                <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.areaMeta, { color: theme.colors.textMuted }]}>
                  {count} designations · {employeesInArea(item.id)} employees
                </Text>
                <View style={styles.areaLinkRow}>
                  <Text style={[styles.areaLink, { color: theme.colors.brandPrimary }]}>Manage designations →</Text>
                  <Icon name="ArrowUpRight" size={13} color={theme.colors.brandPrimary} />
                </View>
              </Card>
            </Pressable>
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
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridWide: {
    flexDirection: 'row',
  },
  areaCard: {
    flexGrow: 1,
    flexBasis: 260,
    gap: 8,
  },
  areaTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
  },
  areaMeta: {
    fontSize: 11.5,
  },
  areaLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  areaLink: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  cellTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cellText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  cellCount: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  mobileTop: {
    flexDirection: 'row',
    gap: 10,
  },
  mobileMain: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
});
