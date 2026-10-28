import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatCurrency } from '../../../utils/formatCurrency';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Icon } from '../../../components/ui/Icon';

/** Web InvestmentsView.tsx:57-159 — treasury holdings (values in lakhs). */
interface FixedDeposit {
  id: string;
  bankName: string;
  fdNumber: string;
  principal: number;
  currentValue: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  tenureMonths: number;
  payoutType: 'Cumulative' | 'Quarterly Payout';
  status: 'Active' | 'Matured';
  lienStatus: 'Unencumbered' | 'Earmarked for Bank Guarantee';
}

interface MutualFund {
  id: string;
  schemeName: string;
  amc: string;
  folioNumber: string;
  category: 'Liquid Fund' | 'Overnight Fund' | 'Ultra Short Term';
  investedAmount: number;
  currentValue: number;
  units: number;
  currentNav: number;
  returnPercentage: number;
  xirr: number;
}

const fixedDeposits: FixedDeposit[] = [
  { id: 'FD-2026-01', bankName: 'State Bank of India', fdNumber: 'SBI/FD/389102948', principal: 100.0, currentValue: 105.8, interestRate: 7.3, startDate: '15 Dec 2025', maturityDate: '15 Dec 2026', tenureMonths: 12, payoutType: 'Cumulative', status: 'Active', lienStatus: 'Unencumbered' },
  { id: 'FD-2026-02', bankName: 'HDFC Bank Ltd', fdNumber: 'HDFC/FD/502001928', principal: 80.0, currentValue: 85.2, interestRate: 7.5, startDate: '28 Feb 2026', maturityDate: '28 Feb 2027', tenureMonths: 12, payoutType: 'Cumulative', status: 'Active', lienStatus: 'Unencumbered' },
  { id: 'FD-2026-03', bankName: 'ICICI Bank Ltd', fdNumber: 'ICICI/FD/00420519', principal: 50.0, currentValue: 52.6, interestRate: 7.1, startDate: '10 Apr 2026', maturityDate: '10 Apr 2027', tenureMonths: 12, payoutType: 'Cumulative', status: 'Active', lienStatus: 'Earmarked for Bank Guarantee' },
  { id: 'FD-2026-04', bankName: 'Axis Bank Ltd', fdNumber: 'AXIS/FD/919020381', principal: 40.0, currentValue: 41.4, interestRate: 7.2, startDate: '05 Jun 2026', maturityDate: '05 Jun 2027', tenureMonths: 12, payoutType: 'Cumulative', status: 'Active', lienStatus: 'Unencumbered' },
];

const mutualFunds: MutualFund[] = [
  { id: 'MF-2026-01', schemeName: 'SBI Liquid Fund - Direct Plan - Growth', amc: 'SBI Mutual Fund', folioNumber: '10492819/84', category: 'Liquid Fund', investedAmount: 50.0, currentValue: 52.4, units: 14285.714, currentNav: 366.79, returnPercentage: 4.8, xirr: 7.6 },
  { id: 'MF-2026-02', schemeName: 'HDFC Overnight Fund - Direct Plan - Growth', amc: 'HDFC Asset Management', folioNumber: '50201948/12', category: 'Overnight Fund', investedAmount: 45.0, currentValue: 48.2, units: 12948.391, currentNav: 372.24, returnPercentage: 7.1, xirr: 7.1 },
  { id: 'MF-2026-03', schemeName: 'ICICI Prudential Ultra Short Term Fund - Direct - Growth', amc: 'ICICI Prudential AMC', folioNumber: '88291049/91', category: 'Ultra Short Term', investedAmount: 38.0, currentValue: 41.4, units: 15829.418, currentNav: 261.54, returnPercentage: 8.9, xirr: 8.2 },
];

