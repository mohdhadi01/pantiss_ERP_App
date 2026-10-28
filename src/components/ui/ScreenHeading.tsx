import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ScreenHeadingProps {
  /** Web eyebrow: `text-[9px] uppercase tracking-[0.18em]` in module accent. */
  eyebrow?: string;
  eyebrowColor?: string;
  title: string;
  description?: string;
  /** Right slot — pill badge, buttons (web "Demo workspace" pill etc.). */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Page heading block — the web's workspace heading
 * (eyebrow + h1 + description + right pill).
 */
export const ScreenHeading: React.FC<ScreenHeadingProps> = ({
  eyebrow,
  eyebrowColor,
  title,
  description,
  right,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textBlock}>
        {eyebrow ? (
          <Text
            style={[
              theme.fontStyles.eyebrow,
              styles.eyebrow,
              { color: eyebrowColor ?? theme.colors.brandPrimary },
            ]}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[theme.fontStyles.h1, styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 9,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    maxWidth: 560,
  },
  right: {
    alignItems: 'flex-end',
  },
});
