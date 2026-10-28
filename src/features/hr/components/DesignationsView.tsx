import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { HRStore } from '../store';
import { financeAreas } from '../../finance/data';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';

export interface DesignationsViewProps {
  store: HRStore;
}

export const DesignationsView: React.FC<DesignationsViewProps> = ({ store }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const { data } = store;

  const filtered = data.designations.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search job designation titles..."
      />

      <View style={styles.list}>
        {financeAreas.map((area) => {
          const areaDesignations = filtered.filter((d) => d.areaId === area.id);
          if (areaDesignations.length === 0) return null;

          return (
            <View
              key={area.id}
              style={[
                styles.areaSection,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.areaHeader}>
                <View style={[styles.colorBar, { backgroundColor: area.color }]} />
                <Text style={[styles.areaTitle, { color: theme.colors.text }]}>
                  {area.name}
                </Text>
                <Badge
                  label={`${areaDesignations.length} roles`}
                  tone="neutral"
                  size="sm"
                />
              </View>

              <View style={styles.rolesList}>
                {areaDesignations.map((role) => {
                  const staffCount = data.employees.filter(
                    (e) => e.designationId === role.id
                  ).length;

                  return (
                    <View
                      key={role.id}
                      style={[
                        styles.roleCard,
                        {
                          backgroundColor: theme.colors.surfaceSoft,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.roleHeader}>
                        <View style={styles.roleTitleCol}>
                          <Text style={[styles.roleTitle, { color: theme.colors.text }]}>
                            {role.title}
                          </Text>
                          <Text style={[styles.level, { color: theme.colors.textSubtle }]}>
                            {role.level}
                          </Text>
                        </View>
                        <Badge
                          label={`${staffCount} active`}
                          tone={staffCount > 0 ? 'emerald' : 'neutral'}
                          size="sm"
                        />
                      </View>

                      {role.description && (
                        <Text style={[styles.roleDesc, { color: theme.colors.textMuted }]}>
                          {role.description}
                        </Text>
                      )}
                    </View>
                  );
                })}
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
  list: {
    gap: 16,
  },
  areaSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  rolesList: {
    gap: 8,
  },
  roleCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTitleCol: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  level: {
    fontSize: 11,
    marginTop: 2,
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
