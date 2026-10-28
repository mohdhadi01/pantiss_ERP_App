import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';

interface Investment {
  id: string;
  instrument: string;
  institution: string;
  principal: number;
  rate: number;
  maturityDate: string;
  interestAccrued: number;
  status: 'Active & Earning' | 'Matures Soon';
}

const investmentsList: Investment[] = [
  {
    id: 'INV-FD-01',
    instrument: 'Fixed Deposit (Corporate Non-Cumulative)',
    institution: 'State Bank of India',
    principal: 15000000,
    rate: 7.25,
    maturityDate: '2027-04-15',
    interestAccrued: 625000,
    status: 'Active & Earning',
  },
  {
    id: 'INV-FD-02',
    instrument: 'Fixed Deposit (Quarterly Payout)',
    institution: 'HDFC Bank',
    principal: 13500000,
    rate: 7.4,
    maturityDate: '2026-11-20',
    interestAccrued: 890000,
    status: 'Matures Soon',
  },
  {
    id: 'INV-MF-03',
    instrument: 'HDFC Liquid Fund — Direct Plan Growth',
    institution: 'HDFC Mutual Fund',
    principal: 8500000,
    rate: 6.85,
    maturityDate: 'Immediate Liquidity (T+1)',
    interestAccrued: 410000,
    status: 'Active & Earning',
  },
  {
    id: 'INV-MF-04',
    instrument: 'ICICI Prudential Overnight Fund',
    institution: 'ICICI Mutual Fund',
    principal: 5700000,
    rate: 6.5,
    maturityDate: 'Immediate Liquidity (T+0)',
    interestAccrued: 245000,
    status: 'Active & Earning',
  },
];

export const InvestmentsView: React.FC = () => {
  const { theme } = useTheme();

  const totalPrincipal = investmentsList.reduce((sum, inv) => sum + inv.principal, 0);
  const totalInterest = investmentsList.reduce((sum, inv) => sum + inv.interestAccrued, 0);
  const avgYield = (
    investmentsList.reduce((sum, inv) => sum + inv.rate, 0) / investmentsList.length
  ).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        <MetricCard
          label="Total Portfolio"
          value={formatRupees(totalPrincipal)}
          subtitle="Sanctioned Treasury"
          icon="TrendingUp"
          accentColor={theme.colors.brandPrimary}
        />
        <MetricCard
          label="Yield Return"
          value={`${avgYield}% p.a.`}
          subtitle="Weighted return"
          icon="CheckCircle"
          accentColor={theme.colors.emerald}
        />
        <MetricCard
          label="Interest Earned"
          value={formatRupees(totalInterest)}
          subtitle="Accrued to date"
          icon="Coins"
          accentColor={theme.colors.violet}
        />
      </View>

      <View style={styles.list}>
        {investmentsList.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={[styles.instrumentName, { color: theme.colors.text }]}>
                  {item.instrument}
                </Text>
                <Text style={[styles.instSub, { color: theme.colors.brandPrimary }]}>
                  {item.institution} · ID: {item.id}
                </Text>
              </View>
              <Badge
                label={item.status}
                tone={item.status.includes('Matures') ? 'warning' : 'emerald'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>PRINCIPAL DEPOSIT</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text, fontWeight: '700' }]}>
                  {formatRupees(item.principal)}
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>YIELD RATE</Text>
                <Text style={[styles.detailVal, { color: theme.colors.emerald, fontWeight: '700' }]}>
                  {item.rate}% p.a.
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>INTEREST EARNED</Text>
                <Text style={[styles.detailVal, { color: theme.colors.violet, fontWeight: '700' }]}>
                  {formatRupees(item.interestAccrued)}
                </Text>
              </View>
            </View>

            <Text style={[styles.maturityText, { color: theme.colors.textSubtle }]}>
              Maturity: {item.maturityDate.includes('Immediate') ? item.maturityDate : formatDate(item.maturityDate)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  instrumentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  instSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 13,
  },
  maturityText: {
    fontSize: 11,
  },
});
