import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { ModuleItem } from '../../types/modules';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';

export interface ModuleCardProps {
  module: ModuleItem;
  index: number;
  onSelect: (module: ModuleItem) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  index,
  onSelect,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(module);
  };

  const isSoon = module.status === 'Soon';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isSoon}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.moduleBg,
          borderColor: theme.colors.border,
          opacity: isSoon ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          ...theme.shadows.card,
        },
      ]}
    >
      <View style={styles.cardInner}>
        {/* Top Right Module Code */}
        <Text style={[styles.moduleCode, { color: theme.colors.textSubtle }]}>
          MOD–{String(index + 1).padStart(2, '0')}
        </Text>

        {/* Top Row: Icon + Status Badge */}
        <View style={styles.topRow}>
          <LinearGradient
            colors={module.accentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBox}
          >
            <Icon name={module.iconName} size={20} color="#ffffff" strokeWidth={1.75} />
          </LinearGradient>

          <Badge
            label={module.status ?? 'Live'}
            tone={isSoon ? 'neutral' : 'emerald'}
            size="sm"
          />
        </View>

        {/* Middle & Bottom: Title, Arrow, Description & Dots */}
        <View style={styles.bottomBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {module.title}
            </Text>
            <Icon name="ArrowUpRight" size={16} color={theme.colors.textSubtle} />
          </View>

          <Text
            style={[styles.description, { color: theme.colors.textMuted }]}
            numberOfLines={2}
          >
            {module.description}
          </Text>

          {/* 5 Indicator Bars matching web app */}
          <View style={styles.barRow}>
            {[0, 1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={[
                  styles.indicatorBar,
                  {
                    width: item < 3 ? 16 : 8,
                    backgroundColor:
                      item < 3 ? module.accentColors[0] : theme.colors.borderStrong,
                    opacity: item < 3 ? 0.75 : 0.4,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 220,
  },
  cardInner: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  moduleCode: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBlock: {
    gap: 8,
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  indicatorBar: {
    height: 2.5,
    borderRadius: 99,
  },
});
