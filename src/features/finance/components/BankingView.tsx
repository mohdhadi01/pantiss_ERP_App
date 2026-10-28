import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

/** Web bank logo identity colors (SBI sky / HDFC blue / ICICI orange / Axis purple). */
const BANK_COLORS = {
  sbi: '#0284c7',
  hdfc: '#2563eb',
  icici: '#ea580c',
  axis: '#9333ea',
} as const;

interface BankAccount {
  id: string;
  bankName: string;
  maskedNo: string;
  ifsc: string;
  type: string;
  balance: number;
  color: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  { id: 'sbi-op', bankName: 'State Bank of India', maskedNo: '•••• 8210', ifsc: 'SBIN0001042', type: 'Operational', balance: 184200000, color: BANK_COLORS.sbi },
  { id: 'hdfc-disb', bankName: 'HDFC Bank', maskedNo: '•••• 8412', ifsc: 'HDFC0000284', type: 'Disbursement', balance: 84500000, color: BANK_COLORS.hdfc },
  { id: 'icici-escrow', bankName: 'ICICI Bank', maskedNo: '•••• 1923', ifsc: 'ICIC0000042', type: 'Grant Escrow', balance: 68300000, color: BANK_COLORS.icici },
  { id: 'axis-imprest', bankName: 'Axis Bank', maskedNo: '•••• 8102', ifsc: 'UTIB0000142', type: 'Field Imprest', balance: 47500000, color: BANK_COLORS.axis },
];

interface BankTx {
  id: string;
  date: string;
  description: string;
  account: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  ref: string;
  status: 'Reconciled' | 'Pending Clearance';
}

/** Existing inline transaction data, extended with ledger display fields. */
const BANK_TRANSACTIONS: BankTx[] = [
  { id: 'TXN-01', date: '2026-10-08', description: 'Tata Trusts Q3 Grant Inflow — Odisha Skills', account: 'HDFC Bank', category: 'Grant Inflow', amount: 4500000, type: 'credit', ref: 'NEFT/CMS/9941829', status: 'Reconciled' },
  { id: 'TXN-02', date: '2026-10-06', description: 'Bulk Payroll Rollout — September 2026', account: 'ICICI Bank', category: 'Payroll', amount: 1845000, type: 'debit', ref: 'CMS/PAY/0926', status: 'Reconciled' },
  { id: 'TXN-03', date: '2026-10-05', description: 'Apex Tooling Systems — Lab Workshop Settlement', account: 'State Bank of India', category: 'Vendor Settlement', amount: 148500, type: 'debit', ref: 'RTGS/001042/88', status: 'Pending Clearance' },
  { id: 'TXN-04', date: '2026-10-02', description: 'Quarterly Fixed Deposit Interest Credit', account: 'State Bank of India', category: 'Interest', amount: 285400, type: 'credit', ref: 'INT/AUTO/Q2', status: 'Reconciled' },
];

const LEDGER_COLUMNS: Array<DataColumn<BankTx>> = [
  { key: 'date', label: 'Date & ID', flex: 1.1 },
  { key: 'beneficiary', label: 'Beneficiary / Party', flex: 2 },
  { key: 'account', label: 'Account & Category', flex: 1.6, wideOnly: true },
  { key: 'ref', label: 'Bank UTR / Reference', flex: 1.5, wideOnly: true },
  { key: 'amount', label: 'Amount', flex: 1.2, align: 'right' },
  { key: 'status', label: 'Status', flex: 1 },
];

