import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Icon } from '../../../components/ui/Icon';
import type { Invoice } from './InvoicesView';

export interface InvoiceItemLine {
  id: number;
  description: string;
  qty: string;
  rate: string;
}

interface CreateFormState {
  number: string;
  client: string;
  email: string;
  issueDate: string;
  dueDate: string;
  billingAddress: string;
  notes: string;
}

export const EMPTY_CREATE: CreateFormState = {
  number: '',
  client: '',
  email: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  billingAddress: '',
  notes: 'NEFT to Pantiss Foundation current account. Quote the invoice number in the remittance reference.',
};

export const CreateInvoiceSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (draft: CreateFormState, items: InvoiceItemLine[]) => void;
  projectName: string | null;
  prefill?: { client?: string; amount?: number; lineDescription?: string };
}> = ({ visible, onClose, onSave, projectName, prefill }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState<CreateFormState>(EMPTY_CREATE);
  const [items, setItems] = useState<InvoiceItemLine[]>([{ id: 1, description: projectName ?? 'Grant tranche', qty: '1', rate: '' }]);

  React.useEffect(() => {
    if (visible) {
      setForm({ ...EMPTY_CREATE, client: prefill?.client ?? '' });
      setItems([
        {
          id: 1,
          description: prefill?.lineDescription ?? projectName ?? 'Grant tranche',
          qty: '1',
          rate: prefill?.amount ? String(prefill.amount) : '',
        },
      ]);
    }
     
  }, [visible, prefill?.client, prefill?.amount, prefill?.lineDescription, projectName]);

  const setField = (key: keyof CreateFormState) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const total = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0);

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Invoicing"
      title="Create Invoice"
      description={projectName ? `Billing against ${projectName}` : undefined}
      size="lg"
      footer={
        <>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Save draft & review" variant="emerald" onPress={() => onSave(form, items)} />
        </>
      }
    >
      <View style={styles.row2}>
        <TextField label="Invoice number" value={form.number} onChangeText={setField('number')} placeholder="INV-2026-0XX" containerStyle={styles.flex1} />
        <TextField label="Client / organization" value={form.client} onChangeText={setField('client')} placeholder="Donor or client entity" containerStyle={styles.flex1} />
      </View>
      <TextField label="Client email" value={form.email} onChangeText={setField('email')} keyboardType="email-address" autoCapitalize="none" placeholder="billing@client.org" />
      <View style={styles.row2}>
        <TextField label="Issue date" value={form.issueDate} onChangeText={setField('issueDate')} placeholder="YYYY-MM-DD" containerStyle={styles.flex1} />
        <TextField label="Due date" value={form.dueDate} onChangeText={setField('dueDate')} placeholder="YYYY-MM-DD" containerStyle={styles.flex1} />
      </View>
      <TextField label="Billing address" value={form.billingAddress} onChangeText={setField('billingAddress')} multiline placeholder="Registered billing address…" />

      <View style={styles.itemsBlock}>
        <Text style={[styles.itemsTitle, { color: theme.colors.text }]}>Invoice items</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TextField
              value={item.description}
              onChangeText={(t) => setItems((rows) => rows.map((r) => (r.id === item.id ? { ...r, description: t } : r)))}
              placeholder="Description"
              containerStyle={styles.itemDesc}
            />
            <TextField
              value={item.qty}
              onChangeText={(t) => setItems((rows) => rows.map((r) => (r.id === item.id ? { ...r, qty: t } : r)))}
              keyboardType="numeric"
              placeholder="Qty"
              containerStyle={styles.itemQty}
            />
            <TextField
              value={item.rate}
              onChangeText={(t) => setItems((rows) => rows.map((r) => (r.id === item.id ? { ...r, rate: t } : r)))}
              keyboardType="numeric"
              placeholder="Rate ₹"
              containerStyle={styles.itemQty}
            />
            <View style={styles.itemRight}>
              <Text style={[styles.itemTotal, { color: theme.colors.text }]}>
                {formatRupees((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0))}
              </Text>
              <Pressable
                onPress={() => setItems((rows) => rows.filter((r) => r.id !== item.id))}
                hitSlop={8}
                accessibilityLabel="Remove line item"
              >
                <Icon name="X" size={15} color={theme.colors.dangerText} />
              </Pressable>
            </View>
          </View>
        ))}
        <Button
          label="Add item"
          icon="Plus"
          variant="outline"
          size="sm"
          onPress={() => setItems((rows) => [...rows, { id: Date.now(), description: '', qty: '1', rate: '' }])}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>

      <TextField label="Payment instructions" value={form.notes} onChangeText={setField('notes')} multiline />
      <View style={[styles.totalRow, { backgroundColor: theme.colors.financeAccentSoft }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: theme.colors.financeAccent }]}>{formatRupees(total)}</Text>
      </View>
    </ModalSheet>
  );
};

