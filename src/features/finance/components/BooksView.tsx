import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBooksStore } from '../booksStore';
import { booksProjects, BookEntry } from '../booksData';
import { budgetCategories, BudgetCategory } from '../budgetCategories';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export const BooksView: React.FC = () => {
  const { theme } = useTheme();
  const { entries, addEntry, deleteEntry } = useBooksStore();
  const [search, setSearch] = useState('');
  const [selectedHead, setSelectedHead] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New voucher form state
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [head, setHead] = useState<BudgetCategory>(budgetCategories[0]);
  const [projectId, setProjectId] = useState(booksProjects[0].id);

  const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.payee.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.narration.toLowerCase().includes(search.toLowerCase()) ||
      e.reference.toLowerCase().includes(search.toLowerCase());
    const matchesHead = selectedHead === 'all' || e.head === selectedHead;
    return matchesSearch && matchesHead;
  });

  const handleAddVoucher = async () => {
    const numAmount = parseFloat(amount);
    if (!payee.trim() || isNaN(numAmount) || numAmount <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await addEntry({
      projectId,
      head,
      date: new Date().toISOString().slice(0, 10),
      payee: payee.trim(),
      reference: `REF-${Date.now().toString(36).toUpperCase()}`,
      narration: narration.trim() || 'Project expenditure voucher',
      amount: numAmount,
      source: 'manual',
    });

    setPayee('');
    setAmount('');
    setNarration('');
    setModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Books & Project Ledger
            </Text>
            <Text style={[styles.headerSub, { color: theme.colors.textSubtle }]}>
              {entries.length} vouchers recorded · Total: {formatRupees(totalSpent)}
            </Text>
          </View>
          <Button
            label="Record Voucher"
            onPress={() => setModalOpen(true)}
            size="sm"
            variant="emerald"
            icon="Plus"
          />
        </View>
      </View>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search vouchers by payee, reference, or narration..."
        filters={[
          { id: 'all', label: 'All Heads', count: entries.length },
          ...budgetCategories.map((cat) => ({
            id: cat,
            label: cat,
            count: entries.filter((e) => e.head === cat).length,
          })),
        ]}
        activeFilter={selectedHead}
        onFilterChange={setSelectedHead}
      />

      <View style={styles.list}>
        {filtered.map((entry) => {
          const project = booksProjects.find((p) => p.id === entry.projectId);
          return (
            <View
              key={entry.id}
              style={[
                styles.voucherCard,
                {
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
                  ...theme.shadows.card,
                },
              ]}
            >
              <View style={styles.voucherTop}>
                <View style={styles.voucherTitleCol}>
                  <Text style={[styles.payeeName, { color: theme.colors.text }]}>
                    {entry.payee}
                  </Text>
                  <Text style={[styles.voucherId, { color: theme.colors.brandPrimary }]}>
                    {entry.id} · Ref: {entry.reference}
                  </Text>
                </View>
                <Text style={[styles.amountText, { color: theme.colors.emerald }]}>
                  {formatRupees(entry.amount)}
                </Text>
              </View>

              <Text style={[styles.narration, { color: theme.colors.textMuted }]}>
                {entry.narration}
              </Text>

              <View style={styles.voucherFooter}>
                <Badge label={entry.head} tone="brand" size="sm" />
                <Text style={[styles.projectLocation, { color: theme.colors.textSubtle }]}>
                  {project?.name || entry.projectId} · {formatDate(entry.date)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* New Voucher Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.borderStrong,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Record Expenditure Voucher
              </Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Icon name="X" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.textSubtle }]}>PAYEE / VENDOR NAME</Text>
                <TextInput
                  value={payee}
                  onChangeText={setPayee}
                  placeholder="e.g. Apex Tooling Systems"
                  placeholderTextColor={theme.colors.textGhost}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.textSubtle }]}>AMOUNT (INR ₹)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 148500"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textGhost}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.textSubtle }]}>BUDGET COST HEAD</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {budgetCategories.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setHead(cat)}
                      style={[
                        styles.headChip,
                        {
                          backgroundColor: head === cat ? theme.colors.brandPrimary : theme.colors.surfaceMuted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.headChipText,
                          {
                            color: head === cat ? '#ffffff' : theme.colors.textMuted,
                            fontWeight: head === cat ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.textSubtle }]}>NARRATION & DETAIL</Text>
                <TextInput
                  value={narration}
                  onChangeText={setNarration}
                  placeholder="Reason for expenditure..."
                  placeholderTextColor={theme.colors.textGhost}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.textArea,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
              </View>

              <Button
                label="Save Voucher to Ledger"
                onPress={handleAddVoucher}
                size="lg"
                variant="emerald"
                style={{ marginTop: 10 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    gap: 12,
  },
  voucherCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  voucherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  voucherTitleCol: {
    flex: 1,
  },
  payeeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  voucherId: {
    fontSize: 11,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  narration: {
    fontSize: 12,
    lineHeight: 18,
  },
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 8,
    marginTop: 2,
  },
  projectLocation: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formContent: {
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  headChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headChipText: {
    fontSize: 11,
  },
});
