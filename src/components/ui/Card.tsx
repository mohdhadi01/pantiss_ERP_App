import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface CardProps {
  children: React.ReactNode;
  /** Web rounded-2xl (16) by default; pass radii.panel (22) / radii.hero (30) for larger surfaces. */
  radius?: number;
  padding?: number;
  /** Disable the card shadow (web hover-less flat variants, e.g. Books). */
  flat?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Base surface — the web's `rounded-2xl border border-[var(--border)]
 * bg-[var(--module-bg)] shadow-[var(--shadow-card)]` pattern.
 */
export const Card: React.FC<CardProps> = ({
  children,
  radius,
  padding = 20,
  flat = false,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius ?? theme.radii.card,
          padding,
          backgroundColor: theme.colors.moduleBg,
          borderColor: theme.colors.border,
          ...(flat ? {} : theme.shadows.card),
        },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

export interface SectionCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description?: string;
  /** Eyebrow rendered above the title (web `text-[9px] uppercase tracking`). */
  eyebrow?: string;
  /** Right-aligned header slot — buttons, links, badges. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Card with the web's panel header: title + optional description + right action. */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  eyebrow,
  action,
  footer,
  children,
  ...cardProps
}) => {
  const { theme } = useTheme();

  return (
    <Card {...cardProps}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow ? (
            <Text
              numberOfLines={1}
              style={[
                theme.fontStyles.eyebrow,
                { color: theme.colors.brandPrimary, marginBottom: 6 },
              ]}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>
              {description}
            </Text>
          ) : null}
        </View>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 144, 168, 0.18)',
    marginTop: 16,
    paddingTop: 12,
  },
});
