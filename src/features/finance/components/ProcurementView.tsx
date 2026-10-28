import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { financeAreas } from '../data';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner, HeroGlassCard } from './HeroBanner';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { Icon } from '../../../components/ui/Icon';
import { ProcAreaCard, ProcProjectCard, QuoteCard } from './ProcurementParts';

export interface Requisition {
  id: string;
  project: string;
  department: string;
  item: string;
  quantity: number;
  estimatedCost: number;
  requestedBy: string;
  date: string;
  vendor: string;
  status: 'Approved' | 'Pending approval' | 'RFQ Released' | 'PO Created' | 'PO Sent' | 'Invoice Awaited';
}

const initialRequisitions: Requisition[] = [
  { id: 'REQ-2026-081', project: 'PMKVY 4.0 Odisha Skills', department: 'Skill Development', item: 'Smart Classroom Interactive Flat Panels (65 inch)', quantity: 4, estimatedCost: 380000, requestedBy: 'Subhashree Ray (SPM)', date: '2026-10-04', vendor: 'Zenith Labs Pvt Ltd', status: 'Pending approval' },
  { id: 'REQ-2026-082', project: 'Swasthya Mobile Clinics', department: 'Health & Nutrition', item: 'Portable Digital ECG Machines & Consumables', quantity: 2, estimatedCost: 165000, requestedBy: 'Dr. Priyadarshini Mohapatra (CMO)', date: '2026-10-02', vendor: 'MedTech Diagnostics', status: 'RFQ Released' },
  { id: 'REQ-2026-083', project: 'Poshan Community Network', department: 'Health & Nutrition', item: 'Anthropometric Infant Weighing Scales & MUAC Tapes', quantity: 25, estimatedCost: 85000, requestedBy: 'Kavita Soren (Supervisor)', date: '2026-09-28', vendor: 'Apex Tooling Systems', status: 'Approved' },
];

const PROJECT_AREA: Record<string, string> = {
  'PMKVY 4.0 Odisha Skills': 'skill-development',
  'Swasthya Mobile Clinics': 'health',
  'Poshan Community Network': 'nutrition',
};

const PROCUREMENT_HISTORY: Array<{ id: string; item: string; vendor: string; value: number; date: string; status: Requisition['status'] }> = [
  { id: 'PO-2026-044', item: 'Community Nutrition Fellows — Field Tablets (12 units)', vendor: 'Zenith Labs Pvt Ltd', value: 296000, date: '2026-09-12', status: 'PO Sent' },
  { id: 'PO-2026-041', item: 'Mobile Clinic Fuel & Fleet AMC Contract', vendor: 'MTR Logistics', value: 412000, date: '2026-08-30', status: 'Invoice Awaited' },
  { id: 'PO-2026-038', item: 'Incubation Lab Workstations & Networking', vendor: 'Kalinga Tech', value: 538000, date: '2026-08-14', status: 'PO Sent' },
];

const QUOTE_VENDORS = ['Zenith Labs Pvt Ltd', 'MedTech Diagnostics', 'Apex Tooling Systems'];
const QUOTE_FACTORS = [0.98, 1.03, 1.005];
const QUOTE_LEAD = ['2–3 weeks', '3–4 weeks', '2 weeks'];
const QUOTE_RATINGS = ['4.8', '4.5', '4.6'];

const chipTones: Record<Requisition['status'], 'warning' | 'success' | 'info' | 'danger' | 'neutral' | 'violet' | 'emerald' | 'brand'> = {
  'Pending approval': 'warning',
  Approved: 'success',
  'RFQ Released': 'info',
  'PO Created': 'info',
  'PO Sent': 'brand',
  'Invoice Awaited': 'warning',
};

