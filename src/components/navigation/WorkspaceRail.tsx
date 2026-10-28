import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { categories } from '../../data/modules';
import { CategorySlug } from '../../types/modules';
import { Icon } from '../ui/Icon';
import type { PublicStackNav } from '../../navigation/types';

export interface WorkspaceRailProps {
  active: CategorySlug;
  onSelect?: (id: CategorySlug) => void;
  layout?: 'vertical' | 'horizontal';
}

export const WorkspaceRail: React.FC<WorkspaceRailProps> = ({
  active,
  onSelect,
  layout = 'vertical',
}) => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<PublicStackNav>();

  const handleSelect = (id: CategorySlug) => {
    if (id === active) return;
    Haptics.selectionAsync().catch(() => {});
    if (onSelect) {
      onSelect(id);
    } else {
      navigation.setParams({ categoryId: id });
    }
  };

  /* Mobile Horizontal Layout */
  if (layout === 'horizontal') {
    return (
      <View style={styles.mobileContainer}>
        {/* Top Header Row: WORKSPACES on left, Mini Capacity on right */}
        <View style={styles.mobileHeaderRow}>
          <Text style={[styles.mobileHeaderTitle, { color: theme.colors.textSubtle }]}>
            WORKSPACES
          </Text>
          <View style={styles.mobileMiniCapacity}>
            <Text style={[styles.mobileCapacityText, { color: theme.colors.textSubtle }]}>
              68%
            </Text>
            <View style={styles.mobileCapacityTrack}>
              <LinearGradient
                colors={['#dc2626', '#fb7185']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: '68%', height: '100%', borderRadius: 2 }}
              />
            </View>
          </View>
        </View>

        {/* Horizontal Capsule Options List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileScrollContent}
        >
          {categories.map((category, index) => {
            const isActive = category.id === active;
            const formattedIndex = String(index + 1).padStart(2, '0');

            return (
              <Pressable
                key={category.id}
                onPress={() => handleSelect(category.id)}
                style={({ pressed }) => [
                  styles.mobileCard,
                  {
                    backgroundColor: isActive
                      ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)')
                      : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)'),
                    borderColor: isActive
                      ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.12)')
                      : theme.colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityLabel={`Select ${category.title} workspace`}
              >
                {/* Active Glowing Red Left Edge Indicator */}
                {isActive && (
                  <View style={styles.mobileActiveIndicator} />
                )}

                {/* Square Icon Container */}
                <View
                  style={[
                    styles.mobileIconBox,
                    {
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.10)')
                        : theme.colors.surfaceSoft,
                      borderColor: isActive
                        ? 'rgba(248, 113, 113, 0.28)'
                        : theme.colors.border,
                    },
                  ]}
                >
                  <Icon
                    name={category.iconName}
                    size={14}
                    color={isActive ? '#ef4444' : theme.colors.textSubtle}
                    strokeWidth={1.8}
                  />
                </View>

                {/* Text Column */}
                <View style={styles.mobileTextColumn}>
                  <Text
                    style={[
                      styles.mobileCardTitle,
                      {
                        color: isActive ? theme.colors.text : theme.colors.textSubtle,
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {category.title}
                  </Text>
                  <Text
                    style={[
                      styles.mobileCardSubtitle,
                      {
                        color: theme.colors.textSubtle,
                        opacity: isActive ? 0.85 : 0.65,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {formattedIndex} / {category.modules.length} modules
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  /* Desktop Vertical Sidebar Layout */
  return (
    <View style={styles.railContainer}>
      {/* Header: WORKSPACES */}
      <Text style={[styles.railHeader, { color: theme.colors.textSubtle }]}>
        WORKSPACES
      </Text>

      {/* 3 Workspace Capsule Items */}
      <View style={styles.itemsList}>
        {categories.map((category, index) => {
          const isActive = category.id === active;
          const formattedIndex = String(index + 1).padStart(2, '0');
          const countLabel = `${category.modules.length} modules`;

          return (
            <Pressable
              key={category.id}
              onPress={() => handleSelect(category.id)}
              style={({ pressed }) => [
                styles.itemCard,
                {
                  backgroundColor: isActive
                    ? (isDark ? 'rgba(255, 255, 255, 0.055)' : 'rgba(15, 23, 42, 0.05)')
                    : 'transparent',
                  borderColor: isActive
                    ? (isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 23, 42, 0.09)')
                    : 'transparent',
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              accessibilityLabel={`Select ${category.title} workspace`}
            >
              {/* Active Glowing Red Indicator Bar on Left Edge */}
              {isActive && (
                <View style={styles.activeIndicator} />
              )}

              {/* Square Icon Container */}
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isActive
                      ? (isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)')
                      : theme.colors.surfaceSoft,
                    borderColor: isActive
                      ? 'rgba(248, 113, 113, 0.28)'
                      : theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={category.iconName}
                  size={16}
                  color={isActive ? '#ef4444' : theme.colors.textSubtle}
                  strokeWidth={1.8}
                />
              </View>

              {/* Text Column */}
              <View style={styles.textColumn}>
                <Text
                  style={[
                    styles.itemTitle,
                    {
                      color: isActive ? theme.colors.text : theme.colors.textSubtle,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {category.title}
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    {
                      color: theme.colors.textSubtle,
                      opacity: isActive ? 0.85 : 0.65,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {formattedIndex} / {countLabel}
                </Text>
              </View>

              {/* Chevron Right */}
              {isActive && (
                <View style={styles.chevronWrap}>
                  <Icon
                    name="ChevronRight"
                    size={14}
                    color={theme.colors.textSubtle}
                    strokeWidth={1.8}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Horizontal Divider Line */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Workspace Capacity Section */}
      <View style={styles.capacitySection}>
        <View style={styles.capacityRow}>
          <Text style={[styles.capacityLabel, { color: theme.colors.textSubtle }]}>
            Workspace capacity
          </Text>
          <Text style={[styles.capacityPercent, { color: theme.colors.textSubtle }]}>
            68%
          </Text>
        </View>

        {/* Capacity Progress Track & Gradient Fill */}
        <View style={styles.capacityTrack}>
          <LinearGradient
            colors={['#dc2626', '#fb7185']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.capacityFill, { width: '68%' }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Mobile Horizontal Styles */
  mobileContainer: {
    width: '100%',
    paddingBottom: 2,
    gap: 8,
  },
  mobileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  mobileHeaderTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  mobileMiniCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mobileCapacityText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  mobileCapacityTrack: {
    width: 38,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  mobileScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  mobileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 13,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mobileActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 2.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  mobileIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTextColumn: {
    gap: 1,
  },
  mobileCardTitle: {
    fontSize: 11.5,
    letterSpacing: -0.2,
  },
  mobileCardSubtitle: {
    fontSize: 8.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.1,
  },

  /* Desktop Vertical Styles */
  railContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  railHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  itemsList: {
    gap: 6,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 2.5,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.2,
  },
  chevronWrap: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 4,
  },
  capacitySection: {
    paddingHorizontal: 4,
    gap: 8,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  capacityPercent: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  capacityTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
});
