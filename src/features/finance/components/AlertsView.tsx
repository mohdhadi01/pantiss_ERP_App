import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface AlertItem {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  actionRoute: string;
  actionLabel: string;
}

const initialAlerts: AlertItem[] = [
  {
    id: 'ALT-01',
    title: 'Statutory TDS Form 26Q Filing Deadline',
    detail: 'Quarter 2 filing due by 31 October 2026. Review challan ITNS-281 deductions.',
    severity: 'warning',
    timestamp: '2 hours ago',
    actionRoute: '/(finance)/taxation',
    actionLabel: 'Open Taxation Desk',
  },
  {
    id: 'ALT-02',
    title: 'Project Budget Cap Alert: PMKVY 4.0 Odisha Skills',
    detail: 'Expenditure has crossed 88% of sanctioned donor grant. Review commitment buffer.',
    severity: 'critical',
    timestamp: 'Yesterday',
    actionRoute: '/(finance)/budget',
    actionLabel: 'Review Budget Lines',
  },
  {
    id: 'ALT-03',
    title: 'Staff Travel Advance Overdue for Settlement',
    detail: 'Sunita Majhi has outstanding advances > 30 days pending expense receipt submission.',
    severity: 'warning',
    timestamp: '2 days ago',
    actionRoute: '/(finance)/reimbursement',
    actionLabel: 'Check Reimbursements',
  },
  {
    id: 'ALT-04',
    title: 'HDFC Corporate Fixed Deposit Matures Next Month',
    detail: 'FD-02 (₹1.35 Cr principal) matures on 20 November 2026. Instructions needed for auto-renewal.',
    severity: 'info',
    timestamp: '3 days ago',
    actionRoute: '/(finance)/investments',
    actionLabel: 'View Portfolio',
  },
];

export const AlertsView: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);

  const handleAction = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(route as any);
  };

  const handleDismiss = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Financial Alerts & Compliance Triggers
        </Text>
        <Text style={[styles.sub, { color: theme.colors.textSubtle }]}>
          {alerts.length} active notifications requiring executive action
        </Text>
      </View>

      <View style={styles.list}>
        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor:
                  alert.severity === 'critical'
                    ? 'rgba(239, 68, 68, 0.35)'
                    : alert.severity === 'warning'
                    ? 'rgba(245, 158, 11, 0.35)'
                    : theme.colors.border,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.cardTop}>
              <View style={styles.titleRow}>
                <View
                  style={[
                    styles.severityDot,
                    {
                      backgroundColor:
                        alert.severity === 'critical'
                          ? theme.colors.danger
                          : alert.severity === 'warning'
                          ? theme.colors.warning
                          : theme.colors.brandPrimary,
                    },
                  ]}
                />
                <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                  {alert.title}
                </Text>
              </View>

              <Pressable onPress={() => handleDismiss(alert.id)}>
                <Icon name="X" size={15} color={theme.colors.textSubtle} />
              </Pressable>
            </View>

            <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
              {alert.detail}
            </Text>

            <View style={styles.footerRow}>
              <Text style={[styles.timeText, { color: theme.colors.textSubtle }]}>
                {alert.timestamp}
              </Text>

              <Button
                label={alert.actionLabel}
                onPress={() => handleAction(alert.actionRoute)}
                size="sm"
                variant={alert.severity === 'critical' ? 'danger' : 'outline'}
                icon="ArrowUpRight"
                iconPosition="right"
              />
            </View>
          </View>
        ))}

        {alerts.length === 0 && (
          <View style={styles.emptyCard}>
            <Icon name="CheckCircle2" size={32} color={theme.colors.emerald} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              All Caught Up!
            </Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSubtle }]}>
              No pending financial alerts or statutory deadlines at this time.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
});
