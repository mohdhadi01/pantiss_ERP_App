import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { FinanceProject } from '../data';
import { budgetCategories, allocationShares } from '../budgetCategories';
import { formatCurrency } from '../data';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Icon } from '../../../components/ui/Icon';

/** Project expenditure ledger (web "View ledger" xl overlay) — expandable cost-head rows. */
export const LedgerSheet: React.FC<{ project: FinanceProject | null; visible: boolean; onClose: () => void }> = ({
  project,
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!project) return null;
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Project finances"
      title="Project expenditure ledger"
      description={`${project.name} · ${project.donor} · ${project.location}`}
      size="xl"
    >
      <View style={[styles.headPanel, { backgroundColor: theme.colors.surfaceMuted }]}>
        <LedgerStat label="Approved" value={formatCurrency(project.approved)} />
        <LedgerStat label="Released" value={formatCurrency(project.released)} />
        <LedgerStat label="Spent" value={formatCurrency(project.spent)} accent={theme.colors.financeAccent} />
        <LedgerStat label="Available" value={formatCurrency(Math.max(0, project.approved - project.spent - project.committed))} />
        <LedgerStat label="Advances" value={formatCurrency(project.pendingAdvances)} accent={theme.colors.warningText} />
      </View>

      <View style={styles.componentList}>
        {budgetCategories.map((cat) => {
          const allocation = project.approved * allocationShares[cat];
          const spent = allocation * (project.utilization / 100);
          const isExpanded = expanded === cat;
          return (
            <View key={cat} style={[styles.component, { borderColor: theme.colors.border }]}>
              <Pressable
                onPress={() => setExpanded(isExpanded ? null : cat)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                style={styles.componentHead}
              >
                <View style={styles.componentTitle}>
                  <Text style={[styles.componentName, { color: theme.colors.text }]}>{cat}</Text>
                  <Text style={[styles.componentAmt, { color: theme.colors.textMuted }]}>
                    {formatCurrency(spent)} / {formatCurrency(allocation)}
                  </Text>
                </View>
                <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={15} color={theme.colors.textSubtle} />
              </Pressable>
              {isExpanded ? (
                <View style={styles.componentBody}>
                  <ProgressBar value={(spent / allocation) * 100} height={5} color={theme.colors.financeAccent} />
                  <Text style={[styles.componentMeta, { color: theme.colors.textSubtle }]}>
                    Last voucher audit {project.lastVoucherDate} · advances {formatCurrency(project.pendingAdvances)} tracked against this head
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Expenditure audit trail</Text>
      <Timeline
        accent={theme.colors.financeAccent}
        items={[
          { key: '1', title: 'Donor funds received', actor: project.donor, detail: `${formatCurrency(project.released)} released against sanctioned ${formatCurrency(project.approved)}` },
          { key: '2', title: 'Quarterly expenditure verified', actor: 'Finance Verification Cell', detail: `${project.utilization}% of approved budget utilised`, color: theme.colors.financeAccent },
          { key: '3', title: 'Voucher audit completed', actor: 'Internal Audit Cell', detail: `Last voucher ${project.lastVoucherDate} · status ${project.status}`, color: theme.colors.teal },
        ]}
      />
    </ModalSheet>
  );
};

const LedgerStat: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.ledgerStat}>
      <Text style={[styles.ledgerStatValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
      <Text style={[styles.ledgerStatLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headPanel: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, borderRadius: 14, padding: 14 },
  ledgerStat: { minWidth: 90 },
  ledgerStatValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  ledgerStatLabel: { fontSize: 10, marginTop: 1 },
  componentList: { gap: 8 },
  component: { borderWidth: 1, borderRadius: 12, padding: 12 },
  componentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  componentTitle: { flex: 1, minWidth: 0 },
  componentName: { fontSize: 12.5, fontWeight: '600' },
  componentAmt: { fontSize: 11, fontVariant: ['tabular-nums'], marginTop: 1 },
  componentBody: { gap: 8, marginTop: 10 },
  componentMeta: { fontSize: 11, lineHeight: 15 },
  auditTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
});
