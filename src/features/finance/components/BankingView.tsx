import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { TransferSheet } from './BankingParts';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Icon } from '../../../components/ui/Icon';
import { BANK_ACCOUNTS, BANK_TRANSACTIONS, BankAccount, BankTx } from '../data/bankingData';

const LEDGER_COLUMNS: DataColumn<BankTx>[] = [
  { key: 'date', label: 'Date & ID', flex: 1.1 },
  { key: 'beneficiary', label: 'Beneficiary / Party', flex: 2 },
  { key: 'account', label: 'Account & Category', flex: 1.6, wideOnly: true },
  { key: 'ref', label: 'Bank UTR / Reference', flex: 1.5, wideOnly: true },
  { key: 'amount', label: 'Amount', flex: 1.2, align: 'right' },
  { key: 'status', label: 'Status', flex: 1 },
];

export const BankingView: React.FC = () => {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState<BankAccount[]>(BANK_ACCOUNTS);
  const [transactions, setTransactions] = useState<BankTx[]>(BANK_TRANSACTIONS);
  const [selectedAccountId, setSelectedAccountId] = useState(BANK_ACCOUNTS[0].id);
  const [sheetAccount, setSheetAccount] = useState<BankAccount | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [transferOpen, setTransferOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const totals = useMemo(() => {
    const balance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const sbi = accounts.find((a) => a.id === 'sbi-op')?.balance ?? 0;
    const hdfc = accounts.find((a) => a.id === 'hdfc-disb')?.balance ?? 0;
    const uncleared = transactions
      .filter((tx) => tx.status === 'Pending Clearance')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      balance,
      balanceLabel: formatCurrency(balance / 100000, true),
      floatLabel: formatCurrency((sbi + hdfc) / 100000, true),
      unclearedLabel: formatCurrency(uncleared / 100000, true),
    };
  }, [accounts, transactions]);

  const handleExecuteTransfer = (fromId: string, toId: string, amountLakhs: number, purpose: string) => {
    const amount = amountLakhs * 100000;
    const source = accounts.find((a) => a.id === fromId);
    const destination = accounts.find((a) => a.id === toId);
    if (!source || !destination) return;
    setAccounts((prev) =>
      prev.map((account) => {
        if (account.id === fromId) return { ...account, balance: account.balance - amount };
        if (account.id === toId) return { ...account, balance: account.balance + amount };
        return account;
      }),
    );
    const newTxn: BankTx = {
      id: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 10),
      party: `Internal Transfer to ${destination.bankName} (${destination.type})`,
      description: purpose || 'Inter-account float replenishment',
      account: source.bankName,
      category: 'Treasury Transfer',
      amount,
      type: 'debit',
      ref: `INT${Date.now().toString().slice(-8)}`,
      status: 'Reconciled',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setNotice(
      `Transfer executed — ${formatCurrency(amountLakhs, true)} moved from ${source.bankName} to ${destination.bankName}. A Treasury Transfer entry was added to the ledger.`,
    );
  };

  const filteredTx = useMemo(
    () =>
      transactions.filter((tx) => {
        const q = search.toLowerCase();
        const matchesSearch =
          tx.party.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.ref.toLowerCase().includes(q);
        const matchesAccount = accountFilter === 'all' || tx.account === accountFilter;
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        return matchesSearch && matchesAccount && matchesType && matchesStatus;
      }),
    [transactions, search, accountFilter, typeFilter, statusFilter],
  );

  const handleSync = () => {
    if (syncState !== 'idle') return;
    setSyncState('syncing');
    timers.current.push(setTimeout(() => setSyncState('done'), 1800));
    timers.current.push(setTimeout(() => setSyncState('idle'), 5200));
  };

  const accountOptions = [
    { value: 'all', label: 'All Bank Accounts' },
    ...accounts.map((a) => ({ value: a.bankName, label: `${a.bankName} (${a.maskedNo})` })),
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
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]} numberOfLines={2}>{tx.party}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]} numberOfLines={1}>{tx.description}</Text>
          </View>
        );
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
              {formatCurrency(tx.amount / 100000, true)}
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

      {notice ? (
        <Card padding={12} flat style={styles.noticeBar}>
          <Text style={[styles.noticeText, { color: theme.colors.successText }]}>{notice}</Text>
        </Card>
      ) : null}

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Total Liquid Balance" value={totals.balanceLabel} subtitle="Aggregated live across 4 institutional banks" icon="Landmark" accentColor={theme.colors.emerald} arrow />
        <MetricCard style={styles.metricCard} label="Available Disbursement Float" value={totals.floatLabel} subtitle="SBI & HDFC operational accounts" icon="CreditCard" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Uncleared / In-Transit Checks" value={totals.unclearedLabel} subtitle="Expected credit clearing within 24-48 hrs" icon="Clock" accentColor={theme.colors.warning} arrow />
        <MetricCard style={styles.metricCard} label="Ledger vs Bank Variance" value="₹0.00" subtitle="Automated EOD bank reconciliation verified" icon="ShieldCheck" accentColor={theme.colors.violet} arrow />
      </View>

      <View style={styles.section}>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Institutional Bank Accounts</Text>
        <View style={styles.accountsGrid}>
          {BANK_ACCOUNTS.map((acc) => {
            const selected = acc.id === selectedAccountId;
            return (
              <Pressable
                key={acc.id}
                onPress={() => {
                  setSelectedAccountId(acc.id);
                  setSheetAccount(acc);
                }}
                style={styles.accountCardWrap}
              >
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
            placeholder="Search UTR, party, narration..."
            containerStyle={styles.filterSearch}
          />
          <SelectField value={accountFilter} onChange={setAccountFilter} options={accountOptions} placeholder="All Bank Accounts" containerStyle={styles.filterSelect} />
          <SelectField
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'credit', label: 'Credit (Inflow)' },
              { value: 'debit', label: 'Debit (Disbursement)' },
            ]}
            placeholder="All Types"
            containerStyle={styles.filterSelect}
          />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Reconciled', label: 'Reconciled' },
              { value: 'Pending Clearance', label: 'Pending Clearance' },
            ]}
            placeholder="All Status"
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
        label="Treasury Float"
        title="Inter-Bank Float Transfer"
        description="Move funds between operational and project escrow accounts with dual authorization."
        size="md"
      >
        <TransferSheet
          visible={transferOpen}
          onClose={() => setTransferOpen(false)}
          accounts={accounts}
          onExecute={handleExecuteTransfer}
        />
      </ModalSheet>

      <ModalSheet
        visible={!!sheetAccount}
        onClose={() => setSheetAccount(null)}
        label="Institutional account"
        title={sheetAccount ? `${sheetAccount.bankName} ${sheetAccount.maskedNo}` : ''}
        description={sheetAccount ? `${sheetAccount.type} · IFSC ${sheetAccount.ifsc}` : undefined}
        size="sm"
      >
        {sheetAccount ? (
          <>
            <View style={styles.sheetSummary}>
              <Text style={[styles.sheetBalance, { color: theme.colors.financeAccent }]}>
                {formatRupees(sheetAccount.balance)}
              </Text>
              <Text style={[styles.sheetBalanceLabel, { color: theme.colors.textMuted }]}>Current Balance</Text>
              <StatusChip status="Reconciled" />
            </View>
            <SectionCard title="Recent activity" description={`Latest statement lines for ${sheetAccount.bankName}.`}>
              {transactions
                .filter((tx) => tx.account === sheetAccount.bankName)
                .map((tx) => (
                  <View key={tx.id} style={styles.sheetTxRow}>
                    <View style={styles.sheetTxMain}>
                      <Text numberOfLines={2} style={[styles.sheetTxTitle, { color: theme.colors.text }]}>
                        {tx.party}
                      </Text>
                      <Text style={[styles.sheetTxMeta, { color: theme.colors.textSubtle }]} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={[styles.sheetTxMeta, { color: theme.colors.textSubtle }]}>
                        {formatDate(tx.date)} · {tx.id} · {tx.ref}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.sheetTxAmount,
                        { color: tx.type === 'credit' ? theme.colors.emerald : theme.colors.text },
                      ]}
                    >
                      {tx.type === 'credit' ? '+' : '−'}
                      {formatCurrency(tx.amount / 100000, true)}
                    </Text>
                  </View>
                ))}
            </SectionCard>
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  noticeBar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  noticeText: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  sheetSummary: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 144, 168, 0.16)',
    backgroundColor: 'rgba(128, 144, 168, 0.06)',
  },
  sheetBalance: { fontSize: 28, fontWeight: '700', letterSpacing: -0.9, fontVariant: ['tabular-nums'] },
  sheetBalanceLabel: { fontSize: 12, marginBottom: 4 },
  sheetTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 144, 168, 0.12)',
  },
  sheetTxMain: { flex: 1, minWidth: 0, gap: 3 },
  sheetTxTitle: { fontSize: 12.5, fontWeight: '600', lineHeight: 17 },
  sheetTxMeta: { fontSize: 10.5 },
  sheetTxAmount: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
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
  mobileTxBody: { flex: 1, minWidth: 0, gap: 5 }
});
