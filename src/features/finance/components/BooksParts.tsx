import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { TallySettings } from '../booksData';
import { DEFAULT_COST_CENTRE_KEY } from '../booksData';
import { budgetCategories, BudgetCategory } from '../budgetCategories';
import { formatRupees } from '../../../utils/formatCurrency';
import { SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { TextField } from '../../../components/ui/TextField';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

/**
 * Books Tally surfaces (web BooksView.tsx:105-107 + TallyImportPanel.tsx):
 * the integration card, the ledger-mapping setup sheet and the static import
 * panel (agreed scope — form/preview UI only, no XML parsing).
 */

export const TallyIntegrationCard: React.FC<{
  settings: TallySettings;
  importedCount: number;
  pendingCount: number;
  onImport: () => void;
  onSetup: () => void;
  onExportTally: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ settings, importedCount, pendingCount, onImport, onSetup, onExportTally, style }) => (
  <SectionCard
    title="Bring your Tally books here"
    description="Exchange vouchers with Tally without breaking your existing accounting workflow."
    action={<StatusChip status="XML exchange" tone="brand" dot={false} />}
    style={style}
  >
    <View style={styles.tallyRows}>
      <TallyRow label="Company" value={settings.company || 'Not configured'} />
      <TallyRow label="Connection" value="Manual import · no live sync" />
      <TallyRow label="Imported lines" value={`${importedCount} voucher lines`} />
      <TallyRow label="Last import" value="12 Aug 2026" />
    </View>
    <View style={styles.tallyButtons}>
      <Button label="Import from Tally" icon="Upload" variant="outline" size="sm" onPress={onImport} />
      <Button
        label={`Export ${pendingCount} new manual entries to Tally`}
        icon="Download"
        variant="emerald"
        size="sm"
        onPress={onExportTally}
      />
      <Button label="Manage ledger mappings" icon="Settings2" variant="ghost" size="sm" onPress={onSetup} />
    </View>
  </SectionCard>
);

const TallyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.tallyRow}>
      <Text style={[styles.tallyRowLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.tallyRowValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const COST_CENTRE_PLACEHOLDER = 'e.g. FIN-SKI-01 — PMKVY 4.0 Odisha Skills';

export const TallySetupSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  settings: TallySettings;
  costCentreKey: string;
  costCentreScope: string;
  onSave: (settings: TallySettings) => void;
}> = ({ visible, onClose, settings, costCentreKey, costCentreScope, onSave }) => {
  const { theme } = useTheme();
  const [company, setCompany] = useState(settings.company);
  const [bankLedger, setBankLedger] = useState(settings.bankLedger);
  const [costCategory, setCostCategory] = useState(settings.costCategory);
  const [centre, setCentre] = useState(settings.costCentres[costCentreKey] ?? settings.costCentres[DEFAULT_COST_CENTRE_KEY] ?? '');
  const [ledgers, setLedgers] = useState<Record<BudgetCategory, string>>(settings.ledgers);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setCompany(settings.company);
      setBankLedger(settings.bankLedger);
      setCostCategory(settings.costCategory);
      setCentre(settings.costCentres[costCentreKey] ?? settings.costCentres[DEFAULT_COST_CENTRE_KEY] ?? '');
      setLedgers(settings.ledgers);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, costCentreKey]);

  const handleSave = () => {
    if (!company.trim() || !costCategory.trim() || !centre.trim()) {
      setError('Complete all company, ledger and cost centre mappings.');
      return;
    }
    onSave({
      ...settings,
      company: company.trim(),
      bankLedger: bankLedger.trim(),
      costCategory: costCategory.trim(),
      ledgers,
      costCentres: { ...settings.costCentres, [costCentreKey]: centre.trim() },
    });
    onClose();
  };

  return (
    <View style={styles.formGap}>
      <Text style={[styles.formIntro, { color: theme.colors.textMuted }]}>
        Enter your Tally company and map its expense ledgers to budget heads. The project cost centre
        determines which expenditure is imported.
      </Text>
      <TextField label="Tally company" value={company} onChangeText={setCompany} placeholder="Pantiss Foundation HQ" />
      <TextField label="Payment bank / cash ledger" hint="Only used for the Tally export file" value={bankLedger} onChangeText={setBankLedger} />
      <TextField label="Cost category" value={costCategory} onChangeText={setCostCategory} placeholder="Primary Cost Category" />
      <TextField
        label={`Cost centre for ${costCentreScope}`}
        value={centre}
        onChangeText={setCentre}
        placeholder={COST_CENTRE_PLACEHOLDER}
      />
      <Text style={[styles.mappingTitle, { color: theme.colors.text }]}>Budget head → expense ledger</Text>
      <View style={styles.mappingList}>
        {budgetCategories.map((head) => (
          <TextField
            key={head}
            label={head}
            value={ledgers[head]}
            onChangeText={(value) => setLedgers((current) => ({ ...current, [head]: value }))}
          />
        ))}
      </View>
      <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>
        Company and expense ledgers apply across projects. Cost centre is saved for this scope. Use
        Import from Tally to upload a Day Book XML export into the project.
      </Text>
      {error ? <Text style={[styles.error, { color: theme.colors.dangerText }]}>{error}</Text> : null}
      <Button label="Save mappings" variant="emerald" onPress={handleSave} />
    </View>
  );
};