export const ProcurementView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const router = useRouter();
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [tab, setTab] = useState('requests');
  const [step, setStep] = useState(0);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [compareReq, setCompareReq] = useState<Requisition | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('all');

  const stats = useMemo(() => {
    const pending = requisitions.filter((r) => r.status === 'Pending approval').length;
    const active = requisitions.filter((r) => ['RFQ Released', 'Approved', 'PO Created'].includes(r.status)).length;
    const done = requisitions.filter((r) => ['PO Sent', 'Invoice Awaited'].includes(r.status)).length;
    return { total: requisitions.length, pending, active, done };
  }, [requisitions]);

  const areaStats = useMemo(
    () =>
      financeAreas.map((area) => {
        const reqs = requisitions.filter((r) => PROJECT_AREA[r.project] === area.id);
        const done = reqs.filter((r) => ['PO Sent', 'Invoice Awaited', 'Approved'].includes(r.status)).length;
        return { area, total: reqs.length, done, value: reqs.reduce((sum, r) => sum + r.estimatedCost, 0) };
      }),
    [requisitions],
  );

  const projectRows = useMemo(() => {
    if (!areaId) return [];
    const map = new Map<string, Requisition[]>();
    requisitions
      .filter((r) => PROJECT_AREA[r.project] === areaId)
      .forEach((r) => map.set(r.project, [...(map.get(r.project) ?? []), r]));
    return Array.from(map.entries()).map(([project, reqs]) => ({
      project,
      reqs,
      pending: reqs.filter((r) => r.status === 'Pending approval').length,
      done: reqs.filter((r) => ['PO Sent', 'Invoice Awaited', 'Approved'].includes(r.status)).length,
      value: reqs.reduce((sum, r) => sum + r.estimatedCost, 0),
    }));
  }, [areaId, requisitions]);

  const activeReqs = useMemo(
    () => requisitions.filter((r) => !projectId || r.project === projectId),
    [projectId, requisitions],
  );

  const historyFiltered = useMemo(
    () =>
      PROCUREMENT_HISTORY.filter((h) => {
        const q = historySearch.toLowerCase();
        const matchesSearch = h.item.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || h.vendor.toLowerCase().includes(q);
        const matchesStatus = historyStatus === 'all' || h.status === historyStatus;
        return matchesSearch && matchesStatus;
      }),
    [historySearch, historyStatus],
  );

  const advance = (id: string, status: Requisition['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const crumb = (label: string, active: boolean, onPress?: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      style={[styles.crumb, { backgroundColor: active ? theme.colors.brandPrimary : 'transparent', borderColor: active ? theme.colors.brandPrimary : theme.colors.border }]}
    >
      <Text numberOfLines={1} style={[styles.crumbText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.finance}
        badge={{ icon: 'ShoppingCart', label: 'Procurement' }}
        title="Procurement tracker"
        description="Requisitions, quotations and purchase orders across thematic projects."
        right={
          <HeroGlassCard label="Pipeline">
            <View style={styles.glassChips}>
              <GlassChip value={`${stats.total} Total`} />
              <GlassChip value={`${stats.pending} Pending`} />
              <GlassChip value={`${stats.active} Active`} />
              <GlassChip value={`${stats.done} Done`} />
            </View>
          </HeroGlassCard>
        }
        actions={[{ label: 'Payments', icon: 'CreditCard', variant: 'white', onPress: () => router.push('/(finance)/payments') }]}
      />

      <Tabs
        items={[
          { key: 'requests', label: 'Requests', icon: 'ShoppingCart', count: requisitions.length },
          { key: 'history', label: 'History', icon: 'History', count: PROCUREMENT_HISTORY.length },
        ]}
        activeKey={tab}
        onChange={setTab}
        accent={theme.colors.financeAccent}
      />

      {tab === 'requests' ? (
        <View style={styles.section}>
          <View style={styles.breadcrumb}>
            {crumb('Thematic Areas', step === 0, () => { setStep(0); setProjectId(null); setAreaId(null); })}
            {areaId ? crumb(financeAreas.find((a) => a.id === areaId)?.name ?? '', step === 1, () => { setStep(1); setProjectId(null); }) : null}
            {projectId ? crumb(projectId, step === 2) : null}
          </View>

          {step === 0 && (
            <View style={[styles.grid, isMd && styles.gridWide]}>
              {areaStats.map(({ area, total, done, value }) => (
                <ProcAreaCard
                  key={area.id}
                  name={area.name}
                  color={area.color}
                  done={done}
                  total={total}
                  value={value}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAreaId(area.id);
                    setStep(1);
                  }}
                />
              ))}
            </View>
          )}

          {step === 1 && (
            <View style={[styles.grid, isMd && styles.gridWide]}>
              {projectRows.map((row) => (
                <ProcProjectCard
                  key={row.project}
                  project={row.project}
                  total={row.reqs.length}
                  pending={row.pending}
                  done={row.done}
                  value={row.value}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setProjectId(row.project);
                    setStep(2);
                  }}
                />
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.list}>
              {activeReqs.map((req) => (
                <Card key={req.id} padding={16} style={styles.requestCard}>
                  <View style={styles.requestTop}>
                    <View style={styles.requestBody}>
                      <Text style={[styles.requestItem, { color: theme.colors.text }]}>{req.item}</Text>
                      <Text style={[styles.requestSub, { color: theme.colors.brandPrimary }]}>
                        {req.id} · {req.project}
                      </Text>
                      <Text style={[styles.requestMeta, { color: theme.colors.textSubtle }]}>
                        Requested by {req.requestedBy} · {formatDate(req.date)} · Supplier: {req.vendor}
                      </Text>
                    </View>
                    <StatusChip status={req.status} tone={chipTones[req.status]} />
                  </View>
                  <View style={styles.requestDetails}>
                    <Detail label="Quantity" value={`${req.quantity} Units`} />
                    <Detail label="Estimated value" value={formatRupees(req.estimatedCost)} accent={theme.colors.emerald} />
                    <Detail label="Stage" value={req.status} />
                  </View>
                  <View style={styles.actionRow}>
                    {req.status === 'Pending approval' ? (
                      <Button label="Approve Request" icon="CheckCircle" variant="emerald" size="sm" onPress={() => advance(req.id, 'Approved')} />
                    ) : null}
                    {req.status === 'Approved' ? (
                      <Button label="Create PO" icon="Plus" variant="primary" size="sm" onPress={() => advance(req.id, 'PO Created')} />
                    ) : null}
                    {req.status === 'RFQ Released' ? (
                      <Button label="Compare quotations" icon="GitCompareArrows" variant="primary" size="sm" onPress={() => setCompareReq(req)} />
                    ) : null}
                    {req.status === 'PO Created' ? (
                      <Button label="Send PO" icon="Send" variant="emerald" size="sm" onPress={() => advance(req.id, 'PO Sent')} />
                    ) : null}
                    {req.status === 'PO Sent' ? (
                      <Button label="Invoice reminder" icon="Receipt" variant="outline" size="sm" onPress={() => advance(req.id, 'Invoice Awaited')} />
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.historyFilters}>
            <TextField value={historySearch} onChangeText={setHistorySearch} placeholder="Search purchase orders…" containerStyle={styles.historySearch} />
            <SelectField
              value={historyStatus}
              onChange={setHistoryStatus}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'PO Sent', label: 'PO Sent' },
                { value: 'Invoice Awaited', label: 'Invoice Awaited' },
              ]}
              placeholder="All statuses"
              containerStyle={styles.historySelect}
            />
          </View>
          {historyFiltered.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No purchase orders match the filters.</Text>
          ) : (
            <View style={styles.list}>
              {historyFiltered.map((h) => (
                <Card key={h.id} padding={16} style={styles.requestCard}>
                  <View style={styles.requestTop}>
                    <View style={styles.requestBody}>
                      <Text style={[styles.requestItem, { color: theme.colors.text }]}>{h.item}</Text>
                      <Text style={[styles.requestSub, { color: theme.colors.brandPrimary }]}>{h.id} · {h.vendor}</Text>
                      <Text style={[styles.requestMeta, { color: theme.colors.textSubtle }]}>Raised {formatDate(h.date)} · {formatRupees(h.value)}</Text>
                    </View>
                    <StatusChip status={h.status} tone={chipTones[h.status]} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      )}

      <ModalSheet
        visible={Boolean(compareReq)}
        onClose={() => setCompareReq(null)}
        label="Quotation evaluation"
        title="Compare three quotations"
        description={compareReq ? `${compareReq.item} · ${compareReq.project}` : undefined}
        size="lg"
        footer={<Button label="Close" variant="outline" onPress={() => setCompareReq(null)} />}
      >
        {compareReq ? (
          <>
            <View style={[styles.quoteRow, !isMd && { flexDirection: 'column' }]}>
              {QUOTE_VENDORS.map((vendor, index) => (
                <QuoteCard
                  key={vendor}
                  vendor={vendor}
                  amount={Math.round(compareReq.estimatedCost * QUOTE_FACTORS[index])}
                  leadTime={QUOTE_LEAD[index]}
                  rating={QUOTE_RATINGS[index]}
                  lowest={index === 0}
                />
              ))}
            </View>
            <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Audit trail</Text>
            <Timeline
              items={[
                { key: '1', title: 'Requisition raised', actor: compareReq.requestedBy, detail: `${compareReq.quantity} units · ${formatRupees(compareReq.estimatedCost)} estimated`, time: formatDate(compareReq.date) },
                { key: '2', title: 'RFQ released to empaneled vendors', actor: 'Procurement Cell', detail: 'Three quotations invited from the vendor master directory' },
                { key: '3', title: 'Quotations received', actor: compareReq.vendor, detail: 'Comparative statement pending finance sign-off' },
              ]}
              accent={theme.colors.financeAccent}
            />
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const GlassChip: React.FC<{ value: string }> = ({ value }) => (
  <View style={styles.glassChip}>
    <Text style={styles.glassChipText}>{value}</Text>
  </View>
);

const Detail: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.detailCol}>
      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  glassChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  glassChip: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexGrow: 1 },
  glassChipText: { color: '#ffffff', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  section: { gap: 12 },
  breadcrumb: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  crumb: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 220 },
  crumbText: { fontSize: 11.5, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  list: { gap: 12 },
  requestCard: { gap: 12 },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  requestBody: { flex: 1, minWidth: 0 },
  requestItem: { fontSize: 14.5, fontWeight: '700', lineHeight: 19 },
  requestSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  requestMeta: { fontSize: 11, marginTop: 2 },
  requestDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  detailCol: { minWidth: 110 },
  detailLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 3 },
  detailValue: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128, 144, 168, 0.16)', paddingTop: 12 },
  historyFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historySearch: { flexGrow: 1, flexBasis: 220 },
  historySelect: { flexGrow: 1, flexBasis: 170 },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  quoteRow: { flexDirection: 'row', gap: 10 },
  auditTitle: { fontSize: 14, fontWeight: '700', marginTop: 4 },
});
