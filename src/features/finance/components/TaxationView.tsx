import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees, formatCurrency } from '../../../utils/formatCurrency';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

// ─── Web TaxationView.tsx:35-90 — GST return register ─────────────────────────
interface GstRecord {
  period: string;
  returnType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9';
  dueDate: string;
  filedDate?: string;
  arn?: string;
  turnover: number;
  taxLiability: number;
  itcClaimed: number;
  netPaidCash: number;
  status: 'Filed' | 'Filed on Time' | 'Upcoming' | 'Action Required';
}

const INITIAL_GST: GstRecord[] = [
  { period: 'August 2026', returnType: 'GSTR-3B', dueDate: '20 Sep 2026', filedDate: '18 Sep 2026', arn: 'AA2108260018491', turnover: 98.4, taxLiability: 12.4, itcClaimed: 7.58, netPaidCash: 4.82, status: 'Filed on Time' },
  { period: 'August 2026', returnType: 'GSTR-1', dueDate: '11 Sep 2026', filedDate: '09 Sep 2026', arn: 'AA2108260009182', turnover: 98.4, taxLiability: 12.4, itcClaimed: 0, netPaidCash: 0, status: 'Filed on Time' },
  { period: 'September 2026', returnType: 'GSTR-1', dueDate: '11 Oct 2026', turnover: 104.2, taxLiability: 13.8, itcClaimed: 8.1, netPaidCash: 5.7, status: 'Upcoming' },
  { period: 'September 2026', returnType: 'GSTR-3B', dueDate: '20 Oct 2026', turnover: 104.2, taxLiability: 13.8, itcClaimed: 8.1, netPaidCash: 5.7, status: 'Upcoming' },
  { period: 'FY 2025-26', returnType: 'GSTR-9', dueDate: '31 Dec 2026', turnover: 1140.0, taxLiability: 142.0, itcClaimed: 89.0, netPaidCash: 53.0, status: 'Upcoming' },
];

// ─── Web tdsChallans (92-148) ──────────────────────────────────────────────────
const CHALLANS = [
  { id: 'CHL-2026-081', month: 'August 2026', section: '194C (Contractors)', amount: 148500, bsr: '0001042', challanNo: '09182', tender: '07 Sep 2026', status: 'Paid & Reconciled' },
  { id: 'CHL-2026-082', month: 'August 2026', section: '194J (Professionals)', amount: 224000, bsr: '0001042', challanNo: '09183', tender: '07 Sep 2026', status: 'Paid & Reconciled' },
  { id: 'CHL-2026-083', month: 'August 2026', section: '192 (Salaries)', amount: 270000, bsr: '0001042', challanNo: '09184', tender: '07 Sep 2026', status: 'Paid & Reconciled' },
  { id: 'CHL-2026-091', month: 'September 2026', section: '194C (Contractors)', amount: 162000, bsr: '0001042', challanNo: 'Pending', tender: 'Due 07 Oct 2026', status: 'Scheduled' },
  { id: 'CHL-2026-092', month: 'September 2026', section: '194J (Professionals)', amount: 215000, bsr: '0001042', challanNo: 'Pending', tender: 'Due 07 Oct 2026', status: 'Scheduled' },
];

type UpdateTarget = { kind: 'gst'; record: GstRecord } | { kind: 'tds'; form: '24Q' | '26Q' };

const CHALLAN_COLUMNS: Array<DataColumn<(typeof CHALLANS)[number]>> = [
  { key: 'id', label: 'Challan ID & Month', flex: 1.6 },
  { key: 'section', label: 'Withholding Section', flex: 1.6 },
  { key: 'bsr', label: 'BSR Code', flex: 1, wideOnly: true },
  { key: 'challanNo', label: 'Challan No.', flex: 0.9, wideOnly: true },
  { key: 'tender', label: 'Tender Date', flex: 1.1, wideOnly: true },
  { key: 'amount', label: 'TDS Amount', flex: 1.1, align: 'right' },
  { key: 'status', label: 'Status', flex: 1.1 },
];

