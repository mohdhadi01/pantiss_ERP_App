import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
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
  { id: 'INV-FD-01', instrument: 'Fixed Deposit (Corporate Non-Cumulative)', institution: 'State Bank of India', principal: 15000000, rate: 7.25, maturityDate: '2027-04-15', interestAccrued: 625000, status: 'Active & Earning' },
  { id: 'INV-FD-02', instrument: 'Fixed Deposit (Quarterly Payout)', institution: 'HDFC Bank', principal: 13500000, rate: 7.4, maturityDate: '2026-11-20', interestAccrued: 890000, status: 'Matures Soon' },
  { id: 'INV-MF-03', instrument: 'HDFC Liquid Fund — Direct Plan Growth', institution: 'HDFC Mutual Fund', principal: 8500000, rate: 6.85, maturityDate: 'Immediate Liquidity (T+1)', interestAccrued: 410000, status: 'Active & Earning' },
  { id: 'INV-MF-04', instrument: 'ICICI Prudential Overnight Fund', institution: 'ICICI Mutual Fund', principal: 5700000, rate: 6.5, maturityDate: 'Immediate Liquidity (T+0)', interestAccrued: 245000, status: 'Active & Earning' },
];

export const InvestmentsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();

  const totals = useMemo(() => {
    const invested = investmentsList.reduce((sum, inv) => sum + inv.principal, 0);
    const interest = investmentsList.reduce((sum, inv) => sum + inv.interestAccrued, 0);
    return {
      invested,
      current: invested + interest,
      interest,
      active: investmentsList.filter((inv) => inv.status === 'Active & Earning').length,
    };
  }, []);

  const fds = investmentsList.filter((inv) => inv.instrument.startsWith('Fixed Deposit'));
  const funds = investmentsList.filter((inv) => !inv.instrument.startsWith('Fixed Deposit'));

  const renderCard = (item: Investment) => (
    <Card key={item.id} padding={16} style={[styles.holdingCard, isMd && { flexGrow: 1, flexBasis: 280 }]}>
      <View style={styles.holdingTop}>
        <View style={[styles.holdingTile, { backgroundColor: theme.colors.infoSoft }]}>
          <Icon name={item.instrument.startsWith('Fixed Deposit') ? 'Landmark' : 'TrendingUp'} size={17} color={theme.colors.infoText} strokeWidth={1.8} />
        </View>
        <View style={styles.holdingTitleCol}>
          <Text style={[styles.holdingName, { color: theme.colors.text }]}>{item.instrument}</Text>
          <Text style={[styles.holdingSub, { color: theme.colors.brandPrimary }]}>{item.institution} · {item.id}</Text>
        </View>
        <StatusChip status={item.status} tone={item.status.includes('Matures') ? 'warning' : 'success'} />
      </View>
      <View style={styles.holdingStats}>
        <Stat label="Value" value={formatRupees(item.principal + item.interestAccrued)} />
        <Stat label="Principal" value={formatRupees(item.principal)} />
        <Stat label="Rate" value={`${item.rate}% p.a.`} accent={theme.colors.financeAccent} />
        <Stat label="Interest earned" value={formatRupees(item.interestAccrued)} accent={theme.colors.violet} />
      </View>
      <Text style={[styles.maturityText, { color: theme.colors.textSubtle }]}>
        Maturity: {item.maturityDate.includes('Immediate') ? item.maturityDate : formatDate(item.maturityDate)}
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.banking}
        badge={{ icon: 'TrendingUp', label: 'Treasury & Investment Desk' }}
        title="Investment portfolio"
        description="Fixed deposits and liquid funds of the treasury with live yield and maturity tracking."
      />

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Total Invested" value={formatRupees(totals.invested)} subtitle="Treasury principal" icon="Landmark" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Current Value" value={formatRupees(totals.current)} subtitle="Principal + accrued" icon="WalletCards" accentColor={theme.colors.financeAccent} arrow />
        <MetricCard style={styles.metricCard} label="Interest Earned" value={formatRupees(totals.interest)} subtitle="Accrued to date" icon="Coins" accentColor={theme.colors.violet} arrow />
        <MetricCard style={styles.metricCard} label="Active Instruments" value={String(totals.active)} subtitle="Of 4 holdings" icon="TrendingUp" accentColor={theme.colors.teal} arrow />
      </View>

      <SectionCard title="Fixed Deposits" description="Corporate FDs with yield and maturity tracking.">
        <View style={styles.holdingsGrid}>{fds.map(renderCard)}</View>
      </SectionCard>

      <SectionCard title="Mutual Funds" description="Liquid and overnight funds held for immediate liquidity.">
        <View style={styles.holdingsGrid}>{funds.map(renderCard)}</View>
      </SectionCard>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  holdingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  holdingCard: { flexGrow: 1, flexBasis: 260, gap: 12 },
  holdingTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  holdingTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  holdingTitleCol: { flex: 1, minWidth: 0 },
  holdingName: { fontSize: 13.5, fontWeight: '700', lineHeight: 18 },
  holdingSub: { fontSize: 11, marginTop: 2 },
  holdingStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stat: { minWidth: 92 },
  statValue: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 9.5, marginTop: 1 },
  maturityText: { fontSize: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128, 144, 168, 0.18)', paddingTop: 10 },
});
