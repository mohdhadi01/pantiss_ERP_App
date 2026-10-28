import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

interface TaxFiling {
  id: string;
  type: 'GST (GSTR-3B)' | 'GST (GSTR-1)' | 'TDS (Form 26Q)' | 'TDS (Form 24Q)';
  period: string;
  dueDate: string;
  taxableValue: number;
  taxAmount: number;
  status: 'Filed & Cleared' | 'Due Soon' | 'Pending Filing';
  arnNumber?: string;
  filedDate?: string;
  itcClaimed?: number;
  cashPaid?: number;
}

const initialFilings: TaxFiling[] = [
  { id: 'TAX-01', type: 'GST (GSTR-3B)', period: 'September 2026', dueDate: '2026-10-20', taxableValue: 8450000, taxAmount: 1521000, status: 'Filed & Cleared', arnNumber: 'AA210926001842P', filedDate: '2026-10-18', itcClaimed: 482000, cashPaid: 1039000 },
  { id: 'TAX-02', type: 'GST (GSTR-1)', period: 'September 2026', dueDate: '2026-10-11', taxableValue: 8450000, taxAmount: 1521000, status: 'Filed & Cleared', arnNumber: 'AA210926001290K', filedDate: '2026-10-09', itcClaimed: 0, cashPaid: 0 },
  { id: 'TAX-03', type: 'TDS (Form 26Q)', period: 'Q2 FY 2026–27', dueDate: '2026-10-31', taxableValue: 12400000, taxAmount: 894000, status: 'Due Soon' },
  { id: 'TAX-04', type: 'TDS (Form 24Q)', period: 'Q2 FY 2026–27', dueDate: '2026-10-31', taxableValue: 24500000, taxAmount: 2140000, status: 'Due Soon' },
];

const CHALLANS = [
  { id: 'CHN-2026-Q2-01', month: 'Jul 2026', section: '194C — Contractors', bsr: '0510402', challanNo: '00291', tender: '2026-08-05', amount: 214000, status: 'Paid' },
  { id: 'CHN-2026-Q2-02', month: 'Aug 2026', section: '194J — Professional fees', bsr: '0510402', challanNo: '00314', tender: '2026-09-07', amount: 168000, status: 'Paid' },
  { id: 'CHN-2026-Q2-03', month: 'Sep 2026', section: '192 — Salaries TDS', bsr: '0510402', challanNo: '00362', tender: '2026-10-07', amount: 512000, status: 'Paid' },
  { id: 'CHN-2026-Q2-04', month: 'Sep 2026', section: '194I — Rent on land & building', bsr: '0510402', challanNo: '00361', tender: '2026-10-06', amount: 96000, status: 'Pending' },
];

const ITC_ROWS = [
  { head: 'GST paid on inputs — lab & IT consumables', period: 'Sep 2026', claimed: 482000, proposed: 0, status: 'Claimed' },
  { head: 'Input services — logistics, rent & utilities', period: 'Sep 2026', claimed: 186000, proposed: 24000, status: 'Partially claimed' },
  { head: 'Blocked credits — staff welfare & canteen', period: 'FY 2025–26', claimed: 0, proposed: 31500, status: 'Under review' },
];

const CHALLAN_COLUMNS: Array<DataColumn<(typeof CHALLANS)[number]>> = [
  { key: 'id', label: 'Challan ID & Month', flex: 1.6 },
  { key: 'section', label: 'Withholding Section', flex: 1.6 },
  { key: 'bsr', label: 'BSR Code', flex: 1, wideOnly: true },
  { key: 'challanNo', label: 'Challan No.', flex: 0.9, wideOnly: true },
  { key: 'tender', label: 'Tender Date', flex: 1, wideOnly: true },
  { key: 'amount', label: 'TDS Amount', flex: 1.1, align: 'right' },
  { key: 'status', label: 'Status', flex: 0.9 },
];

const ITC_COLUMNS: Array<DataColumn<(typeof ITC_ROWS)[number]>> = [
  { key: 'head', label: 'Credit head', flex: 2.2 },
  { key: 'period', label: 'Period', flex: 1, wideOnly: true },
  { key: 'claimed', label: 'ITC Claimed', flex: 1.1, align: 'right' },
  { key: 'proposed', label: 'Proposed', flex: 1.1, align: 'right', wideOnly: true },
  { key: 'status', label: 'Status', flex: 1.2 },
];