const ITC_COLUMNS: Array<DataColumn<GstRecord>> = [
  { key: 'period', label: 'Period', flex: 1.1 },
  { key: 'claimed', label: 'Claimed ITC', flex: 1, align: 'right' },
  { key: 'proposed', label: 'Proposed ITC', flex: 1, align: 'right', wideOnly: true },
  { key: 'claimStatus', label: 'Claim status', flex: 1.3, wideOnly: true },
  { key: 'recon', label: 'GSTR-2B reconciliation', flex: 1.4 },
];

export const TaxationView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [gstRecords, setGstRecords] = useState(INITIAL_GST);
  const [tdsForms, setTdsForms] = useState<Record<'24Q' | '26Q', { reference: string; filedDate: string } | undefined>>({ '24Q': undefined, '26Q': undefined });
  const [tab, setTab] = useState('gst');
  const [target, setTarget] = useState<UpdateTarget | null>(null);
  const [filedDate, setFiledDate] = useState('');
  const [arnRef, setArnRef] = useState('');

  const filedRecords = gstRecords.filter((r) => r.filedDate);
  const creditRecords = useMemo(() => gstRecords.filter((r) => r.returnType === 'GSTR-3B'), [gstRecords]);
  const claimedCredit = creditRecords.reduce((total, r) => total + (r.filedDate ? r.itcClaimed : 0), 0);
  const pendingCredit = creditRecords.reduce((total, r) => total + (!r.filedDate ? r.itcClaimed : 0), 0);
  const totalTds = CHALLANS.reduce((total, c) => total + c.amount, 0);
  const paidTds = CHALLANS.reduce((total, c) => total + (c.status === 'Paid & Reconciled' ? c.amount : 0), 0);
  const tdsFormsFiled = Object.values(tdsForms).filter(Boolean).length;

  const openUpdate = (next: UpdateTarget) => {
    Haptics.selectionAsync().catch(() => {});
    setFiledDate(next.kind === 'gst' ? next.record.filedDate ?? '' : tdsForms[next.form]?.filedDate ?? '');
    setArnRef(next.kind === 'gst' ? next.record.arn ?? '' : tdsForms[next.form]?.reference ?? '');
    setTarget(next);
  };

  const handleSaveFiling = () => {
    if (!target) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const date = filedDate || new Date().toISOString().slice(0, 10);
    const reference = arnRef.trim() || 'Not available';
    if (target.kind === 'gst') {
      setGstRecords((prev) => prev.map((r) => (r === target.record ? { ...r, filedDate: date, arn: reference, status: 'Filed' as const } : r)));
    } else {
      setTdsForms((prev) => ({ ...prev, [target.form]: { reference, filedDate: date } }));
    }
    setTarget(null);
    setArnRef('');
  };

  const targetTitle = target
    ? target.kind === 'gst'
      ? `${target.record.returnType} · ${target.record.period}`
      : `Form ${target.form} · Q2 FY 2026–27`
    : '';
  const targetFileName = target
    ? target.kind === 'gst'
      ? `${target.record.returnType}_${target.record.period.toLowerCase().replace(/[\s–]+/g, '-')}_acknowledgement.pdf`
      : `Form-${target.form}_Q2-FY-2026-27_acknowledgement.pdf`
    : '';

  const renderGstCell = (record: GstRecord, col: DataColumn<GstRecord>) => {
    switch (col.key) {
      case 'type':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{record.returnType}</Text>;
      case 'period':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{record.period}</Text>;
      case 'due':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{record.dueDate}</Text>;
      case 'filed':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{record.filedDate ?? '—'}</Text>;
      case 'arn':
        return <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>{record.arn ?? '—'}</Text>;
      case 'turnover':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(record.turnover, true)}</Text>;
      case 'itc':
        return <Text style={[styles.numText, { color: theme.colors.emerald }]}>{record.returnType === 'GSTR-3B' && record.filedDate ? formatCurrency(record.itcClaimed, true) : '—'}</Text>;
      case 'cash':
        return <Text style={[styles.numText, { color: theme.colors.financeAccent }]}>{record.returnType === 'GSTR-3B' && record.filedDate ? formatCurrency(record.netPaidCash, true) : '—'}</Text>;
      case 'status':
        return <StatusChip status={record.filedDate ? 'Filed' : record.status} tone={record.filedDate ? 'success' : 'info'} />;
      case 'action':
        return (
          <Pressable onPress={() => openUpdate({ kind: 'gst', record })} accessibilityRole="button" accessibilityLabel={`Update filing ${record.returnType} ${record.period}`}>
            <Text style={[styles.linkText, { color: theme.colors.brandPrimary }]}>{record.filedDate ? 'Edit filing' : 'Update filing / upload'}</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  const GST_COLUMNS: Array<DataColumn<GstRecord>> = [
    { key: 'type', label: 'Return Type', flex: 1.2 },
    { key: 'period', label: 'Period', flex: 1.1 },
    { key: 'due', label: 'Due Date', flex: 1, wideOnly: true },
    { key: 'filed', label: 'Filed Date', flex: 1, wideOnly: true },
    { key: 'arn', label: 'ARN Reference', flex: 1.4, wideOnly: true },
    { key: 'turnover', label: 'Taxable Turnover', flex: 1.1, align: 'right', wideOnly: true },
    { key: 'itc', label: 'ITC Claimed', flex: 1, align: 'right', wideOnly: true },
    { key: 'cash', label: 'Cash Paid', flex: 1, align: 'right' },
    { key: 'status', label: 'Status', flex: 1 },
    { key: 'action', label: 'Filing & document', flex: 1.1, align: 'right' },
  ];

  return (
    <View style={styles.container}>
      <Card padding={20}>
        <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>Taxation monitor</Text>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Filings, credits &amp; tax deducted</Text>
        <Text style={[styles.pageNote, { color: theme.colors.textMuted }]}>
          Monitor GST filing, track input tax credit, and review total TDS with payment and return-filing status in one place.
        </Text>
        <Text style={[styles.pageSubNote, { color: theme.colors.textSubtle }]}>
          Sample records · FY 2026–27, plus the prior-year annual GST return
        </Text>
      </Card>

      <View style={styles.summaryRow}>
        <SummaryTile icon="Scale" iconColor={theme.colors.brandPrimary} label="GST filing" value={`${filedRecords.length} / ${gstRecords.length} filed`} detail={`${gstRecords.length - filedRecords.length} returns awaiting filing · All listed periods`} />
        <SummaryTile icon="Receipt" iconColor={theme.colors.emerald} label="Input tax credit tracking" value={formatCurrency(claimedCredit, true)} detail={`${formatCurrency(pendingCredit, true)} proposed · Monthly GSTR-3B records`} />
        <SummaryTile icon="CreditCard" iconColor={theme.colors.violet} label="TDS filing (total)" value={formatRupees(totalTds)} detail={`${formatRupees(paidTds)} paid · ${formatRupees(totalTds - paidTds)} scheduled`} />
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
          title="GST filing register"
          description="Pantiss Foundation · GSTIN: 21AAATP1049M1Z3 (Odisha Jurisdiction)"
          action={
            <View style={[styles.headBadge, { backgroundColor: theme.colors.emeraldSoft }]}>
              <Text style={[styles.headBadgeText, { color: theme.colors.emerald }]}>{filedRecords.length} filed · {gstRecords.length - filedRecords.length} pending</Text>
            </View>
          }
        >
          <DataTable
            columns={GST_COLUMNS}
            rows={gstRecords}
            keyExtractor={(r) => `${r.returnType}-${r.period}`}
            renderCell={renderGstCell}
            emptyIcon="Scale"
            emptyTitle="No GST filings"
            emptyDescription="Statutory GST returns will appear here once recorded."
          />
        </SectionCard>
      ) : null}

      {tab === 'itc' ? (
        <SectionCard
          title="Input tax credit tracking"
          description="Monthly GSTR-3B credits, separated into claimed and proposed amounts. Annual returns and GSTR-1 are excluded from credit totals to avoid double counting."
        >
          <DataTable
            columns={ITC_COLUMNS}
            rows={creditRecords}
            keyExtractor={(r) => r.period}
            renderCell={(record, col) => {
              switch (col.key) {
                case 'period':
                  return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{record.period}</Text>;
                case 'claimed':
                  return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(record.filedDate ? record.itcClaimed : 0, true)}</Text>;
                case 'proposed':
                  return <Text style={[styles.numText, { color: theme.colors.warningText }]}>{formatCurrency(record.filedDate ? 0 : record.itcClaimed, true)}</Text>;
                case 'claimStatus':
                  return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{record.filedDate ? 'Claimed in filed return' : 'Not yet claimed'}</Text>;
                case 'recon':
                  return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>Awaiting reconciliation data</Text>;
                default:
                  return null;
              }
            }}
            emptyIcon="CheckCircle"
            emptyTitle="No credit entries"
          />
          <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>Total</Text>
            <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(claimedCredit, true)}</Text>
            <Text style={[styles.numText, { color: theme.colors.text }]}>{formatCurrency(pendingCredit, true)}</Text>
          </View>
          <View style={[styles.explainer, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[styles.explainerText, { color: theme.colors.textMuted }]}>
              Invoice-level matching, eligible credit and mismatches are awaiting purchase-register and GSTR-2B data.
            </Text>
          </View>
        </SectionCard>
      ) : null}

      {tab === 'tds' ? (
        <View style={styles.section}>
          <SectionCard
            title="TDS filing (total)"
            description="TAN: BBNP10928M · Remitted directly through State Bank of India"
            action={<Text style={[styles.returnCount, { color: theme.colors.textSubtle }]}>{tdsFormsFiled} / 2 returns filed</Text>}
          >
            <View style={styles.tdsTileRow}>
              <TdsTile label="Total TDS in register" value={formatRupees(totalTds)} />
              <TdsTile label="Paid & reconciled" value={formatRupees(paidTds)} />
              <TdsTile label="Scheduled payment" value={formatRupees(totalTds - paidTds)} />
            </View>

            <Text style={[styles.tdsHeading, { color: theme.colors.text }]}>Return-filing status · Q2 FY 2026–27</Text>
            <Text style={[styles.tdsExplainer, { color: theme.colors.textMuted }]}>
              Totals cover the August and September challans listed below. July data has not been provided. Update each return with its filing acknowledgement.
            </Text>
            <View style={[styles.returnRow, isMd && styles.returnRowWide]}>
              {(['24Q', '26Q'] as const).map((form) => {
                const records = CHALLANS.filter((c) => (form === '24Q' ? c.section === '192 (Salaries)' : c.section !== '192 (Salaries)'));
                const filing = tdsForms[form];
                return (
                  <Card key={form} padding={16} flat style={styles.returnCard}>
                    <Text style={[styles.cellMain, { color: theme.colors.text }]}>Form {form} · {form === '24Q' ? 'Salaries' : 'Non-salary'}</Text>
                    <Text style={[styles.returnAmount, { color: theme.colors.text }]}>{formatRupees(records.reduce((sum, c) => sum + c.amount, 0))}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>Filing status: {filing ? 'Filed' : 'Not verified'}</Text>
                    <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Acknowledgement: {filing?.reference ?? 'Not available'}</Text>
                    {filing ? <Text style={[styles.cellSub, { color: theme.colors.textMuted }]}>Filed on {filing.filedDate}</Text> : null}
                    <Button
                      label={filing ? 'Edit filing' : 'Update filing / upload'}
                      variant="outline"
                      size="sm"
                      onPress={() => openUpdate({ kind: 'tds', form })}
                      style={styles.returnBtn}
                    />
                  </Card>
                );
              })}
            </View>
          </SectionCard>

          <SectionCard title="Supporting challan register" description="Quarterly challan deposit register.">
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
                    return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{c.tender}</Text>;
                  case 'amount':
                    return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(c.amount)}</Text>;
                  case 'status':
                    return <StatusChip status={c.status} tone={c.status === 'Paid & Reconciled' ? 'success' : 'warning'} />;
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
        visible={Boolean(target)}
        onClose={() => setTarget(null)}
        label="Filing & document"
        title="Update filing & upload document"
        description={targetTitle}
        size="sm"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setTarget(null)} />
            <Button label="Save as filed" variant="emerald" onPress={handleSaveFiling} />
          </>
        }
      >
        {target ? (
          <>
            <TextField label="Filed date" value={filedDate} onChangeText={setFiledDate} placeholder="YYYY-MM-DD" />
            <TextField label="Acknowledgement reference (ARN)" value={arnRef} onChangeText={setArnRef} placeholder="AA210926001842P" autoCapitalize="characters" />
            <View style={[styles.docChip, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <Icon name="FileCheck2" size={15} color={theme.colors.brandPrimary} />
              <View style={styles.docChipBody}>
                <Text style={[styles.docChipLabel, { color: theme.colors.textSubtle }]}>Filing acknowledgement document</Text>
                <Text numberOfLines={1} style={[styles.docChipText, { color: theme.colors.text }]}>{targetFileName}</Text>
              </View>
              <StatusChip status="Attached" tone="info" dot={false} />
            </View>
            <Text style={[styles.modalNote, { color: theme.colors.textMuted }]}>
              Saving updates this return to Filed with the acknowledgement reference above — a static demo document is attached for parity.
            </Text>
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const SummaryTile: React.FC<{ icon: string; iconColor: string; label: string; value: string; detail: string }> = ({ icon, iconColor, label, value, detail }) => {
  const { theme } = useTheme();
  return (
    <Card padding={16} style={styles.summaryTile}>
      <View style={styles.summaryHead}>
        <View style={[styles.summaryIcon, { backgroundColor: `${iconColor}1A` }]}>
          <Icon name={icon} size={17} color={iconColor} strokeWidth={1.8} />
        </View>
        <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      </View>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryDetail, { color: theme.colors.textSubtle }]}>{detail}</Text>
    </Card>
  );
};

const TdsTile: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.tdsTile, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.tdsTileLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.tdsTileValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, marginTop: 4 },
  pageNote: { fontSize: 12.5, lineHeight: 18, marginTop: 6 },
  pageSubNote: { fontSize: 11, marginTop: 8 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryTile: { flexGrow: 1, flexBasis: 220, gap: 8 },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: '500', flex: 1, minWidth: 0 },
  summaryValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  summaryDetail: { fontSize: 11, lineHeight: 15 },
  section: { gap: 14 },
  headBadge: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  headBadgeText: { fontSize: 10.5, fontWeight: '700' },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  numText: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  linkText: { fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, paddingTop: 12, marginTop: 2 },
  explainer: { borderRadius: 12, padding: 14 },
  explainerText: { fontSize: 11.5, lineHeight: 16 },
  tdsTileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tdsTile: { flexGrow: 1, flexBasis: 160, borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  tdsTileLabel: { fontSize: 11 },
  tdsTileValue: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  tdsHeading: { fontSize: 13.5, fontWeight: '700', marginTop: 12 },
  tdsExplainer: { fontSize: 11.5, lineHeight: 16, marginTop: 6 },
  returnCount: { fontSize: 11.5, fontWeight: '600' },
  returnRow: { gap: 12, marginTop: 10 },
  returnRowWide: { flexDirection: 'row' },
  returnCard: { flexGrow: 1, flexBasis: 240, gap: 7, borderWidth: 1, borderColor: 'rgba(128, 144, 168, 0.22)' },
  returnAmount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  returnBtn: { alignSelf: 'flex-start', marginTop: 4 },
  docChip: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  docChipBody: { flex: 1, minWidth: 0 },
  docChipLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  docChipText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  modalNote: { fontSize: 11.5, lineHeight: 16 },
});