export const InvoiceViewSheet: React.FC<{
  invoice: Invoice | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onRaise: (invoice: Invoice) => void;
  onVerify: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
}> = ({ invoice, visible, onClose, onEdit, onRaise, onVerify, onDownload }) => {
  const { theme } = useTheme();
  if (!invoice) return null;
  const verified = invoice.status === 'Admin Verified';
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Invoicing"
      title={invoice.number}
      description={`${invoice.status} · ${invoice.project}`}
      size="md"
      footer={
        <>
          <Button label="Download PDF" icon="Download" variant="outline" size="sm" onPress={() => onDownload(invoice)} />
          {invoice.status === 'Draft' ? <Button label="Edit draft" icon="FileText" variant="outline" size="sm" onPress={() => onEdit(invoice)} /> : null}
          {invoice.status === 'Draft' ? <Button label="Raise invoice" variant="emerald" size="sm" onPress={() => onRaise(invoice)} /> : null}
          {invoice.status === 'Raised' ? <Button label="Admin Verify (Super Admin)" variant="emerald" size="sm" onPress={() => onVerify(invoice)} /> : null}
        </>
      }
    >
      {verified ? (
        <View style={[styles.verifiedBanner, { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.successBorder }]}>
          <Icon name="ShieldCheck" size={16} color={theme.colors.successText} />
          <Text style={[styles.verifiedText, { color: theme.colors.successText }]}>Super Admin Verified</Text>
        </View>
      ) : null}
      <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <Row label="Status" value={<StatusChip status={invoice.status} />} />
        <Row label="Client" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{invoice.client}</Text>} />
        <Row label="Client email" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{invoice.email}</Text>} />
        <Row label="Issue date" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDate(invoice.date)}</Text>} />
        <Row label="Due date" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDate(invoice.dueDate)}</Text>} />
        <Row label="Billing address" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{invoice.billingAddress}</Text>} />
        <Row label="Amount (excl. GST)" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatRupees(invoice.amount)}</Text>} />
        <Row label="GST" value={<Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatRupees(invoice.gstAmount)}</Text>} />
        <Row label="Total" value={<Text style={[styles.rowValue, { color: theme.colors.financeAccent }]}>{formatRupees(invoice.amount + invoice.gstAmount)}</Text>} />
      </View>
      {invoice.lines?.length ? (
        <>
          <Text style={[styles.notesTitle, { color: theme.colors.text }]}>Invoice items</Text>
          {invoice.lines.map((line) => (
            <View key={line.id} style={[styles.lineRow, { borderColor: theme.colors.border }]}>
              <View style={styles.lineBody}>
                <Text numberOfLines={1} style={[styles.lineDesc, { color: theme.colors.text }]}>{line.description}</Text>
                <Text style={[styles.lineCalc, { color: theme.colors.textSubtle }]}>
                  {line.qty} × {formatRupees(parseFloat(line.rate) || 0)}
                </Text>
              </View>
              <Text style={[styles.lineTotal, { color: theme.colors.text }]}>
                {formatRupees((parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0))}
              </Text>
            </View>
          ))}
        </>
      ) : null}
      <Text style={[styles.notesTitle, { color: theme.colors.text }]}>Payment instructions</Text>
      <Text style={[styles.notesText, { color: theme.colors.textMuted }]}>{invoice.notes}</Text>
    </ModalSheet>
  );
};

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      {value}
    </View>
  );
};

const styles = StyleSheet.create({
  row2: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  itemsBlock: { gap: 10 },
  itemsTitle: { fontSize: 13.5, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDesc: { flex: 1.8 },
  itemQty: { flex: 0.6 },
  itemRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  itemTotal: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 14 },
  totalLabel: { fontSize: 13, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  verifiedBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 13 },
  verifiedText: { fontSize: 12.5, fontWeight: '700' },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 11.5 },
  rowValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  notesTitle: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  notesText: { fontSize: 12, lineHeight: 17 },
  lineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderWidth: 1, borderRadius: 10, padding: 12 },
  lineBody: { flex: 1, minWidth: 0 },
  lineDesc: { fontSize: 12, fontWeight: '600' },
  lineCalc: { fontSize: 10.5, marginTop: 2 },
  lineTotal: { fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
