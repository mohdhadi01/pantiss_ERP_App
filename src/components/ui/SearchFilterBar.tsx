import React from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface SearchFilterBarProps {
  placeholder?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  style?: ViewStyle;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  placeholder = 'Search records...',
  searchQuery,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  style,
}) => {
  const { theme } = useTheme();

  const handleFilterSelect = (filterId: string) => {
    Haptics.selectionAsync().catch(() => {});
    onFilterChange?.(filterId);
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.colors.surfaceSoft,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Icon name="Search" size={16} color={theme.colors.textSubtle} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSubtle}
          style={[styles.input, { color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => onSearchChange('')}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Icon name="X" size={14} color={theme.colors.textSubtle} />
          </Pressable>
        )}
      </View>

      {filters && filters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => handleFilterSelect(filter.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? theme.colors.brandPrimary
                      : theme.colors.surfaceSoft,
                    borderColor: isActive
                      ? theme.colors.brandPrimary
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive
                        ? theme.colors.textInverted
                        : theme.colors.textMuted,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.count !== undefined && (
                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.25)'
                          : theme.colors.surfaceMuted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        {
                          color: isActive
                            ? theme.colors.textInverted
                            : theme.colors.textSubtle,
                        },
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
