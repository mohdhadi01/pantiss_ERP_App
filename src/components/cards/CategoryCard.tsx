import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Category } from '../../types/modules';
import { Icon } from '../ui/Icon';
import { WorkspaceArtwork } from './WorkspaceArtwork';

import Animated from 'react-native-reanimated';
import { cardHeroSharedTransition } from '../../theme/transitions';

export interface CategoryCardProps {
  category: Category;
  index: number;
  onSelect: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  index,
  onSelect,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(category);
  };

  const countLabel =
    category.id === 'cxo'
      ? `${category.modules.length} executive roles`
      : `${category.modules.length} modules`;

  return (
    <Animated.View
      sharedTransitionTag={`category-shell-${category.id}`}
      sharedTransitionStyle={cardHeroSharedTransition}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.border,
          ...theme.shadows.card,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressableArea,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <LinearGradient
          colors={category.accentColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />

        <View style={styles.cardInner}>
          <View style={styles.headerRow}>
            <View style={styles.numberRow}>
              <LinearGradient
                colors={category.accentColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.numberBar}
              />
              <Text style={[styles.numberText, { color: theme.colors.textSubtle }]}>
                0{index + 1}
              </Text>
            </View>

            <View style={styles.arrowBox}>
              <Icon name="ArrowUpRight" size={17} color={theme.colors.textSubtle} />
            </View>
          </View>

          <Animated.View
            sharedTransitionTag={`category-icon-${category.id}`}
            sharedTransitionStyle={cardHeroSharedTransition}
            style={styles.artworkWrapper}
          >
            <WorkspaceArtwork
              category={category.id}
              iconName={category.iconName}
              accentColors={category.accentColors}
            />
          </Animated.View>

          <View style={[styles.bottomSection, { borderTopColor: theme.colors.border }]}>
            <View style={styles.metaRow}>
              <Text style={[styles.countText, { color: theme.colors.textSubtle }]}>
                {countLabel}
              </Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: category.accentColors[0] },
                ]}
              />
            </View>

            <Animated.Text
              sharedTransitionTag={`category-title-${category.id}`}
              sharedTransitionStyle={cardHeroSharedTransition}
              style={[styles.title, { color: theme.colors.text }]}
            >
              {category.title}
            </Animated.Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 340,
  },
  pressableArea: {
    flex: 1,
  },
  accentLine: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: 22,
    flex: 1,
    justifyContent: 'space-between',
  },
  artworkWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberBar: {
    width: 20,
    height: 1.5,
    borderRadius: 1,
  },
  numberText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 18,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
});
