import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { GradientPreset } from '../../../theme/gradients';
import { Icon, IconSource } from '../../../components/ui/Icon';

export interface HeroAction {
  label: string;
  icon?: IconSource;
  /** `white` = solid white button (web `bg-white text-emerald-900`); `glass` = translucent. */
  variant: 'white' | 'glass';
  onPress?: () => void;
}

export interface HeroBannerProps {
  gradient: GradientPreset;
  /** Pill badge — icon + label (web "Finance portfolio control"). */
  badge: { icon: IconSource; label: string };
  title: string;
  description?: string;
  /** Right glass card — the web utilization panel. */
  right?: React.ReactNode;
  actions?: HeroAction[];
  /** Decorative ring + glow (web size-72 rings / emerald-300/10 blur). */
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Finance hero — web `bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700
 * rounded-[30px] p-6 shadow-[0_28px_80px_rgba(5,150,105,.18)]`.
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  gradient,
  badge,
  title,
  description,
  right,
  actions,
  decorative = true,
  style,
}) => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();

  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={[styles.hero, { borderRadius: theme.radii.hero, ...(theme.shadows.heroEmerald as object) }, style]}
    >
      {decorative ? (
        <View style={styles.decorLayer} pointerEvents="none">
          <View style={styles.ringOne} />
          <View style={styles.ringTwo} />
          <View style={styles.glow} />
        </View>
      ) : null}

      <View style={[styles.content, !isMd && styles.contentStacked]}>
        <View style={styles.mainColumn}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Icon name={badge.icon} size={14} color="#6ee7b7" strokeWidth={1.9} />
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          </View>
          <Text style={[styles.title, !isMd && styles.titleMobile]}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {actions && actions.length > 0 ? (
            <View style={styles.actionsRow}>
              {actions.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.action,
                    action.variant === 'white' ? styles.actionWhite : styles.actionGlass,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  {action.icon ? (
                    <Icon
                      name={action.icon}
                      size={15}
                      color={action.variant === 'white' ? '#065f46' : '#ffffff'}
                      strokeWidth={1.9}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.actionText,
                      { color: action.variant === 'white' ? '#065f46' : '#ffffff' },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {right ? (
          <View style={[styles.rightColumn, !isMd && styles.rightColumnStacked]}>{right}</View>
        ) : null}
      </View>
    </LinearGradient>
  );
};

/** Web glass panel (`bg-black/15 backdrop-blur border-white/15`). */
export const HeroGlassCard: React.FC<{
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ label, children, footer }) => (
  <View style={styles.glassCard}>
    <Text style={styles.glassLabel}>{label}</Text>
    {children}
    {footer}
  </View>
);

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
  },
  decorLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ringOne: {
    position: 'absolute',
    right: -48,
    top: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ringTwo: {
    position: 'absolute',
    right: 12,
    top: 26,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glow: {
    position: 'absolute',
    right: -30,
    bottom: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(110, 231, 183, 0.1)',
  },
  content: {
    flexDirection: 'row',
    padding: 24,
    gap: 20,
    alignItems: 'center',
  },
  /** Phones: stack text above the glass card — full width each (mobile-first). */
  contentStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 20,
    gap: 18,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#d1fae5',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    color: '#ffffff',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '600',
    letterSpacing: -1.2,
  },
  titleMobile: {
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.9,
  },
  description: {
    color: 'rgba(209, 250, 229, 0.85)',
    fontSize: 12.5,
    lineHeight: 18,
    maxWidth: 480,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionWhite: {
    backgroundColor: '#ffffff',
  },
  actionGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  rightColumn: {
    width: 190,
  },
  rightColumnStacked: {
    width: '100%',
  },
  glassCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  glassLabel: {
    color: 'rgba(209, 250, 229, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