export const InvestmentsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [certificateNotice, setCertificateNotice] = useState(false);

  const totals = useMemo(() => {
    const fdValue = fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0);
    const fdPrincipal = fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);
    const mfValue = mutualFunds.reduce((sum, mf) => sum + mf.currentValue, 0);
    const mfInvested = mutualFunds.reduce((sum, mf) => sum + mf.investedAmount, 0);
    return {
      portfolio: fdValue + mfValue,
      fdValue,
      fdPrincipal,
      mfValue,
      mfInvested,
      gains: fdValue + mfValue - fdPrincipal - mfInvested,
    };
  }, []);

  const renderFd = (fd: FixedDeposit) => (
    <Card key={fd.id} padding={14} style={[styles.holdingCard, isMd && { flexGrow: 1, flexBasis: 250 }]}>
      <View style={styles.holdingTop}>
        <View style={styles.holdingTitleCol}>
          <StatusChip status={`${fd.interestRate}% p.a.`} tone="brand" dot={false} />
          <Text style={[styles.holdingName, { color: theme.colors.text }]}>{fd.bankName}</Text>
          <Text style={[styles.holdingRef, { color: theme.colors.textSubtle }]}>{fd.fdNumber}</Text>
        </View>
        <StatusChip status={fd.status} tone="success" />
      </View>
      <View style={styles.holdingStats}>
        <Stat label="Principal" value={formatCurrency(fd.principal, true)} />
        <Stat label="Current Val" value={formatCurrency(fd.currentValue, true)} accent={theme.colors.emerald} />
      </View>
      <Text style={[styles.maturityText, { color: theme.colors.textSubtle }]}>
        Maturity: {fd.maturityDate} · Start {fd.startDate} · {fd.tenureMonths} months · {fd.payoutType}
      </Text>
      <Text style={[styles.lienText, { color: fd.lienStatus === 'Unencumbered' ? theme.colors.emerald : theme.colors.warningText }]}>
        {fd.lienStatus}
      </Text>
    </Card>
  );

  const renderMf = (mf: MutualFund) => (
    <Card key={mf.id} padding={14} style={[styles.holdingCard, isMd && { flexGrow: 1, flexBasis: 250 }]}>
      <View style={styles.holdingTop}>
        <View style={styles.holdingTitleCol}>
          <StatusChip status={mf.category} tone="violet" dot={false} />
          <Text numberOfLines={2} style={[styles.holdingName, { color: theme.colors.text }]}>{mf.schemeName}</Text>
          <Text style={[styles.holdingRef, { color: theme.colors.textSubtle }]}>{mf.amc} · Folio: {mf.folioNumber}</Text>
        </View>
        <StatusChip status={`+${mf.xirr}% XIRR`} tone="success" dot={false} />
      </View>
      <View style={styles.holdingStats}>
        <Stat label="Invested Cost" value={formatCurrency(mf.investedAmount, true)} />
        <Stat label="Current Value" value={formatCurrency(mf.currentValue, true)} accent={theme.colors.emerald} />
      </View>
      <Text style={[styles.maturityText, { color: theme.colors.textSubtle }]}>
        Current NAV: ₹{mf.currentNav} · {mf.units.toLocaleString('en-IN', { maximumFractionDigits: 3 })} units
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.banking}
        badge={{ icon: 'TrendingUp', label: 'Institutional Treasury & Investments' }}
        title="Mutual Funds & Fixed Deposits Portfolio"
        description="Capital preservation and yield optimization across institutional fixed deposits and SEBI-regulated liquid mutual funds compliant with trust investment regulations."
        actions={[
          {
            label: 'Download Valuation Certificate',
            icon: 'Download',
            variant: 'white',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setCertificateNotice(true);
            },
          },
        ]}
      />

      {certificateNotice ? (
        <Pressable accessibilityRole="button" onPress={() => setCertificateNotice(false)} style={[styles.notice, { backgroundColor: theme.colors.emeraldSoft, borderColor: theme.colors.successBorder }]}>
          <Icon name="CheckCircle2" size={15} color={theme.colors.emerald} />
          <Text style={[styles.noticeText, { color: theme.colors.successText }]}>
            Consolidated Investment Portfolio Valuation Report (PDF) downloaded.
          </Text>
          <Icon name="X" size={13} color={theme.colors.successText} />
        </Pressable>
      ) : null}

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Total Portfolio Valuation" value={formatCurrency(totals.portfolio, true)} subtitle="Combined FD and Mutual Fund holdings" icon="TrendingUp" accentColor={theme.colors.emerald} arrow />
        <MetricCard style={styles.metricCard} label="Total Fixed Deposits" value={formatCurrency(totals.fdValue, true)} subtitle={`Principal: ${formatCurrency(totals.fdPrincipal, true)} · 7.3% avg rate`} icon="Landmark" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Total Liquid Mutual Funds" value={formatCurrency(totals.mfValue, true)} subtitle={`Cost: ${formatCurrency(totals.mfInvested, true)} · 7.6% XIRR`} icon="PieChart" accentColor={theme.colors.violet} arrow />
        <MetricCard style={styles.metricCard} label="Unrealized Capital Yield" value={`+${formatCurrency(totals.gains, true)}`} subtitle="Cumulative interest & capital appreciation" icon="ShieldCheck" accentColor={theme.colors.teal} valueColor={theme.colors.emerald} arrow />
      </View>

      <SectionCard title="Fixed Deposits" description={`Corporate FDs with yield and maturity tracking · Current value ${formatCurrency(totals.fdValue, true)}`}>
        <View style={styles.holdingsGrid}>{fixedDeposits.map(renderFd)}</View>
      </SectionCard>

      <SectionCard title="Liquid Mutual Funds" description={`SEBI-regulated liquid and overnight funds · Current value ${formatCurrency(totals.mfValue, true)}`}>
        <View style={styles.holdingsGrid}>{mutualFunds.map(renderMf)}</View>
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
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  noticeText: { fontSize: 11.5, fontWeight: '600', flex: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  holdingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  holdingCard: { flexGrow: 1, flexBasis: 250, gap: 10 },
  holdingTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  holdingTitleCol: { flex: 1, minWidth: 0, gap: 4 },
  holdingName: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  holdingRef: { fontSize: 10 },
  holdingStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stat: { minWidth: 92 },
  statValue: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 9.5, marginTop: 1 },
  maturityText: { fontSize: 10.5, lineHeight: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128, 144, 168, 0.18)', paddingTop: 9 },
  lienText: { fontSize: 10.5, fontWeight: '600' },
});
