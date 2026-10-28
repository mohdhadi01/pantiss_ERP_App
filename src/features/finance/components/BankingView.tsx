import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  purpose: string;
  balance: number;
  type: string;
}

const institutionalAccounts: BankAccount[] = [
  {
    id: 'sbi-main',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 4819',
    ifsc: 'SBIN0001042',
    purpose: 'Main Institutional Operating Account',
    balance: 184200000,
    type: 'Current Account',
  },
  {
    id: 'hdfc-grants',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 1829',
    ifsc: 'HDFC0000284',
    purpose: 'Donor Grants & CSR Inflow Account',
    balance: 125000000,
    type: 'Current Account',
  },
  {
    id: 'icici-disb',
    bankName: 'ICICI Bank',
    accountNumber: '•••• •••• 1928',
    ifsc: 'ICIC0000042',
    purpose: 'Vendor & Staff Disbursement Desk',
    balance: 52800000,
    type: 'Disbursement Account',
  },
  {
    id: 'axis-tax',
    bankName: 'Axis Bank',
    accountNumber: '•••• •••• 8102',
    ifsc: 'UTIB0000142',
    purpose: 'Statutory Taxes & Statutory Reserves',
    balance: 22500000,
    type: 'Escrow Reserve',
  },
];

interface BankTx {
  id: string;
  date: string;
  description: string;
  account: string;
  amount: number;
  type: 'credit' | 'debit';
  ref: string;
}

const recentTransactions: BankTx[] = [
  {
    id: 'TXN-01',
    date: '2026-10-08',
    description: 'Tata Trusts Q3 Grant Inflow — Odisha Skills',
    account: 'HDFC Bank',
    amount: 4500000,
    type: 'credit',
    ref: 'NEFT/CMS/9941829',
  },
  {
    id: 'TXN-02',
    date: '2026-10-06',
    description: 'Bulk Payroll Rollout — September 2026',
    account: 'ICICI Bank',
    amount: 1845000,
    type: 'debit',
    ref: 'CMS/PAY/0926',
  },
  {
    id: 'TXN-03',
    date: '2026-10-05',
    description: 'Apex Tooling Systems — Lab Workshop Settlement',
    account: 'State Bank of India',
    amount: 148500,
    type: 'debit',
    ref: 'RTGS/001042/88',
  },
  {
    id: 'TXN-04',
    date: '2026-10-02',
    description: 'Quarterly Fixed Deposit Interest Credit',
    account: 'State Bank of India',
    amount: 285400,
    type: 'credit',
    ref: 'INT/AUTO/Q2',
  },
];

export const BankingView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const totalBalance = institutionalAccounts.reduce((sum, a) => sum + a.balance, 0);

  const filteredTx = recentTransactions.filter((tx) =>
    tx.description.toLowerCase().includes(search.toLowerCase()) ||
    tx.ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Balance Metric */}
      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.balanceTop}>
          <View>
            <Text style={[styles.balanceSub, { color: theme.colors.textSubtle }]}>
              CONSOLIDATED TREASURY LIQUIDITY
            </Text>
            <Text style={[styles.balanceAmt, { color: theme.colors.text }]}>
              {formatRupees(totalBalance)}
            </Text>
          </View>
          <Badge label="4 Bank Accounts Active" tone="emerald" />
        </View>
      </View>

      {/* Institutional Bank Accounts Carousel / Cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Institutional Bank Accounts
        </Text>
        <View style={styles.accountsGrid}>
          {institutionalAccounts.map((acc) => (
            <View
              key={acc.id}
              style={[
                styles.accountCard,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.accHeader}>
                <View style={styles.accTitleRow}>
                  <View style={[styles.bankIconBox, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Icon name="Landmark" size={17} color={theme.colors.brandPrimary} />
                  </View>
                  <View>
                    <Text style={[styles.bankName, { color: theme.colors.text }]}>
                      {acc.bankName}
                    </Text>
                    <Text style={[styles.accNum, { color: theme.colors.textSubtle }]}>
                      {acc.accountNumber} · IFSC: {acc.ifsc}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.purposeText, { color: theme.colors.textMuted }]}>
                {acc.purpose}
              </Text>

              <View style={styles.accBottom}>
                <Text style={[styles.accBalance, { color: theme.colors.emerald }]}>
                  {formatRupees(acc.balance)}
                </Text>
                <Badge label={acc.type} tone="neutral" size="sm" />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Bank Statement Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Recent Treasury Transactions
        </Text>
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search bank transactions or UTR ref..."
        />

        <View style={styles.txList}>
          {filteredTx.map((tx) => (
            <View
              key={tx.id}
              style={[
                styles.txCard,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.txTop}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconBox,
                      {
                        backgroundColor:
                          tx.type === 'credit'
                            ? theme.colors.emeraldSoft
                            : theme.colors.dangerSoft,
                      },
                    ]}
                  >
                    <Icon
                      name={tx.type === 'credit' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                      size={16}
                      color={tx.type === 'credit' ? theme.colors.emerald : theme.colors.danger}
                    />
                  </View>
                  <View style={styles.txTitleCol}>
                    <Text style={[styles.txDesc, { color: theme.colors.text }]}>
                      {tx.description}
                    </Text>
                    <Text style={[styles.txMeta, { color: theme.colors.textSubtle }]}>
                      {tx.account} · Ref: {tx.ref} · {formatDate(tx.date)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.txAmt,
                    {
                      color: tx.type === 'credit' ? theme.colors.emerald : theme.colors.text,
                    },
                  ]}
                >
                  {tx.type === 'credit' ? '+' : '-'}
                  {formatRupees(tx.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  balanceAmt: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountsGrid: {
    gap: 12,
  },
  accountCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  accHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '700',
  },
  accNum: {
    fontSize: 11,
    marginTop: 1,
  },
  purposeText: {
    fontSize: 12,
    lineHeight: 16,
  },
  accBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 8,
    marginTop: 2,
  },
  accBalance: {
    fontSize: 16,
    fontWeight: '700',
  },
  txList: {
    gap: 10,
  },
  txCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitleCol: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  txMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  txAmt: {
    fontSize: 14,
    fontWeight: '700',
  },
});
