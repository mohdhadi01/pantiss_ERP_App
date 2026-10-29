import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { Icon } from '../../../components/ui/Icon';
import { trancheFund, FundTranche } from '../data/tranchesData';

export const SectionHeading: React.FC<{ title: string; sub: string; eyebrow: string }> = ({
  title,
  sub,
  eyebrow,
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionHeadingText}>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.sectionHeadingSub, { color: theme.colors.textSubtle }]}>{sub}</Text>
      </View>
      <Text style={[styles.sectionEyebrow, { color: theme.colors.financeAccent }]}>{eyebrow}</Text>
    </View>
  );
};

export const TrancheSection: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const data = trancheFund;
  const totalCorpus = data.tranches.reduce((sum, t) => sum + t.corpus, 0);
  const totalOps = data.tranches.reduce((sum, t) => sum + t.operations, 0);

  return (
    <View style={[styles.trancheCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.moduleBg }]}>
      <View style={styles.trancheHeader}>
        <View style={styles.trancheHeaderMain}>
          <View style={[styles.trancheIconTile, { backgroundColor: 'rgba(20, 184, 166, 0.12)' }]}>
            <Icon name="PieChart" size={18} color={theme.colors.teal} strokeWidth={1.8} />
          </View>
          <View style={styles.trancheHeaderText}>
            <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>
              Tranche Fund Allocation
            </Text>
            <Text style={[styles.trancheSub, { color: theme.colors.textSubtle }]} numberOfLines={2}>
              {data.programme} · {data.tranches.length} tranches · 50% Corpus + 50% Operations per tranche
            </Text>
          </View>
        </View>
        <View style={styles.trancheTotals}>
          <View style={[styles.trancheTotalPill, { backgroundColor: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Text style={[styles.trancheTotalLabel, { color: theme.colors.successText }]}>Total Corpus</Text>
            <Text style={[styles.trancheTotalValue, { color: theme.colors.successText }]} numberOfLines={1}>
              {formatRupees(totalCorpus)}
            </Text>
          </View>
          <View style={[styles.trancheTotalPill, { backgroundColor: 'rgba(59, 130, 246, 0.06)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Text style={[styles.trancheTotalLabel, { color: theme.colors.infoText }]}>Total Operations</Text>
            <Text style={[styles.trancheTotalValue, { color: theme.colors.infoText }]} numberOfLines={1}>
              {formatRupees(totalOps)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.trancheGrid}>
        {data.tranches.map((tranche, index) => (
          <TrancheCard key={tranche.id} tranche={tranche} index={index} wide={isMd} theme={theme} />
        ))}
      </View>
    </View>
  );
};

const TrancheCard: React.FC<{
  tranche: FundTranche;
  index: number;
  wide: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ tranche, index, wide, theme }) => {
  const overdue = tranche.state === 'overdue';
  const dueSoon = tranche.state === 'due-soon';
  const badgeText =
    overdue
      ? `${Math.abs(tranche.daysUntil)}d overdue`
      : dueSoon
        ? `Due in ${tranche.daysUntil}d`
        : tranche.tentativeDate;
  const badgeColor = overdue ? theme.colors.dangerText : dueSoon ? theme.colors.warningText : theme.colors.textMuted;
  const badgeBg = overdue
    ? 'rgba(239, 68, 68, 0.1)'
    : dueSoon
      ? 'rgba(245, 158, 11, 0.1)'
      : theme.colors.surfaceSoft;

  return (
    <View
      style={[
        styles.trancheItem,
        wide && styles.trancheItemWide,
        {
          borderColor: overdue
            ? 'rgba(239, 68, 68, 0.3)'
            : dueSoon
              ? 'rgba(245, 158, 11, 0.3)'
              : theme.colors.border,
          backgroundColor: overdue
            ? 'rgba(239, 68, 68, 0.04)'
            : dueSoon
              ? 'rgba(245, 158, 11, 0.04)'
              : theme.colors.surfaceSoft,
        },
      ]}
    >
      <View style={styles.trancheItemTop}>
        <View style={[styles.trancheIndex, { backgroundColor: `${theme.colors.financeAccent}1A` }]}>
          <Text style={[styles.trancheIndexText, { color: theme.colors.financeAccent }]}>{index + 1}</Text>
        </View>
        <View style={[styles.trancheBadge, { backgroundColor: badgeBg }]}>
          <Text numberOfLines={1} style={[styles.trancheBadgeText, { color: badgeColor }]}>
            {badgeText}
          </Text>
        </View>
      </View>
      <Text style={[styles.tranchePct, { color: theme.colors.text }]}>{tranche.percentage}%</Text>
      <Text numberOfLines={1} style={[styles.trancheOf, { color: theme.colors.textMuted }]}>
        of {formatRupees(tranche.amount)}
      </Text>
      <View style={[styles.trancheSplitRow, { backgroundColor: 'rgba(16, 185, 129, 0.06)' }]}>
        <Text style={[styles.trancheSplitLabel, { color: theme.colors.successText }]}>Corpus (50%)</Text>
        <Text numberOfLines={1} style={[styles.trancheSplitValue, { color: theme.colors.successText }]}>
          {formatRupees(tranche.corpus)}
        </Text>
      </View>
      <View style={[styles.trancheSplitRow, { backgroundColor: 'rgba(59, 130, 246, 0.06)' }]}>
        <Text style={[styles.trancheSplitLabel, { color: theme.colors.infoText }]}>Operations (50%)</Text>
        <Text numberOfLines={1} style={[styles.trancheSplitValue, { color: theme.colors.infoText }]}>
          {formatRupees(tranche.operations)}
        </Text>
      </View>
      {overdue && !tranche.invoiceRaised ? (
        <Text style={[styles.trancheOverdueNote, { color: theme.colors.dangerText }]}>
          ⚠ Invoice not raised by tentative date
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  sectionHeadingSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionEyebrow: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  trancheCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  trancheHeader: {
    gap: 12,
  },
  trancheHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trancheIconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trancheHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  trancheSub: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  trancheTotals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trancheTotalPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexGrow: 1,
    minWidth: 130,
    gap: 1,
  },
  trancheTotalLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  trancheTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  trancheGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trancheItem: {
    flexGrow: 1,
    flexBasis: '100%',
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    gap: 7,
  },
  trancheItemWide: {
    flexBasis: '46%',
  },
  trancheItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  trancheIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trancheIndexText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  trancheBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    maxWidth: '70%',
  },
  trancheBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tranchePct: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  trancheOf: {
    fontSize: 10.5,
    marginTop: -4,
  },
  trancheSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trancheSplitLabel: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  trancheSplitValue: {
    fontSize: 10.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  trancheOverdueNote: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
  },
});