const itcTone = (status: string): 'success' | 'warning' | 'info' =>
  (status === 'Claimed' ? 'success' : status === 'Partially claimed' ? 'warning' : 'info');

export const TaxationView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [filings, setFilings] = useState(initialFilings);
  const [tab, setTab] = useState('gst');
  const [updateFiling, setUpdateFiling] = useState<TaxFiling | null>(null);
  const [filedDate, setFiledDate] = useState('');
  const [arnRef, setArnRef] = useState('');

  const gstFilings = useMemo(() => filings.filter((f) => f.type.startsWith('GST')), [filings]);
  const tdsFilings = useMemo(() => filings.filter((f) => f.type.startsWith('TDS')), [filings]);
  const filedCount = gstFilings.filter((f) => f.status === 'Filed & Cleared').length;
  const pendingCount = gstFilings.length - filedCount;

  const tdsStats = useMemo(() => {
    const deducted = tdsFilings.reduce((sum, f) => sum + f.taxAmount, 0);
    const deposited = CHALLANS.filter((c) => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
    const payable = CHALLANS.filter((c) => c.status !== 'Paid').reduce((sum, c) => sum + c.amount, 0);
    return { deducted, deposited, payable };
  }, [tdsFilings]);

  const handleSaveFiling = () => {
    if (!updateFiling) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFilings((prev) =>
      prev.map((f) =>
        f.id === updateFiling.id
          ? { ...f, status: 'Filed & Cleared' as const, filedDate: filedDate || new Date().toISOString().slice(0, 10), arnNumber: arnRef.trim() || f.arnNumber }
          : f,
      ),
    );
    setUpdateFiling(null);
    setArnRef('');
  };

  const renderGstCell = (filing: TaxFiling, col: DataColumn<TaxFiling>) => {
    switch (col.key) {
      case 'type':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{filing.type}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Pantiss Foundation</Text>
          </View>
        );
      case 'period':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{filing.period}</Text>;
      case 'due':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(filing.dueDate)}</Text>;
      case 'filed':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{filing.filedDate ? formatDate(filing.filedDate) : '—'}</Text>;
      case 'arn':
        return <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>{filing.arnNumber ?? '—'}</Text>;
      case 'turnover':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(filing.taxableValue)}</Text>;
      case 'itc':
        return <Text style={[styles.numText, { color: theme.colors.infoText }]}>{formatRupees(filing.itcClaimed ?? 0)}</Text>;
      case 'cash':
        return <Text style={[styles.numText, { color: theme.colors.financeAccent }]}>{formatRupees(filing.cashPaid ?? 0)}</Text>;
      case 'status':
        return <StatusChip status={filing.status} />;
      case 'action':
        return (
          <Pressable
            onPress={() => {
              setUpdateFiling(filing);
              setFiledDate(filing.filedDate ?? new Date().toISOString().slice(0, 10));
              setArnRef(filing.arnNumber ?? '');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Update filing ${filing.id}`}
          >
            <Text style={[styles.linkText, { color: theme.colors.brandPrimary }]}>Update filing</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  const GST_COLUMNS: Array<DataColumn<TaxFiling>> = [
    { key: 'type', label: 'Return Type', flex: 1.5 },
    { key: 'period', label: 'Period', flex: 1.2 },
    { key: 'due', label: 'Due Date', flex: 1, wideOnly: true },
    { key: 'filed', label: 'Filed Date', flex: 1, wideOnly: true },
    { key: 'arn', label: 'ARN Reference', flex: 1.5, wideOnly: true },
    { key: 'turnover', label: 'Taxable Turnover', flex: 1.2, align: 'right', wideOnly: true },
    { key: 'itc', label: 'ITC Claimed', flex: 1, align: 'right', wideOnly: true },
    { key: 'cash', label: 'Cash Paid', flex: 1, align: 'right' },
    { key: 'status', label: 'Status', flex: 1.1 },
    { key: 'action', label: '', flex: 0.9, align: 'right' },
  ];

  return (
    <View style={styles.container}>
      <Card padding={20}>
        <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>Taxation monitor</Text>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Filings, credits &amp; tax deducted</Text>
        <Text style={[styles.pageNote, { color: theme.colors.textMuted }]}>
          Sample records · FY 2026–27, plus the prior-year annual GST return.
        </Text>
      </Card>

      <View style={styles.summaryRow}>
        <SummaryTile icon="Scale" iconColor={theme.colors.brandPrimary} value="₹15.21 L" detail="GST cash paid · September 2026 returns" />
        <SummaryTile icon="CheckCircle" iconColor={theme.colors.emerald} value="₹48.2 L" detail="ITC available · GSTR-2B reconciled" />
        <SummaryTile icon="BadgeIndianRupee" iconColor={theme.colors.violet} value="₹30.3 L" detail="TDS deducted · Challan ITNS-281" />
      </View>

      <Tabs
        items={[
          { key: 'gst', label: 'GST filing' },
          { key: 'itc', label: 'Input tax credit tracking' },
          { key: 'tds', label: 'TDS filing (total)' },
        ]}
        activeKey={tab}
        onChange={setTab}
        accent={theme.colors.brandPrimary}
      />

      {tab === 'gst' ? (
        <SectionCard
          title="GST register"
          action={
            <View style={[styles.headBadge, { backgroundColor: theme.colors.financeAccentSoft }]}>
              <Text style={[styles.headBadgeText, { color: theme.colors.financeAccent }]}>{filedCount} filed · {pendingCount} pending</Text>
            </View>
          }
        >
          <Text style={[styles.gstinLine, { color: theme.colors.textMuted }]}>
            Pantiss Foundation · <Text style={{ color: theme.colors.text }}>GSTIN: 21AAATP1049M1Z3</Text> (Odisha Jurisdiction)
          </Text>
          <DataTable
            columns={GST_COLUMNS}
            rows={gstFilings}
            keyExtractor={(f) => f.id}
            renderCell={renderGstCell}
            emptyIcon="Scale"
            emptyTitle="No GST filings"
            emptyDescription="Statutory GST returns will appear here once recorded."
          />
        </SectionCard>
      ) : null}

      {tab === 'itc' ? (
        <SectionCard title="Input tax credit tracking" description="Credit claimed versus proposed credit, with blocked-credit flags.">
          <DataTable
            columns={ITC_COLUMNS}
            rows={ITC_ROWS}
            keyExtractor={(row) => row.head}
            renderCell={(row, col) => {
              switch (col.key) {
                case 'head':
                  return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{row.head}</Text>;
                case 'period':
                  return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{row.period}</Text>;
                case 'claimed':
                  return <Text style={[styles.numText, { color: theme.colors.emerald }]}>{formatRupees(row.claimed)}</Text>;
                case 'proposed':
                  return <Text style={[styles.numText, { color: theme.colors.warningText }]}>{formatRupees(row.proposed)}</Text>;
                case 'status':
                  return <StatusChip status={row.status} tone={itcTone(row.status)} />;
                default:
                  return null;
              }
            }}
            emptyIcon="CheckCircle"
            emptyTitle="No credit entries"
          />
        </SectionCard>
      ) : null}

      {tab === 'tds' ? (
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <SummaryTile icon="BadgeIndianRupee" iconColor={theme.colors.brandPrimary} value={formatRupees(tdsStats.deducted)} detail="Deducted in Q2 FY 2026–27" />
            <SummaryTile icon="CheckCircle" iconColor={theme.colors.emerald} value={formatRupees(tdsStats.deposited)} detail="Deposited via challans" />
            <SummaryTile icon="Clock" iconColor={theme.colors.warning} value={formatRupees(tdsStats.payable)} detail="Balance payable" />
          </View>

          <SectionCard
            title="Return-filing status · Q2 FY 2026–27"
            action={<View style={[styles.headBadge, { backgroundColor: theme.colors.infoSoft }]}><Text style={[styles.headBadgeText, { color: theme.colors.infoText }]}>TAN: BBNP10928M</Text></View>}
          >
            <View style={[styles.returnRow, isMd && styles.returnRowWide]}>
              {tdsFilings.map((filing) => (
                <Card key={filing.id} padding={16} flat style={styles.returnCard}>
                  <View style={styles.returnTop}>
                    <Text style={[styles.cellMain, { color: theme.colors.text }]}>{filing.type}</Text>
                    <StatusChip status={filing.status} />
                  </View>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>
                    {filing.type.includes('24Q') ? 'Salaries' : 'Non-salary'} · Due {formatDate(filing.dueDate)}
                  </Text>
                  <Text style={[styles.numText, { color: theme.colors.financeAccent, marginTop: 6 }]}>{formatRupees(filing.taxAmount)}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Tax deducted</Text>
                </Card>
              ))}
            </View>
          </SectionCard>

          <SectionCard title="TDS challans" description="Quarterly challan deposit register.">
            <DataTable
              columns={CHALLAN_COLUMNS}
              rows={CHALLANS}
              keyExtractor={(c) => c.id}
              renderCell={(c, col) => {
                switch (col.key) {
                  case 'id':
                    return (
                      <View>
                        <Text style={[styles.cellMain, { color: theme.colors.text }]}>{c.id}</Text>
                        <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{c.month}</Text>
                      </View>
                    );
                  case 'section':
                    return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{c.section}</Text>;
                  case 'bsr':
                    return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{c.bsr}</Text>;
                  case 'challanNo':
                    return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{c.challanNo}</Text>;
                  case 'tender':
                    return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{formatDate(c.tender)}</Text>;
                  case 'amount':
                    return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(c.amount)}</Text>;
                  case 'status':
                    return <StatusChip status={c.status} />;
                  default:
                    return null;
                }
              }}
              emptyIcon="BadgeIndianRupee"
              emptyTitle="No challans"
            />
          </SectionCard>
        </View>
      ) : null}

      <ModalSheet
        visible={Boolean(updateFiling)}
        onClose={() => setUpdateFiling(null)}
        label="GST register"
        title="Update filing & upload document"
        description={updateFiling ? `${updateFiling.type} · ${updateFiling.period}` : undefined}
        size="sm"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setUpdateFiling(null)} />
            <Button label="Save as filed" variant="emerald" onPress={handleSaveFiling} />
          </>
        }
      >
        {updateFiling ? (
          <>
            <TextField label="Filed date" value={filedDate} onChangeText={setFiledDate} placeholder="YYYY-MM-DD" />
            <TextField label="Acknowledgement reference (ARN)" value={arnRef} onChangeText={setArnRef} placeholder="AA210926001842P" autoCapitalize="characters" />
            <View style={[styles.docChip, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <Icon name="FileCheck2" size={15} color={theme.colors.brandPrimary} />
              <Text style={[styles.docChipText, { color: theme.colors.text }]}>{updateFiling.type.replace(/[()]/g, '')}_return.pdf</Text>
              <StatusChip status="Attached" tone="info" dot={false} />
            </View>
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const SummaryTile: React.FC<{ icon: string; iconColor: string; value: string; detail: string }> = ({ icon, iconColor, value, detail }) => {
  const { theme } = useTheme();
  return (
    <Card padding={16} style={styles.summaryTile}>
      <View style={[styles.summaryIcon, { backgroundColor: `${iconColor}1A` }]}>
        <Icon name={icon} size={17} color={iconColor} strokeWidth={1.8} />
      </View>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryDetail, { color: theme.colors.textMuted }]}>{detail}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, marginTop: 4 },
  pageNote: { fontSize: 12, marginTop: 4 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryTile: { flexGrow: 1, flexBasis: 200, gap: 8 },
  summaryIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  summaryDetail: { fontSize: 11, lineHeight: 15 },
  section: { gap: 14 },
  headBadge: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  headBadgeText: { fontSize: 10.5, fontWeight: '700' },
  gstinLine: { fontSize: 12, marginBottom: 12 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  numText: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  linkText: { fontSize: 12, fontWeight: '600' },
  returnRow: { gap: 12 },
  returnRowWide: { flexDirection: 'row' },
  returnCard: { flexGrow: 1, flexBasis: 220, gap: 7 },
  returnTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  docChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  docChipText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
});