/** Static Tally import panel (agreed scope: drop-zone + preview mock, no XML parsing). */
export const TallyImportSheet: React.FC<{
  onClose: () => void;
  settings: TallySettings;
  projectName: string;
  costCentre: string;
  onNotify: (message: string) => void;
}> = ({ onClose, settings, projectName, costCentre, onNotify }) => {
  const { theme } = useTheme();
  const previewRows = [
    { date: '2026-09-14', voucher: 'VCH-90412', head: 'Equipment & materials', amount: 124600 },
    { date: '2026-09-21', voucher: 'VCH-90418', head: 'Travel & field operations', amount: 38400 },
    { date: '2026-09-28', voucher: 'VCH-90421', head: 'Programme activities', amount: 115900 },
  ];
  const previewTotal = previewRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <View style={styles.formGap}>
      <View style={[styles.routeRow, { backgroundColor: theme.colors.surfaceSoft }]}>
        <Text style={[styles.routeText, { color: theme.colors.text }]}>{settings.company || 'Set up company first'}</Text>
        <Icon name="ArrowDownLeft" size={13} color={theme.colors.textSubtle} />
        <Text style={[styles.routeText, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {costCentre || 'Map cost centre'}
        </Text>
        <Icon name="ArrowDownLeft" size={13} color={theme.colors.textSubtle} />
        <Text style={[styles.routeText, { color: theme.colors.text }]} numberOfLines={1}>{projectName}</Text>
      </View>
      <Text style={[styles.formIntro, { color: theme.colors.textMuted }]}>
        In Tally, export your Day Book for FY 2026–27 as XML (Data Interchange), including cost centre
        details and narrations. Upload the file to review paid expenditure for this project.
      </Text>
      <View style={[styles.dropZone, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surfaceSoft }]}>
        <Icon name="Upload" size={24} color={theme.colors.textSubtle} />
        <Text style={[styles.dropTitle, { color: theme.colors.text }]}>Choose Tally XML file</Text>
        <Text style={[styles.dropHint, { color: theme.colors.textSubtle }]}>Day Book · XML · up to 10 MB</Text>
        <Text style={[styles.dropDisabled, { color: theme.colors.textGhost }]}>File picker disabled in the demo build</Text>
      </View>
      <View style={[styles.previewSummary, { backgroundColor: theme.colors.surfaceSoft }]}>
        <Text style={[styles.previewSummaryTitle, { color: theme.colors.text }]}>
          {previewRows.length} expense lines ready · {formatRupees(previewTotal)}
        </Text>
        <Text style={[styles.previewSummarySub, { color: theme.colors.textMuted }]}>
          sample-daybook.xml · 3 vouchers scanned · 0 duplicates skipped · 0 vouchers excluded
        </Text>
      </View>
      <View style={[styles.previewTable, { borderColor: theme.colors.border }]}>
        <View style={[styles.previewHeadRow, { backgroundColor: theme.colors.surfaceSoft }]}>
          <Text style={[styles.previewHeadCell, { color: theme.colors.textMuted }]}>Date / voucher</Text>
          <Text style={[styles.previewHeadCell, { color: theme.colors.textMuted }]}>Budget head</Text>
          <Text style={[styles.previewHeadCellRight, { color: theme.colors.textMuted }]}>Amount</Text>
        </View>
        {previewRows.map((row) => (
          <View key={row.voucher} style={[styles.previewRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.previewDateCell}>
              <Text style={[styles.previewMain, { color: theme.colors.text }]}>{row.date}</Text>
              <Text style={[styles.previewSub, { color: theme.colors.textSubtle }]}>{row.voucher}</Text>
            </View>
            <Text style={[styles.previewMain, { color: theme.colors.text }]} numberOfLines={1}>{row.head}</Text>
            <Text style={[styles.previewAmount, { color: theme.colors.text }]}>{formatRupees(row.amount)}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>
        File import works without sharing your Tally password. Only Payment vouchers with mapped INR
        expense allocations are supported. This is not a live account connection.
      </Text>
      <Button
        label={`Import ${previewRows.length} expense lines`}
        variant="emerald"
        onPress={() => {
          onNotify(`${previewRows.length} expense lines imported from Tally into ${projectName} (demo import — no XML parsed).`);
          onClose();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formGap: { gap: 14 },
  tallyRows: { gap: 0 },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 144, 168, 0.16)',
  },
  tallyRowLabel: { fontSize: 11.5 },
  tallyRowValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  tallyButtons: { gap: 8, marginTop: 12 },
  formIntro: { fontSize: 12.5, lineHeight: 18 },
  mappingTitle: { fontSize: 13.5, fontWeight: '600' },
  mappingList: { gap: 12 },
  footnote: { fontSize: 11, lineHeight: 15 },
  error: { fontSize: 11.5, fontWeight: '500' },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  routeText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  dropZone: {
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    opacity: 0.9,
  },
  dropTitle: { fontSize: 13.5, fontWeight: '600', marginTop: 4 },
  dropHint: { fontSize: 11.5 },
  dropDisabled: { fontSize: 10.5, marginTop: 4 },
  previewSummary: { borderRadius: 12, padding: 13, gap: 3 },
  previewSummaryTitle: { fontSize: 13, fontWeight: '700' },
  previewSummarySub: { fontSize: 11 },
  previewTable: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  previewHeadRow: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 144, 168, 0.16)',
  },
  previewHeadCell: { flex: 1.4, fontSize: 10.5, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewHeadCellRight: { flex: 0.8, fontSize: 10.5, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewDateCell: { flex: 1.4, gap: 1 },
  previewMain: { fontSize: 12.5, fontWeight: '600', flex: 0.8 },
  previewSub: { fontSize: 10.5 },
  previewAmount: { flex: 0.8, fontSize: 12.5, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'right' },
});
