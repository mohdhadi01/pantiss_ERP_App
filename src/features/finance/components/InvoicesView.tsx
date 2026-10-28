import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { financeAreas, formatCurrency } from '../data';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Icon } from '../../../components/ui/Icon';
import { CreateInvoiceSheet, InvoiceViewSheet, InvoiceItemLine } from './InvoicesParts';

export type InvoiceStatus = 'Draft' | 'Raised' | 'Admin Verified';

export interface Invoice {
  id: string;
  number: string;
  client: string;
  email: string;
  project: string;
  date: string;
  dueDate: string;
  amount: number;
  gstAmount: number;
  status: InvoiceStatus;
  billingAddress: string;
  notes: string;
}

const TODAY = '2026-10-28';

const initialInvoices: Invoice[] = [
  { id: 'INV-2026-081', number: 'INV-2026-081', client: 'National Skill Development Corporation (NSDC)', email: 'billing@nsdc.org.in', project: 'PMKVY 4.0 Odisha Skills', date: '2026-09-15', dueDate: '2026-10-15', amount: 4500000, gstAmount: 810000, status: 'Admin Verified', billingAddress: 'NSDC, SIPCOT IT Park, Padur, Chennai', notes: 'NEFT to Pantiss Foundation current account. Quote the invoice number in the remittance reference.' },
  { id: 'INV-2026-082', number: 'INV-2026-082', client: 'Tata Trusts Strategic Grant Division', email: 'grants@tatatrusts.org', project: 'Poshan Community Network', date: '2026-09-28', dueDate: '2026-10-28', amount: 3200000, gstAmount: 0, status: 'Raised', billingAddress: 'Bombay House, Fort, Mumbai 400001', notes: 'Grant tranche invoice — no GST applicable on the sanctioned project activity.' },
  { id: 'INV-2026-083', number: 'INV-2026-083', client: 'Odisha State CSR Council', email: 'csr@odisha.gov.in', project: 'Project Udaan', date: '2026-08-20', dueDate: '2026-09-20', amount: 1850000, gstAmount: 333000, status: 'Raised', billingAddress: 'Lok Seva Bhawan, Bhubaneswar 751022', notes: 'NEFT to Pantiss Foundation current account. Quote the invoice number in the remittance reference.' },
];

const TRANCHES = [
  { no: 1, pct: 40, date: '2026-08-20', approved: true },
  { no: 2, pct: 35, date: '2026-12-15', approved: false },
  { no: 3, pct: 25, date: '2027-03-31', approved: false },
];

