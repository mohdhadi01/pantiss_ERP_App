import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { Employee } from '../types';
import { areaName, rupees } from '../helpers';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export interface OnboardingViewProps {
  store: HRStore;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Onboarding' | 'Active'>('all');

  const { data, commit } = store;

  const filtered = data.employees.filter((emp) => {
    const matchesQuery =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || emp.status === filter;
    return matchesQuery && matchesFilter;
  });

  const handleActivate = (empId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    commit((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === empId
          ? {
              ...e,
              status: 'Active',
              loginId: e.loginId || `PNT-${e.id.slice(-4)}`,
            }
          : e
      ),
    }), 'Employee access profile activated successfully.');
  };

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search employee by name, ID or email..."
        filters={[
          { id: 'all', label: 'All Staff', count: data.employees.length },
          {
            id: 'Onboarding',
            label: 'Onboarding',
            count: data.employees.filter((e) => e.status === 'Onboarding').length,
          },
          {
            id: 'Active',
            label: 'Active',
            count: data.employees.filter((e) => e.status === 'Active').length,
          },
        ]}
        activeFilter={filter}
        onFilterChange={(f) => setFilter(f as any)}
      />

      <View style={styles.list}>
        {filtered.map((emp) => {
          const designation = data.designations.find((d) => d.id === emp.designationId);
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
                <Avatar name={emp.name} size={42} />
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {emp.name}
                  </Text>
                  <Text style={[styles.role, { color: theme.colors.brandPrimary }]}>
                    {designation?.title || 'Staff Role'}
                  </Text>
                  <Text style={[styles.area, { color: theme.colors.textSubtle }]}>
                    {areaName(emp.areaId)} · {emp.id}
                  </Text>
                </View>
                <Badge
                  label={emp.status}
                  tone={emp.status === 'Active' ? 'emerald' : 'warning'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSubtle }]}>
                    JOINING DATE
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {formatDate(emp.joiningDate)}
                  </Text>
                </View>

                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSubtle }]}>
                    ANNUAL CTC
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.emerald, fontWeight: '700' }]}>
                    {emp.annualSalary ? rupees(emp.annualSalary) : '—'}
                  </Text>
                </View>

                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSubtle }]}>
                    LOGIN ID
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {emp.loginId || 'Pending'}
                  </Text>
                </View>
              </View>

              {emp.status === 'Onboarding' && (
                <View style={styles.actionRow}>
                  <Button
                    label="Activate Access Profile"
                    onPress={() => handleActivate(emp.id)}
                    size="sm"
                    variant="primary"
                    icon="Key"
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
  role: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  area: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
});
