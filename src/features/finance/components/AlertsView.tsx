import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { heroGradients } from '../../../theme/gradients';
import { useFinanceAlerts } from '../data/alertsStore';
import { FinanceAlertCategory } from '../data/alertsData';
import { HeroBanner } from './HeroBanner';
import { Icon, IconSource } from '../../../components/ui/Icon';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

const CATEGORY_META: Record<FinanceAlertCategory, { icon: IconSource; color: string }> = {
  'Action Required': { icon: 'AlertTriangle', color: '#ef4444' },
  Compliance: { icon: 'Scale', color: '#f59e0b' },
  Approvals: { icon: 'CheckCircle2', color: '#3b82f6' },
  Investments: { icon: 'TrendingUp', color: '#3b82f6' },
  Budget: { icon: 'WalletCards', color: '#f59e0b' },
  Salary: { icon: 'Coins', color: '#14b8a6' },
  Completed: { icon: 'CheckCircle', color: '#10b981' },
};

const FILTERS: Array<'All' | FinanceAlertCategory> = [
  'All',
  'Action Required',
  'Compliance',
  'Approvals',
  'Investments',
  'Budget',
  'Salary',
  'Completed',
];

export const AlertsView: React.FC = () => {
  const { theme } = useTheme();
  const { alerts, dismiss, markAllRead } = useFinanceAlerts();
  const [filter, setFilter] = useState<'All' | FinanceAlertCategory>('All');
  const [search, setSearch] = useState('');
  const unreadCount = alerts.filter((a) => a.unread).length;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const alert of alerts) map.set(alert.category, (map.get(alert.category) ?? 0) + 1);
    return map;
  }, [alerts]);

  const visible = useMemo(() => {
    const byCategory = filter === 'All' ? alerts : alerts.filter((a) => a.category === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [alerts, filter, search]);

  const handleDismiss = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    dismiss(id);
  };

  return (
    <View style={styles.container}>
      {unreadCount > 0 ? (
        <View style={styles.markAllRow}>
          <Button
            label="Mark all as read"
            icon="CheckCircle2"
            variant="outline"
            size="sm"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              markAllRead();
            }}
          />
        </View>
      ) : null}

      <HeroBanner
        gradient={heroGradients.alerts}
        badge={{ icon: 'Bell', label: 'Finance Alerts & Notifications' }}
        title="Alerts & Highlights"
        description="Real-time alerts on advances, compliance deadlines, approval queues, investment events, and budget exceptions across all active finance modules."
        decorative={false}
        right={
          <View style={styles.statChips}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{unreadCount} unread</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{alerts.length} total</Text>
            </View>
          </View>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((key) => {
          const active = filter === key;
          const count = key === 'All' ? alerts.length : counts.get(key) ?? 0;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  borderColor: active ? theme.colors.financeAccent : theme.colors.border,
                  backgroundColor: active ? theme.colors.financeAccentSoft : pressed ? theme.colors.surfaceSoft : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? theme.colors.financeAccent : theme.colors.textMuted, fontWeight: active ? '600' : '500' },
                ]}
              >
                {key}
              </Text>
              <Text
                style={[
                  styles.filterCount,
                  { color: active ? theme.colors.financeAccent : theme.colors.textSubtle },
                ]}
              >
                {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <TextField value={search} onChangeText={setSearch} placeholder="Search alerts…" />

      <View style={styles.list}>
        {visible.length === 0 ? (
          <EmptyState
            icon="Bell"
            title={filter === 'All' ? 'All caught up' : `No ${filter} alerts`}
            description="No pending financial alerts or statutory deadlines in this category."
          />
        ) : (
          visible.map((alert) => {
            const meta = CATEGORY_META[alert.category];
            return (
              <View
                key={alert.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.moduleBg,
                    borderColor: theme.colors.border,
                    ...(theme.shadows.card as object),
                  },
                ]}
              >
                <View style={[styles.iconTile, { backgroundColor: `${meta.color}1A` }]}>
                  <Icon name={meta.icon} size={17} color={meta.color} strokeWidth={1.8} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    {alert.unread ? <View style={styles.unreadDot} /> : null}
                    <Text style={[styles.alertTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {alert.title}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: `${meta.color}1A` }]}>
                      <Text style={[styles.tagText, { color: meta.color }]}>{alert.category}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>{alert.date}</Text>
                    <Pressable
                      onPress={() => handleDismiss(alert.id)}
                      accessibilityLabel={`Dismiss alert: ${alert.title}`}
                      hitSlop={8}
                      style={styles.dismiss}
                    >
                      <Icon name="X" size={14} color={theme.colors.textSubtle} />
                    </Pressable>
                  </View>
                  <Text style={[styles.bodyText, { color: theme.colors.textMuted }]}>{alert.body}</Text>
                  <Text style={[styles.timeText, { color: theme.colors.textSubtle }]}>{alert.time}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  markAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  statChips: {
    gap: 8,
  },
  statChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-end',
  },
  statChipValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  alertTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  dismiss: {
    padding: 3,
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 17,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
});