export const InvoicesView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const metrics = useMemo(() => {
    const drafts = invoices.filter((i) => i.status === 'Draft');
    const raised = invoices.filter((i) => i.status === 'Raised');
    const verified = invoices.filter((i) => i.status === 'Admin Verified');
    return {
      drafts: drafts.length,
      awaiting: raised.length,
      verified: verified.length,
      raisedValue: [...raised, ...verified].reduce((sum, i) => sum + i.amount + i.gstAmount, 0),
    };
  }, [invoices]);

  const areaRows = useMemo(() => {
    return financeAreas
      .map((area) => ({
        area,
        count: invoices.filter((i) => area.projects.some((p) => p.name === i.project)).length,
        projects: Array.from(new Set(invoices.filter((i) => area.projects.some((p) => p.name === i.project)).map((i) => i.project))),
      }))
      .filter((row) => row.count > 0);
  }, [invoices]);

  const projectInfo = useMemo(() => {
    if (!projectId) return null;
    const project = financeAreas.flatMap((a) => a.projects).find((p) => p.name === projectId);
    const projectInvoices = invoices.filter((i) => i.project === projectId);
    return { project, invoices: projectInvoices };
  }, [projectId, invoices]);

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        const q = search.toLowerCase();
        const matchesSearch = inv.client.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q) || inv.project.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [invoices, search, statusFilter],
  );

  const dueState = (dueDate: string): 'overdue' | 'dueSoon' | 'ok' => {
    if (dueDate < TODAY) return 'overdue';
    const diff = (new Date(dueDate).getTime() - new Date(TODAY).getTime()) / 86400000;
    return diff <= 7 ? 'dueSoon' : 'ok';
  };

  const saveDraft = (form: { number: string; client: string; email: string; issueDate: string; dueDate: string; billingAddress: string; notes: string }, items: InvoiceItemLine[]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const amount = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0);
    const next: Invoice = {
      id: `INV-2026-${String(invoices.length + 84).padStart(3, '0')}`,
      number: form.number.trim() || `INV-2026-${String(invoices.length + 84).padStart(3, '0')}`,
      client: form.client.trim() || 'Unnamed client',
      email: form.email.trim(),
      project: projectId ?? 'General',
      date: form.issueDate,
      dueDate: form.dueDate || form.issueDate,
      amount,
      gstAmount: 0,
      status: 'Draft',
      billingAddress: form.billingAddress.trim() || '—',
      notes: form.notes,
    };
    setInvoices((prev) => [next, ...prev]);
    setCreateOpen(false);
  };

  const raiseInvoice = (invoice: Invoice) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? { ...i, status: 'Raised' as const } : i)));
    setViewOpen(false);
  };

  const verifyInvoice = (invoice: Invoice) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? { ...i, status: 'Admin Verified' as const } : i)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Draft invoices" value={String(metrics.drafts)} icon="FileText" accentColor={theme.colors.financeAccent} arrow />
        <MetricCard style={styles.metricCard} label="Awaiting verification" value={String(metrics.awaiting)} icon="Clock" accentColor={theme.colors.warning} arrow />
        <MetricCard style={styles.metricCard} label="Admin verified" value={String(metrics.verified)} icon="ShieldCheck" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="Total raised value" value={formatRupees(metrics.raisedValue)} icon="CheckCircle2" accentColor={theme.colors.emerald} arrow />
      </View>

      {!projectId ? (
        <View style={styles.section}>
          <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Choose a project</Text>
          {!areaId ? (
            <View style={[styles.grid, isMd && styles.gridWide]}>
              {areaRows.map(({ area, count }) => (
                <Pressable key={area.id} onPress={() => setAreaId(area.id)} style={styles.scopeCardWrap}>
                  <Card padding={16} style={styles.scopeCard}>
                    <View style={styles.scopeTop}>
                      <View style={[styles.scopeTile, { backgroundColor: `${area.color}1A` }]}>
                        <Text style={[styles.scopeTileText, { color: area.color }]}>{area.name.charAt(0)}</Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>{area.name}</Text>
                    </View>
                    <Text style={[styles.scopeMeta, { color: theme.colors.textSubtle }]}>{count} invoices</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <Pressable onPress={() => setAreaId(null)} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
                <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>All thematic areas</Text>
              </Pressable>
              <View style={[styles.grid, isMd && styles.gridWide]}>
                {(areaRows.find((row) => row.area.id === areaId)?.projects ?? []).map((name) => {
                  const project = financeAreas.flatMap((a) => a.projects).find((p) => p.name === name);
                  return (
                    <Pressable
                      key={name}
                      onPress={() => {
                        setProjectId(name);
                        setSearch('');
                      }}
                      style={styles.scopeCardWrap}
                    >
                      <Card padding={16} style={styles.scopeCard}>
                        <Text numberOfLines={1} style={[styles.scopeName, { color: theme.colors.text }]}>{name}</Text>
                        <Text style={[styles.scopeMeta, { color: theme.colors.textSubtle }]}>
                          {project?.donor} · {invoices.filter((i) => i.project === name).length} invoices
                        </Text>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              setProjectId(null);
              setAreaId(null);
            }}
            style={styles.backBtn}
          >
            <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
            <Text style={[styles.backBtnText, { color: theme.colors.textMuted }]}>Back to projects</Text>
          </Pressable>

          {projectInfo?.project ? (
            <Card padding={18}>
              <View style={styles.projectHeader}>
                <View style={styles.projectHeaderMain}>
                  <Text style={[styles.projectTitle, { color: theme.colors.text }]}>{projectInfo.project.name}</Text>
                  <Text style={[styles.projectSub, { color: theme.colors.textMuted }]}>
                    {projectInfo.project.donor} · Approved {formatCurrency(projectInfo.project.approved)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setCreateOpen(true)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.createBtn, { backgroundColor: theme.colors.financeAccent, opacity: pressed ? 0.9 : 1 }]}
                >
                  <Icon name="Plus" size={15} color="#ffffff" />
                  <Text style={styles.createBtnText}>Create invoice</Text>
                </Pressable>
              </View>
            </Card>
          ) : null}

          {projectInfo?.project ? (
            <SectionCard title="Tranche-wise invoicing" description="Tentative dates and admin approvals before invoices are raised.">
              <View style={styles.trancheList}>
                {TRANCHES.map((tranche) => {
                  const amount = projectInfo.project!.approved * (tranche.pct / 100);
                  const overdue = tranche.date < TODAY && !tranche.approved;
                  const raisedForProject = projectInfo.invoices[0];
                  return (
                    <View key={tranche.no} style={[styles.trancheRow, { borderColor: theme.colors.border }]}>
                      <View style={styles.trancheMain}>
                        <View style={styles.trancheTop}>
                          <Text style={[styles.trancheTitle, { color: theme.colors.text }]}>
                            Tranche {tranche.no} · {tranche.pct}%
                          </Text>
                          <StatusChip
                            status={tranche.approved ? 'Admin approved' : 'Awaiting admin approval'}
                            tone={tranche.approved ? 'success' : 'warning'}
                          />
                        </View>
                        <Text style={[styles.trancheAmount, { color: theme.colors.financeAccent }]}>{formatCurrency(amount)}</Text>
                        <View style={styles.trancheDateRow}>
                          <Icon name="Calendar" size={13} color={theme.colors.textSubtle} />
                          <Text style={[styles.trancheDate, { color: theme.colors.textMuted }]}>
                            Tentative invoice date {formatDate(tranche.date)}
                          </Text>
                        </View>
                        {overdue ? (
                          <Text style={[styles.overdueText, { color: theme.colors.dangerText }]}>Past tentative date · Invoice pending</Text>
                        ) : null}
                      </View>
                      <View style={styles.trancheActions}>
                        {!tranche.approved ? (
                          <Pressable
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                            }}
                            accessibilityRole="button"
                            style={[styles.approveBtn, { borderColor: theme.colors.borderStrong }]}
                          >
                            <Text style={[styles.approveBtnText, { color: theme.colors.text }]}>Approve (Super Admin)</Text>
                          </Pressable>
                        ) : null}
                        {tranche.no === 1 && raisedForProject ? (
                          <View style={[styles.raisedPill, { backgroundColor: theme.colors.successSoft }]}>
                            <Icon name="Check" size={13} color={theme.colors.successText} />
                            <Text style={[styles.raisedPillText, { color: theme.colors.successText }]}>Raised · {raisedForProject.number}</Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => setCreateOpen(true)}
                            disabled={!tranche.approved}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !tranche.approved }}
                            style={[styles.raiseBtn, { backgroundColor: tranche.approved ? theme.colors.financeAccent : theme.colors.surfaceMuted, opacity: tranche.approved ? 1 : 0.55 }]}
                          >
                            <Text style={[styles.raiseBtnText, { color: tranche.approved ? '#ffffff' : theme.colors.textMuted }]}>Raise invoice</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </SectionCard>
          ) : null}
        </View>
      )}

      <SectionCard title="Invoice list" description="Drafts, raised invoices and admin verification status.">
        <View style={styles.filterRow}>
          <TextField value={search} onChangeText={setSearch} placeholder="Search client or invoice number…" containerStyle={styles.searchGrow} />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Raised', label: 'Raised' },
              { value: 'Admin Verified', label: 'Admin Verified' },
            ]}
            containerStyle={styles.filterSelect}
          />
        </View>

        {filtered.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No invoices match the current filters.</Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((inv) => {
              const due = dueState(inv.dueDate);
              return (
                <Pressable
                  key={inv.id}
                  onPress={() => {
                    setViewInvoice(inv);
                    setViewOpen(true);
                  }}
                >
                  <Card padding={16} style={styles.invoiceCard}>
                    <View style={styles.invoiceTop}>
                      <View style={styles.invoiceMain}>
                        <Text numberOfLines={1} style={[styles.clientName, { color: theme.colors.text }]}>{inv.client}</Text>
                        <Text
                          style={[
                            styles.dueText,
                            { color: due === 'overdue' ? theme.colors.dangerText : due === 'dueSoon' ? theme.colors.warningText : theme.colors.textSubtle },
                          ]}
                        >
                          {inv.number} · Due {formatDate(inv.dueDate)}
                        </Text>
                      </View>
                      <View style={styles.invoiceRight}>
                        <Text style={[styles.amountText, { color: theme.colors.financeAccent }]}>{formatRupees(inv.amount + inv.gstAmount)}</Text>
                        <StatusChip status={inv.status} />
                      </View>
                    </View>
                    <ProgressBar value={inv.status === 'Admin Verified' ? 100 : inv.status === 'Raised' ? 66 : 25} height={3} color={theme.colors.financeAccent} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </SectionCard>

      <CreateInvoiceSheet visible={createOpen} onClose={() => setCreateOpen(false)} onSave={saveDraft} projectName={projectId} />

      <InvoiceViewSheet
        invoice={viewInvoice}
        visible={viewOpen}
        onClose={() => setViewOpen(false)}
        onEdit={() => setViewOpen(false)}
        onRaise={raiseInvoice}
        onVerify={verifyInvoice}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  scopeCard: { gap: 8 },
  scopeCardWrap: { flexGrow: 1, flexBasis: 240 },
  scopeTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scopeTile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scopeTileText: { fontSize: 15, fontWeight: '700' },
  scopeName: { fontSize: 13.5, fontWeight: '600', flexShrink: 1 },
  scopeMeta: { fontSize: 11 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  backBtnText: { fontSize: 12.5, fontWeight: '600' },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  projectHeaderMain: { flex: 1, minWidth: 0 },
  projectTitle: { fontSize: 18, fontWeight: '700' },
  projectSub: { fontSize: 12, marginTop: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 },
  createBtnText: { color: '#ffffff', fontSize: 12.5, fontWeight: '600' },
  trancheList: { gap: 12 },
  trancheRow: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 14, padding: 14, gap: 14 },
  trancheMain: { flex: 1, minWidth: 220, gap: 6 },
  trancheTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  trancheTitle: { fontSize: 13.5, fontWeight: '700' },
  trancheAmount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  trancheDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trancheDate: { fontSize: 11.5 },
  overdueText: { fontSize: 11.5, fontWeight: '600' },
  trancheActions: { alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  approveBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 9 },
  approveBtnText: { fontSize: 11.5, fontWeight: '600' },
  raisedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  raisedPillText: { fontSize: 11.5, fontWeight: '700' },
  raiseBtn: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10 },
  raiseBtnText: { fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  searchGrow: { flexGrow: 1, flexBasis: 240 },
  filterSelect: { flexGrow: 1, flexBasis: 180 },
  list: { gap: 12 },
  invoiceCard: { gap: 10 },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  invoiceMain: { flex: 1, minWidth: 0 },
  clientName: { fontSize: 13.5, fontWeight: '700' },
  dueText: { fontSize: 11.5, fontWeight: '600', marginTop: 3 },
  invoiceRight: { alignItems: 'flex-end', gap: 6 },
  amountText: { fontSize: 14.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
});
