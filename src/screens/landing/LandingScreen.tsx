import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../hooks/useTheme';
import { useCategory } from '../../hooks/useCategory';
import { categories } from '../../data/modules';
import { Category } from '../../types/modules';
import { CategoryCard } from '../../components/cards/CategoryCard';
import { TopNavigation } from '../../components/layout/TopNavigation';
import type { PublicStackNav } from '../../navigation/types';

export const LandingScreen: React.FC = () => {
  const { theme } = useTheme();
  const { setSelectedCategory } = useCategory();
  const navigation = useNavigation<PublicStackNav>();

  const handleSelectCategory = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCategory(category.id);
    navigation.navigate('Modules', { categoryId: category.id });
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.scrollContent}>
      <TopNavigation canGoBack={true} onBack={() => navigation.navigate('Welcome')} />

      <View style={styles.mainContainer}>
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
};

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
