import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface CardProps {
  children: React.ReactNode;
  radius?: number;
  padding?: number;
  flat?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  radius,
  padding = 20,
  flat = false,
  onPress,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      borderRadius: radius ?? theme.radii.card,
      padding,
      backgroundColor: theme.colors.moduleBg,
      borderColor: theme.colors.border,
      ...(flat ? {} : theme.shadows.card),
    },
    style,
    contentStyle,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={cardStyle}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

export interface SectionCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

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
  const { isMd } = useBreakpoint();

  return (
    <Card {...cardProps}>
      <View style={[styles.header, !isMd && styles.headerMobile]}>
        <View style={[styles.headerText, !isMd && styles.headerTextMobile]}>
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
        {action ? <View style={[styles.action, !isMd && styles.actionMobile]}>{action}</View> : null}
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
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTextMobile: {
    width: '100%',
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
  actionMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 144, 168, 0.18)',
    marginTop: 16,
    paddingTop: 12,
  },
});
