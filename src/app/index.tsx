import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { useCategory } from '../hooks/useCategory';
import { categories } from '../data/modules';
import { Category } from '../types/modules';
import { CategoryCard } from '../components/cards/CategoryCard';
import { TopNavigation } from '../components/layout/TopNavigation';

export default function WorkspaceLandingScreen() {
  const { theme } = useTheme();
  const { setSelectedCategory } = useCategory();
  const router = useRouter();

  const handleSelectCategory = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSelectedCategory(category.id);
    router.push(`/modules/${category.id}` as any);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.scrollContent}>
      {/* Top Navigation Bar matching Pantiss_ERP TopNavigation */}
      <TopNavigation canGoBack={false} />

      {/* Main Stage */}
      <View style={styles.mainContainer}>
        {/* Stage Heading Row */}
        <View style={styles.stageHeader}>
          <View style={styles.titleColumn}>
            <Text style={[styles.eyebrow, { color: theme.colors.textSubtle }]}>
              WORKSPACE
            </Text>
            <Text style={[styles.mainHeading, { color: theme.colors.text }]}>
              Select where to begin.
            </Text>
          </View>
          <Text style={[styles.workspaceCount, { color: theme.colors.textSubtle }]}>
            03 / WORKSPACES
          </Text>
        </View>

        {/* Workspace Deck */}
        <View style={styles.workspaceDeck}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onSelect={handleSelectCategory}
            />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
    paddingBottom: 64,
  },
  mainContainer: {
    paddingHorizontal: 20,
    paddingTop: 36,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    gap: 32,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  titleColumn: {
    flex: 1,
    gap: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  workspaceCount: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    paddingBottom: 4,
  },
  workspaceDeck: {
    gap: 20,
  },
});