export const BankingView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedAccountId, setSelectedAccountId] = useState(BANK_ACCOUNTS[0].id);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [transferOpen, setTransferOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  // Transfer form
  const [fromAccount, setFromAccount] = useState(BANK_ACCOUNTS[0].id);
  const [toAccount, setToAccount] = useState(BANK_ACCOUNTS[1].id);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const totals = useMemo(() => {
    const balance = BANK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
    return {
      balance,
      balanceLabel: formatCurrency(balance / 100000, true),
      float: formatCurrency(BANK_ACCOUNTS[1].balance / 100000),
    };
  }, []);

  const filteredTx = useMemo(
    () =>
      BANK_TRANSACTIONS.filter((tx) => {
        const q = search.toLowerCase();
        const matchesSearch = tx.description.toLowerCase().includes(q) || tx.ref.toLowerCase().includes(q);
        const matchesAccount = accountFilter === 'all' || tx.account === accountFilter;
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        return matchesSearch && matchesAccount && matchesType && matchesStatus;
      }),
    [search, accountFilter, typeFilter, statusFilter],
  );

  const handleSync = () => {
    if (syncState !== 'idle') return;
    setSyncState('syncing');
    timers.current.push(setTimeout(() => setSyncState('done'), 1800));
    timers.current.push(setTimeout(() => setSyncState('idle'), 5200));
  };

  const accountOptions = [
    { value: 'all', label: 'All accounts' },
    ...BANK_ACCOUNTS.map((a) => ({ value: a.bankName, label: a.bankName })),
  ];

  const renderLedgerCell = (tx: BankTx, col: DataColumn<BankTx>) => {
    switch (col.key) {
      case 'date':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(tx.date)}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{tx.id}</Text>
          </View>
        );
      case 'beneficiary':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]} numberOfLines={2}>{tx.description}</Text>;
      case 'account':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{tx.account}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{tx.category}</Text>
          </View>
        );
      case 'ref':
        return <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>{tx.ref}</Text>;
      case 'amount':
        return (
          <View style={styles.amountCell}>
            <Icon
              name={tx.type === 'credit' ? 'ArrowDownLeft' : 'ArrowUpRight'}
              size={13}
              color={tx.type === 'credit' ? theme.colors.emerald : theme.colors.textMuted}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.amountText,
                { color: tx.type === 'credit' ? theme.colors.emerald : theme.colors.text },
              ]}
            >
              {tx.type === 'credit' ? '+' : '−'}
              {formatRupees(tx.amount)}
            </Text>
          </View>
        );
      case 'status':
        return <StatusChip status={tx.status} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.banking}
        badge={{ icon: 'Landmark', label: 'Banking & Treasury Desk' }}
        title="Real-time Liquidity & Bank Feeds"
        description="Live balances, reconciliation status and inter-bank movement across the institutional accounts."
        actions={[
          {
            label: syncState === 'idle' ? 'Sync Bank Feeds' : syncState === 'syncing' ? 'Syncing…' : 'Feeds reconciled!',
            icon: 'RefreshCw',
            variant: 'glass',
            onPress: handleSync,
          },
          { label: 'Inter-Bank Transfer', icon: 'ArrowRight', variant: 'white', onPress: () => setTransferOpen(true) },
        ]}
      />

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Total Liquid Balance" value={totals.balanceLabel} subtitle="4 Active A/Cs" icon="Landmark" accentColor={theme.colors.emerald} arrow />
        <MetricCard style={styles.metricCard} label="Available Disbursement Float" value={totals.float} subtitle="Operational" icon="CreditCard" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Uncleared / In-Transit Checks" value="₹4.20 L" subtitle="In-Transit" icon="Clock" accentColor={theme.colors.warning} arrow />
        <MetricCard style={styles.metricCard} label="Ledger vs Bank Variance" value="₹0.00" subtitle="Reconciled 99.4%" icon="ShieldCheck" accentColor={theme.colors.violet} arrow />
      </View>

      <View style={styles.section}>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Institutional Bank Accounts</Text>
        <View style={styles.accountsGrid}>
          {BANK_ACCOUNTS.map((acc) => {
            const selected = acc.id === selectedAccountId;
            return (
              <Pressable key={acc.id} onPress={() => setSelectedAccountId(acc.id)} style={styles.accountCardWrap}>
                <Card
                  padding={16}
                  style={[
                    styles.accountCard,
                    { borderColor: selected ? theme.colors.financeAccent : theme.colors.border, borderWidth: selected ? 2 : 1 },
                  ]}
                >
                  <View style={styles.accTop}>
                    <View style={[styles.accTile, { backgroundColor: `${acc.color}1A` }]}>
                      <Text style={[styles.accInitial, { color: acc.color }]}>{acc.bankName.charAt(0)}</Text>
                    </View>
                    <View style={styles.accTitleCol}>
                      <Text numberOfLines={1} style={[styles.accName, { color: theme.colors.text }]}>{acc.bankName}</Text>
                      <Text style={[styles.accNo, { color: theme.colors.textSubtle }]}>{acc.maskedNo}</Text>
                    </View>
                    <StatusChip status={acc.type} tone="brand" dot={false} />
                  </View>
                  <Text style={[styles.accBalance, { color: theme.colors.financeAccent }]}>{formatCurrency(acc.balance / 100000)}</Text>
                  <Text style={[styles.accLabel, { color: theme.colors.textMuted }]}>Current Balance</Text>
                  <View style={styles.accFooter}>
                    <Text style={[styles.accIfsc, { color: theme.colors.textSubtle }]}>IFSC {acc.ifsc}</Text>
                    <StatusChip status="Reconciled" />
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionCard
        title="Bank Statement Ledger"
        description="Auto-imported statements with reconciliation status across all four accounts."
      >
        <View style={styles.filterWrap}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search beneficiary or UTR…"
            containerStyle={styles.filterSearch}
          />
          <SelectField value={accountFilter} onChange={setAccountFilter} options={accountOptions} placeholder="All accounts" containerStyle={styles.filterSelect} />
          <SelectField
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'credit', label: 'Credits' },
              { value: 'debit', label: 'Debits' },
            ]}
            placeholder="All types"
            containerStyle={styles.filterSelect}
          />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Reconciled', label: 'Reconciled' },
              { value: 'Pending Clearance', label: 'Pending Clearance' },
            ]}
            placeholder="All statuses"
            containerStyle={styles.filterSelect}
          />
        </View>

        <DataTable
          columns={LEDGER_COLUMNS}
          rows={filteredTx}
          keyExtractor={(tx) => tx.id}
          renderCell={renderLedgerCell}
          renderMobileCard={(tx) => (
            <Card padding={14} style={styles.mobileTx}>
              <View style={styles.mobileTxTop}>
                <View style={styles.mobileTxBody}>
                  <Text style={[styles.cellMain, { color: theme.colors.text }]}>{tx.description}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                    {formatDate(tx.date)} · {tx.id} · {tx.account}
                  </Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Ref {tx.ref}</Text>
                </View>
                <StatusChip status={tx.status} />
              </View>
              {renderLedgerCell(tx, LEDGER_COLUMNS[4])}
            </Card>
          )}
          emptyTitle="No transactions match"
          emptyDescription="Adjust the search or filters to see bank statement lines."
        />
      </SectionCard>

      <ModalSheet
        visible={transferOpen}
        onClose={() => setTransferOpen(false)}
        label="Treasury operations"
        title="Inter-Bank Transfer"
        description="Log an internal movement between institutional accounts."
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setTransferOpen(false)} />
            <Button
              label="Record Transfer"
              variant="emerald"
              onPress={() => {
                setTransferOpen(false);
                setTransferAmount('');
                setTransferPurpose('');
              }}
            />
          </>
        }
      >
        <SelectField
          label="From account"
          value={fromAccount}
          onChange={setFromAccount}
          options={BANK_ACCOUNTS.map((a) => ({ value: a.id, label: `${a.bankName} ${a.maskedNo}` }))}
        />
        <SelectField
          label="To account"
          value={toAccount}
          onChange={setToAccount}
          options={BANK_ACCOUNTS.map((a) => ({ value: a.id, label: `${a.bankName} ${a.maskedNo}` }))}
        />
        <TextField label="Amount (₹)" value={transferAmount} onChangeText={setTransferAmount} keyboardType="numeric" placeholder="e.g. 2500000" />
        <TextField label="Purpose" value={transferPurpose} onChangeText={setTransferPurpose} placeholder="e.g. Field imprest top-up" />
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  section: { gap: 12 },
  accountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  accountCard: { gap: 8 },
  accountCardWrap: { flexGrow: 1, flexBasis: 250 },
  accTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  accInitial: { fontSize: 16, fontWeight: '700' },
  accTitleCol: { flex: 1, minWidth: 0 },
  accName: { fontSize: 13.5, fontWeight: '600' },
  accNo: { fontSize: 11, marginTop: 1, fontVariant: ['tabular-nums'] },
  accBalance: { fontSize: 20, fontWeight: '600', letterSpacing: -0.6, fontVariant: ['tabular-nums'], marginTop: 2 },
  accLabel: { fontSize: 10.5 },
  accFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  accIfsc: { fontSize: 10.5, fontVariant: ['tabular-nums'] },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  filterSearch: { flexGrow: 1, flexBasis: 220 },
  filterSelect: { flexGrow: 1, flexBasis: 160 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  amountCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  amountText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  mobileTx: { gap: 10 },
  mobileTxTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  mobileTxBody: { flex: 1, minWidth: 0, gap: 2 },
});
