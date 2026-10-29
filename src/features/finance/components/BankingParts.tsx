import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BankAccount } from '../data/bankingData';
import { formatCurrency } from '../../../utils/formatCurrency';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export const TransferSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onExecute: (fromId: string, toId: string, amountLakhs: number, purpose: string) => void;
}> = ({ visible, onClose, accounts, onExecute }) => {
  const { theme } = useTheme();
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id ?? '');
  const [toAccount, setToAccount] = useState(accounts[1]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');

  const sourceAccount = accounts.find((a) => a.id === fromAccount);
  const destinationOptions = accounts.filter((a) => a.id !== fromAccount);

  React.useEffect(() => {
    if (visible) {
      setError('');
    }
  }, [visible]);

  const accountLabel = (account: BankAccount) =>
    `${account.bankName} - ${account.type} (Bal: ${formatCurrency(account.balance / 100000, true)})`;

  const handleExecute = () => {
    const amtLakhs = parseFloat(amount);
    if (isNaN(amtLakhs) || amtLakhs <= 0) {
      setError('Enter a transfer amount greater than zero.');
      return;
    }
    if (sourceAccount && amtLakhs * 100000 > sourceAccount.balance) {
      setError('Transfer amount exceeds the source account balance.');
      return;
    }
    const destination = destinationOptions.find((a) => a.id === toAccount) ?? destinationOptions[0];
    if (!destination) {
      setError('Select a destination account.');
      return;
    }
    onExecute(fromAccount, destination.id, amtLakhs, purpose.trim());
    setAmount('');
    setPurpose('');
    setError('');
    onClose();
  };

  return (
    <View style={styles.formGap}>
      <SelectField
        label="Source Account"
        value={fromAccount}
        onChange={setFromAccount}
        options={accounts.map((a) => ({ value: a.id, label: accountLabel(a) }))}
      />
      <SelectField
        label="Destination Account"
        value={destinationOptions.some((a) => a.id === toAccount) ? toAccount : destinationOptions[0]?.id ?? ''}
        onChange={setToAccount}
        options={destinationOptions.map((a) => ({ value: a.id, label: accountLabel(a) }))}
      />
      <TextField
        label="Transfer Amount (in Lakhs ₹)"
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          setError('');
        }}
        keyboardType="numeric"
        placeholder="e.g. 25.50"
        error={error}
      />
      <TextField
        label="Purpose / Authorization Note"
        value={purpose}
        onChangeText={setPurpose}
        multiline
        placeholder="e.g. Regional field center disbursement float replenishment"
      />
      <View style={styles.auditNote}>
        <Icon name="ShieldCheck" size={14} color={theme.colors.successText} />
        <Text style={[styles.auditNoteText, { color: theme.colors.successText }]}>
          Transfer requests are recorded directly into the centralized audit trail with timestamp and
          initiator signature.
        </Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.footerNote, { color: theme.colors.textSubtle }]}>Instant intra-bank NEFT/RTGS</Text>
        <View style={styles.footerButtons}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Execute Transfer" variant="emerald" onPress={handleExecute} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formGap: { gap: 14 },
  auditNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 12,
  },
  auditNoteText: { fontSize: 11, lineHeight: 15, flex: 1, fontWeight: '500' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerNote: { fontSize: 10.5, flexShrink: 1 },
  footerButtons: { flexDirection: 'row', gap: 10 },
});
