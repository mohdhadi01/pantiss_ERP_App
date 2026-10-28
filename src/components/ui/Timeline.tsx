import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface TimelineItem {
  key: string;
  title: string;
  /** Actor / owner line (web timeline "actor" row). */
  actor?: string;
  detail?: string;
  time?: string;
  color?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  accent?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Vertical timeline — the web's border-l rail + dot pattern
 * (interview rounds, audit trails, payment history, approvals).
 */
export const Timeline: React.FC<TimelineProps> = ({ items, accent, style }) => {
  const { theme } = useTheme();
  const railColor = accent ?? theme.colors.brandPrimary;

  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => (
        <View key={item.key} style={styles.row}>
          <View style={styles.railColumn}>
            <View style={[styles.dot, { backgroundColor: item.color ?? railColor, borderColor: theme.colors.moduleBg }]} />
            {index < items.length - 1 ? (
              <View style={[styles.rail, { backgroundColor: theme.colors.border }]} />
            ) : null}
          </View>
          <View style={styles.body}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            {item.actor ? (
              <Text style={[styles.meta, { color: railColor }]}>{item.actor}</Text>
            ) : null}
            {item.detail ? (
              <Text style={[styles.detail, { color: theme.colors.textMuted }]}>{item.detail}</Text>
            ) : null}
            {item.time ? (
              <Text style={[styles.time, { color: theme.colors.textSubtle }]}>{item.time}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  railColumn: {
    alignItems: 'center',
    width: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginTop: 3,
  },
  rail: {
    width: 2,
    flex: 1,
    marginVertical: 2,
    borderRadius: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  meta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  detail: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
});
