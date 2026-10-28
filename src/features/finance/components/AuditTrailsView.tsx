import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { financeAreas } from '../data';
import { Card, SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { MetricCard } from '../../../components/ui/MetricCard';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

type InvoiceStatus = 'Pending Verification' | 'Finance Approved' | 'Disbursed' | 'Rejected';

interface EmployeeInvoice {
  id: string;
  invoiceNo: string;
  employee: string;
  employeeId: string;
  project: string;
  raisedOn: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
  docRef: string;
  auditor: string;
  auditDate: string;
  finding: string;
}

const INVOICES: EmployeeInvoice[] = [
  { id: 'ADT-2026-901', invoiceNo: 'INV/2026/0912', employee: 'Ramesh Mohanty', employeeId: 'PAN-EMP-0112', project: 'PMKVY 4.0 Odisha Skills', raisedOn: '2026-09-24', amount: 88500, status: 'Disbursed', description: '3-way match verified with purchase order and store GRN note.', docRef: 'INV/2026/0912 + PO-2026-044', auditor: 'Internal Audit Cell (Deloitte/CAG)', auditDate: '2026-10-02', finding: 'Low risk — cleared for disbursement.' },
  { id: 'ADT-2026-902', invoiceNo: 'MED/OD/441', employee: 'Pooja Barik', employeeId: 'PAN-EMP-0109', project: 'Swasthya Mobile Clinics', raisedOn: '2026-09-28', amount: 142000, status: 'Disbursed', description: 'Logbook vehicle odometer log verified with fuel receipts.', docRef: 'MED/OD/441 + fleet logbook 09/28', auditor: 'Internal Audit Cell', auditDate: '2026-10-04', finding: 'Low risk — cleared for disbursement.' },
  { id: 'ADT-2026-903', invoiceNo: 'VND/INC/22', employee: 'Kiran Pradhan', employeeId: 'PAN-EMP-0115', project: 'Rural Incubation Lab', raisedOn: '2026-10-01', amount: 65000, status: 'Pending Verification', description: 'Missing counter-signature on delivery challan. Pending vendor confirmation.', docRef: 'VND/INC/22 (challan copy awaited)', auditor: 'Internal Audit Cell', auditDate: '2026-10-06', finding: 'Medium risk — held at finance verification.' },
];

const statusTone = (status: InvoiceStatus) =>
  status === 'Finance Approved' ? ('info' as const) : status === 'Pending Verification' ? ('warning' as const) : status === 'Rejected' ? ('danger' as const) : ('success' as const);

const COLUMNS: Array<DataColumn<EmployeeInvoice>> = [
  { key: 'invoice', label: 'Invoice / claim', flex: 1.4 },
  { key: 'employee', label: 'Employee', flex: 1.5 },
  { key: 'raised', label: 'Raised on', flex: 1, wideOnly: true },
  { key: 'amount', label: 'Amount', flex: 1, align: 'right' },
  { key: 'status', label: 'Status', flex: 1.3 },
  { key: 'trail', label: '', flex: 0.8, align: 'right' },
];

export const AuditTrailsView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trailItem, setTrailItem] = useState<EmployeeInvoice | null>(null);
  const [trailOpen, setTrailOpen] = useState(false);

  const stats = useMemo(() => {
    const employees = new Set(INVOICES.map((i) => i.employee));
    return {
      submissions: INVOICES.length,
      total: INVOICES.reduce((sum, i) => sum + i.amount, 0),
      employees: employees.size,
      awaiting: INVOICES.filter((i) => i.status === 'Pending Verification').length,
    };
  }, []);

  const directory = useMemo(() => {
    const byProject = new Map<string, EmployeeInvoice[]>();
    INVOICES.forEach((inv) => byProject.set(inv.project, [...(byProject.get(inv.project) ?? []), inv]));
    return Array.from(byProject.entries()).map(([project, invoices]) => {
      const projectId = financeAreas.flatMap((a) => a.projects).find((p) => p.name === project)?.id;
      const area = financeAreas.find((a) => a.projects.some((p) => p.id === projectId));
      return {
        project,
        areaId: area?.id ?? 'research-analytics',
        areaName: area?.name ?? 'Research & Analytics',
        color: area?.color ?? '#7c3aed',
        invoices,
        pending: invoices.filter((i) => i.status === 'Pending Verification').length,
      };
    });
  }, []);

  const filtered = useMemo(
    () =>
      INVOICES.filter((inv) => {
        const q = search.toLowerCase();
        const matchesSearch =
          inv.employee.toLowerCase().includes(q) || inv.invoiceNo.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q) || inv.project.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter],
  );

  const renderCell = (inv: EmployeeInvoice, col: DataColumn<EmployeeInvoice>) => {
    switch (col.key) {
      case 'invoice':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.brandPrimary }]}>{inv.invoiceNo}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{inv.project}</Text>
          </View>
        );
      case 'employee':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{inv.employee}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{inv.employeeId}</Text>
          </View>
        );
      case 'raised':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{formatDate(inv.raisedOn)}</Text>;
      case 'amount':
        return <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(inv.amount)}</Text>;
      case 'status':
        return <StatusChip status={inv.status} tone={statusTone(inv.status)} />;
      case 'trail':
        return (
          <Pressable
            onPress={() => {
              setTrailItem(inv);
              setTrailOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`View trail ${inv.invoiceNo}`}
          >
            <Text style={[styles.linkText, { color: theme.colors.financeAccent }]}>View trail</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headingRow, isMd && styles.headingRowWide]}>
        <View style={styles.headingMain}>
          <View style={styles.eyebrowRow}>
            <Icon name="History" size={13} color={theme.colors.brandPrimary} />
            <Text style={[theme.fontStyles.eyebrow, { color: theme.colors.brandPrimary }]}>Finance / Records</Text>
          </View>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Audit trail</Text>
          <Text style={[styles.pageSub, { color: theme.colors.textMuted }]}>
            Follow every employee invoice, from submission to disbursement.
          </Text>
        </View>
        <Card padding={16} flat style={styles.noteCard}>
          <Text style={[styles.noteTitle, { color: theme.colors.text }]}>Project-wise history</Text>
          <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>Invoices, approvals &amp; payment records</Text>
        </Card>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Invoice submissions" value={String(stats.submissions)} icon="FileText" accentColor={theme.colors.brandPrimary} />
        <MetricCard style={styles.metricCard} label="Total invoice value" value={formatRupees(stats.total)} icon="BadgeIndianRupee" accentColor={theme.colors.financeAccent} />
        <MetricCard style={styles.metricCard} label="Employees" value={String(stats.employees)} icon="Users" accentColor={theme.colors.info} />
        <MetricCard style={styles.metricCard} label="Awaiting verification" value={String(stats.awaiting)} icon="Clock" accentColor={theme.colors.warning} />
      </View>

      <View style={[styles.grid, isMd && styles.gridWide]}>
        {directory.map((entry) => (
          <Pressable key={entry.project} onPress={() => { setSearch(entry.project); setStatusFilter('all'); }} style={styles.areaCardWrap}>
            <Card padding={16} style={styles.areaCard}>
              <View style={styles.areaTop}>
                <View style={[styles.areaTile, { backgroundColor: `${entry.color}1A` }]}>
                  <Text style={[styles.areaTileText, { color: entry.color }]}>{entry.areaName.charAt(0)}</Text>
                </View>
                <View style={styles.areaTitleCol}>
                  <Text numberOfLines={1} style={[styles.areaName, { color: theme.colors.text }]}>{entry.project}</Text>
                  <Text style={[styles.areaMeta, { color: theme.colors.textSubtle }]}>{entry.areaName}</Text>
                </View>
              </View>
              <Text style={[styles.areaStats, { color: theme.colors.textMuted }]}>
                {entry.invoices.length} invoices · Invoice value {formatRupees(entry.invoices.reduce((sum, i) => sum + i.amount, 0))}
              </Text>
              {entry.pending > 0 ? (
                <StatusChip status={`${entry.pending} pending`} tone="warning" />
              ) : (
                <StatusChip status="View records" tone="brand" />
              )}
            </Card>
          </Pressable>
        ))}
      </View>

      <SectionCard title="Employee invoices" description="Every submission with verification status and the full recorded trail.">
        <View style={styles.filterRow}>
          <TextField value={search} onChangeText={setSearch} placeholder="Search invoices, employees or projects…" containerStyle={styles.searchGrow} />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Pending Verification', label: 'Pending Verification' },
              { value: 'Finance Approved', label: 'Finance Approved' },
              { value: 'Disbursed', label: 'Disbursed' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
            containerStyle={styles.filterSelect}
          />
        </View>
        <DataTable
          columns={COLUMNS}
          rows={filtered}
          keyExtractor={(inv) => inv.id}
          renderCell={renderCell}
          renderMobileCard={(inv) => (
            <Card padding={14} style={styles.mobileCard}>
              <View style={styles.mobileTop}>
                <View style={styles.mobileBody}>
                  <Text style={[styles.cellMain, { color: theme.colors.brandPrimary }]}>{inv.invoiceNo}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.text }]}> {inv.employee} · {inv.employeeId}</Text>
                  <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>Raised {formatDate(inv.raisedOn)}</Text>
                </View>
                <StatusChip status={inv.status} tone={statusTone(inv.status)} />
              </View>
              <View style={styles.mobileFooter}>
                <Text style={[styles.numText, { color: theme.colors.text }]}>{formatRupees(inv.amount)}</Text>
                <Pressable
                  onPress={() => {
                    setTrailItem(inv);
                    setTrailOpen(true);
                  }}
                >
                  <Text style={[styles.linkText, { color: theme.colors.financeAccent }]}>View trail</Text>
                </Pressable>
              </View>
            </Card>
          )}
          emptyIcon="FileText"
          emptyTitle="No invoices match"
          emptyDescription="Adjust the search or status filter to see employee invoices."
        />
      </SectionCard>

      <ModalSheet
        visible={trailOpen && Boolean(trailItem)}
        onClose={() => setTrailOpen(false)}
        label="Audit trail"
        title={trailItem ? `${trailItem.invoiceNo} · ${trailItem.employee}` : ''}
        description={trailItem ? trailItem.project : undefined}
        size="md"
        footer={<Button label="Close" variant="outline" onPress={() => setTrailOpen(false)} />}
      >
        {trailItem ? (
          <>
            <View style={[styles.amountPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <View style={styles.amountTop}>
                <Text style={[styles.amountValue, { color: theme.colors.financeAccent }]}>{formatRupees(trailItem.amount)}</Text>
                <StatusChip status={trailItem.status} tone={statusTone(trailItem.status)} />
              </View>
              <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{trailItem.description}</Text>
              <Text style={[styles.docRef, { color: theme.colors.textSubtle }]}>
                Supporting document reference: <Text style={{ color: theme.colors.text }}>{trailItem.docRef}</Text>
              </Text>
            </View>
            <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Recorded events</Text>
            <Timeline
              accent={theme.colors.financeAccent}
              items={[
                { key: '1', title: 'Invoice submitted', actor: `${trailItem.employee} (${trailItem.employeeId})`, detail: 'Supporting bills attached for verification', time: formatDate(trailItem.raisedOn) },
                { key: '2', title: 'Finance verification', actor: trailItem.auditor, detail: trailItem.finding, time: formatDate(trailItem.auditDate), color: trailItem.status === 'Disbursed' ? theme.colors.emerald : theme.colors.warning },
                trailItem.status === 'Disbursed'
                  ? { key: '3', title: 'Disbursed to employee account', actor: 'Disbursement Desk', color: theme.colors.emerald }
                  : { key: '3', title: 'Awaiting verification outcome', actor: 'Finance Desk', color: theme.colors.warning },
              ]}
            />
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  headingRow: { gap: 12 },
  headingRowWide: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headingMain: { flex: 1, minWidth: 0, gap: 4 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pageTitle: { fontSize: 32, fontWeight: '600', letterSpacing: -1.3 },
  pageSub: { fontSize: 12.5 },
  noteCard: { flexGrow: 0, flexBasis: 240, gap: 3 },
  noteTitle: { fontSize: 13, fontWeight: '700' },
  noteText: { fontSize: 11.5 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 200 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  areaCard: { gap: 10 },
  areaCardWrap: { flexGrow: 1, flexBasis: 260 },
  areaTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  areaTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  areaTileText: { fontSize: 15, fontWeight: '700' },
  areaTitleCol: { flex: 1, minWidth: 0 },
  areaName: { fontSize: 13, fontWeight: '600' },
  areaMeta: { fontSize: 10.5 },
  areaStats: { fontSize: 11, fontVariant: ['tabular-nums'] },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  searchGrow: { flexGrow: 1, flexBasis: 240 },
  filterSelect: { flexGrow: 1, flexBasis: 190 },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  numText: { fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  linkText: { fontSize: 12, fontWeight: '600' },
  mobileCard: { gap: 10 },
  mobileTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  mobileBody: { flex: 1, minWidth: 0 },
  mobileFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountPanel: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 8 },
  amountTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  amountValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  desc: { fontSize: 12, lineHeight: 17 },
  docRef: { fontSize: 11.5 },
  auditTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 4 },
});
