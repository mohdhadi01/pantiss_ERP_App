import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { Employee } from '../types';
import { projects, projectCenters } from '../seed';
import { financeAreas } from '../../finance/data';
import { annualFromMonthly, areaName, monthlyFromAnnual, saveEmployee } from '../helpers';
import { formatRupees } from '../../../utils/formatCurrency';
import { hrSectionDescriptions } from '../constants';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { EmptyState } from '../../../components/ui/EmptyState';

export interface OnboardingViewProps {
  store: HRStore;
}

interface FormState {
  id: string;
  name: string;
  email: string;
  phone: string;
  joiningDate: string;
  areaId: string;
  designationId: string;
  status: 'Onboarding' | 'Active';
  annual: string;
  monthly: string;
}

const emptyForm = (): FormState => ({
  id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
  name: '',
  email: '',
  phone: '',
  joiningDate: '',
  areaId: '',
  designationId: '',
  status: 'Onboarding',
  annual: '',
  monthly: '',
});

export const OnboardingView: React.FC<OnboardingViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { data, commit } = store;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Onboarding' | 'Active'>('all');
  const [form, setForm] = useState<FormState | null>(null);

  const filtered = data.employees.filter((emp) => {
    const q = search.trim().toLowerCase();
    const matches =
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q);
    return matches && (filter === 'all' || emp.status === filter);
  });

  const openEdit = (emp: Employee) => {
    Haptics.selectionAsync().catch(() => {});
    setForm({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      joiningDate: emp.joiningDate,
      areaId: emp.areaId,
      designationId: emp.designationId,
      status: emp.status,
      annual: emp.annualSalary ? String(emp.annualSalary) : '',
      monthly: emp.annualSalary ? String(monthlyFromAnnual(emp.annualSalary)) : '',
    });
  };

  const handleSave = async () => {
    if (!form) return;
    const ok = await commit(
      (prev) =>
        saveEmployee(prev, {
          id: form.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          areaId: form.areaId,
          designationId: form.designationId,
          joiningDate: form.joiningDate,
          status: form.status,
          annualSalary: Number(form.annual) || 0,
          loginId: prev.employees.find((e) => e.id === form.id)?.loginId,
        }),
      'Employee record saved.',
    );
    if (ok) setForm(null);
  };

  const handleGenerate = (empId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    commit(
      (prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === empId ? { ...e, loginId: e.loginId || `PNT-${e.id.slice(-4)}` } : e,
        ),
      }),
      'Demo access profile generated.',
    );
  };

  const assignmentFor = (empId: string) => data.assignments.find((a) => a.employeeId === empId);
  const designationFor = (emp: Employee) => data.designations.find((d) => d.id === emp.designationId);

  const columns: Array<DataColumn<Employee>> = [
    { key: 'id', label: 'User ID', width: 108 },
    { key: 'name', label: 'Name', flex: 1.1 },
    { key: 'role', label: 'Role', flex: 1.2 },
    { key: 'salary', label: 'Salary', flex: 1 },
    { key: 'contact', label: 'Contact', flex: 1.3 },
    { key: 'project', label: 'Project & centre', flex: 1.3 },
    { key: 'access', label: 'Login access', flex: 1.2 },
    { key: 'status', label: 'Status', width: 104 },
  ];

  return (
    <View style={styles.container}>
      <Card padding={18} style={styles.banner}>
        <View style={[styles.bannerTile, { backgroundColor: theme.colors.brandSoft }]}>
          <Icon name="UserPlus" size={20} color={theme.colors.brandPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.bannerText}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
            One employee record, from joining to year-end review.
          </Text>
          <Text style={[styles.bannerSub, { color: theme.colors.textMuted }]}>
            {hrSectionDescriptions['employee-onboarding']}
          </Text>
        </View>
      </Card>

      <SectionCard
        title="Employee onboarding"
        description={`${data.employees.length} employees · Contact details shown are sample data`}
        action={
          <Button label="Add employee" variant="primary" size="sm" icon="Plus" onPress={() => setForm(emptyForm())} />
        }
      >
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search employee by name, ID or email…"
          filters={[
            { id: 'all', label: 'All Staff', count: data.employees.length },
            { id: 'Onboarding', label: 'Onboarding', count: data.employees.filter((e) => e.status === 'Onboarding').length },
            { id: 'Active', label: 'Active', count: data.employees.filter((e) => e.status === 'Active').length },
          ]}
          activeFilter={filter}
          onFilterChange={(f) => setFilter(f as 'all' | 'Onboarding' | 'Active')}
        />
        <DataTable
          columns={columns}
          rows={filtered}
          keyExtractor={(row) => row.id}
          emptyTitle="No employees match"
          emptyDescription="Adjust the search or add a new employee."
          emptyIcon="Users"
          footer={
            <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>
              Generate prepares a demo access profile only — production accounts are provisioned by IT after joining.
            </Text>
          }
          renderCell={(emp, column) => {
            const designation = designationFor(emp);
            const assignment = assignmentFor(emp.id);
            const project = assignment ? projects.find((p) => p.id === assignment.projectId) : undefined;
            const center = assignment ? projectCenters(assignment.projectId).find((c) => c.id === assignment.centerId) : undefined;
            switch (column.key) {
              case 'id':
                return <Text style={[styles.userId, { color: theme.colors.brandPrimary }]}>{emp.id}</Text>;
              case 'name':
                return (
                  <Pressable onPress={() => openEdit(emp)} hitSlop={6}>
                    <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{emp.name}</Text>
                  </Pressable>
                );
              case 'role':
                return (
                  <View>
                    <Text numberOfLines={1} style={[styles.cellTitle, { color: theme.colors.text }]}>
                      {designation?.title ?? 'Staff Role'}
                    </Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{designation?.level ?? '—'}</Text>
                  </View>
                );
              case 'salary':
                return (
                  <View>
                    <Text style={[styles.moneyBold, { color: theme.colors.text }]}>
                      {emp.annualSalary ? `${formatRupees(emp.annualSalary)} / yr` : '—'}
                    </Text>
                    {emp.annualSalary ? (
                      <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                        {formatRupees(monthlyFromAnnual(emp.annualSalary))} / month
                      </Text>
                    ) : null}
                  </View>
                );
              case 'contact':
                return (
                  <View>
                    <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textMuted }]}>{emp.email}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{emp.phone}</Text>
                  </View>
                );
              case 'project':
                return (
                  <View style={styles.stack6}>
                    {project ? <Badge label={project.name} tone="brand" size="sm" /> : null}
                    <View style={styles.centerRow}>
                      <Icon name="Building2" size={12} color={theme.colors.textSubtle} />
                      <Text numberOfLines={1} style={[styles.cellSub, { color: theme.colors.textMuted }]}>
                        {center?.name ?? 'Unassigned'}
                      </Text>
                    </View>
                    <Pressable onPress={() => router.push(`/(hr)/project-assignment?employee=${emp.id}` as never)} hitSlop={4}>
                      <Text style={[styles.assignLink, { color: theme.colors.brandPrimary }]}>Assign project →</Text>
                    </Pressable>
                  </View>
                );
              case 'access':
                return (
                  <View style={styles.stack6}>
                    <Text numberOfLines={1} style={[styles.accessCode, { color: theme.colors.text }]}>
                      {emp.loginId ?? 'Not prepared'}
                    </Text>
                    <View style={styles.accessRow}>
                      <Button label="Generate" variant="outline" size="sm" icon="RefreshCw" onPress={() => handleGenerate(emp.id)} />
                      <Button
                        label="Draft email"
                        variant="outline"
                        size="sm"
                        icon="Mail"
                        onPress={() => Linking.openURL(`mailto:${emp.email}`).catch(() => {})}
                      />
                    </View>
                  </View>
                );
              default:
                return <StatusChip status={emp.status} />;
            }
          }}
          renderMobileCard={(emp) => {
            const designation = designationFor(emp);
            return (
              <View style={[styles.mobileCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={styles.personRow}>
                  <Avatar name={emp.name} size={38} />
                  <View style={styles.personMain}>
                    <Pressable onPress={() => openEdit(emp)}>
                      <Text style={[styles.cellTitle, { color: theme.colors.text }]}>{emp.name}</Text>
                    </Pressable>
                    <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>
                      {designation?.title ?? 'Staff Role'} · {emp.id}
                    </Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                      {emp.email} · {emp.phone}
                    </Text>
                    <Text style={[styles.moneyBold, { color: theme.colors.text }]}>
                      {emp.annualSalary ? `${formatRupees(emp.annualSalary)} / yr` : '—'}
                    </Text>
                  </View>
                  <StatusChip status={emp.status} />
                </View>
                <View style={styles.accessRow}>
                  <Text style={[styles.accessCode, { color: theme.colors.text }]}>{emp.loginId ?? 'No access profile'}</Text>
                  <Button label="Generate" variant="outline" size="sm" icon="RefreshCw" onPress={() => handleGenerate(emp.id)} />
                </View>
              </View>
            );
          }}
        />
      </SectionCard>

      {form ? (
        <ModalSheet
          key={form.id}
          visible
          onClose={() => setForm(null)}
          label="People operations"
          title={data.employees.some((e) => e.id === form.id) ? `Edit employee · ${form.id}` : 'Onboard employee'}
          size="lg"
          footer={
            <>
              <Button label="Cancel" variant="outline" onPress={() => setForm(null)} />
              <Button label="Save employee" variant="primary" icon="Check" onPress={handleSave} />
            </>
          }
        >
          <TextField label="Full name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Employee full name" />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCell}>
              <TextField label="Email address" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" placeholder="name@pantiss.org" />
            </View>
            <View style={styles.fieldCell}>
              <TextField label="Phone number" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholder="+91 …" />
            </View>
          </View>
          <TextField label="Joining date" value={form.joiningDate} onChangeText={(v) => setForm({ ...form, joiningDate: v })} placeholder="YYYY-MM-DD" />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCell}>
              <SelectField
                label="Thematic area"
                value={form.areaId}
                onChange={(v) => setForm({ ...form, areaId: v, designationId: '' })}
                options={financeAreas.map((area) => ({ value: area.id, label: area.name }))}
                placeholder="Select thematic area"
              />
            </View>
            <View style={styles.fieldCell}>
              <SelectField
                label="Job designation"
                value={form.designationId}
                onChange={(v) => setForm({ ...form, designationId: v })}
                options={data.designations
                  .filter((d) => d.areaId === form.areaId)
                  .map((d) => ({ value: d.id, label: `${d.title} · ${d.level}` }))}
                placeholder={form.areaId ? 'Select designation' : 'Choose an area first'}
              />
            </View>
          </View>
          <SelectField
            label="Employment status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as 'Onboarding' | 'Active' })}
            options={[
              { value: 'Onboarding', label: 'Onboarding' },
              { value: 'Active', label: 'Active' },
            ]}
          />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCell}>
              <TextField
                label="Annual salary (CTC)"
                value={form.annual}
                onChangeText={(v) => {
                  const annual = Number(v) || 0;
                  setForm({ ...form, annual: v, monthly: v ? String(monthlyFromAnnual(annual)) : '' });
                }}
                keyboardType="numeric"
                suffix="₹"
              />
            </View>
            <View style={styles.fieldCell}>
              <TextField
                label="Monthly salary"
                value={form.monthly}
                onChangeText={(v) => {
                  const monthly = Number(v) || 0;
                  setForm({ ...form, monthly: v, annual: v ? String(annualFromMonthly(monthly)) : '' });
                }}
                keyboardType="numeric"
                suffix="₹"
                hint="Monthly = Annual ÷ 12"
              />
            </View>
          </View>
          <Text style={[styles.areaCaption, { color: theme.colors.textSubtle }]}>
            {form.areaId ? areaName(form.areaId) : 'Thematic area drives the available designations.'}
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
  stack6: {
    gap: 5,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userId: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  cellTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cellSub: {
    fontSize: 10.5,
  },
  moneyBold: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assignLink: {
    fontSize: 11,
    fontWeight: '600',
  },
  accessCode: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  accessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 16,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  personRow: {
    flexDirection: 'row',
    gap: 10,
  },
  personMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldCell: {
    flexGrow: 1,
    flexBasis: 200,
  },
  areaCaption: {
    fontSize: 11,
  },
});
