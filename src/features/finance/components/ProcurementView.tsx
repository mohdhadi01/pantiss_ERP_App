import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { FinanceStackNav } from '../../../navigation/types';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { financeAreas } from '../data';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner, HeroGlassCard } from './HeroBanner';
import { Card } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Timeline } from '../../../components/ui/Timeline';
import { Icon } from '../../../components/ui/Icon';
import {
  ProcAreaCard,
  ProcProjectCard,
  ProcExpanded,
  ReviewQuoteCard,
  ProcAuditEntry,
  Requisition,
  ProcurementStatus,
  STATUS_LABELS,
  chipTones,
  procurementStamp,
  initialRequisitions,
  purchaseOrderHistory,
  PROJECT_AREA,
} from './ProcurementParts';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...(Object.keys(STATUS_LABELS) as ProcurementStatus[]).map((value) => ({ value, label: STATUS_LABELS[value] })),
];

export const ProcurementView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const navigation = useNavigation<FinanceStackNav>();
  const [requisitions, setRequisitions] = useState(initialRequisitions);
  const [tab, setTab] = useState('requests');
  const [step, setStep] = useState(0);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ req: Requisition; quote: Requisition['quotes'][number] } | null>(null);
  const [slipId, setSlipId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('all');

  const records = useMemo(() => [...requisitions, ...purchaseOrderHistory], [requisitions]);
  const reviewReq = requisitions.find((r) => r.id === reviewId) ?? null;
  const slipReq = requisitions.find((r) => r.id === slipId) ?? null;
  const selectedQuote = reviewReq?.quotes.find((q) => q.id === reviewReq.selectedQuoteId) ?? null;

  const stats = useMemo(
    () => ({
      total: requisitions.length,
      pending: requisitions.filter((r) => r.status === 'Quotation review').length,
      active: requisitions.filter((r) => !['Quotation review', 'Payment slip uploaded'].includes(r.status)).length,
      done: requisitions.filter((r) => r.status === 'Payment slip uploaded').length,
    }),
    [requisitions],
  );

  const areaStats = useMemo(
    () =>
      financeAreas
        .map((area) => {
          const reqs = records.filter((r) => PROJECT_AREA[r.project] === area.id);
          return {
            area,
            projects: new Set(reqs.map((r) => r.project)).size,
            total: reqs.length,
            done: reqs.filter((r) => r.status === 'Payment slip uploaded').length,
            value: reqs.reduce((sum, r) => sum + (r.quotes.find((q) => q.id === r.selectedQuoteId)?.amount ?? r.budgetCeiling), 0),
          };
        })
        .filter((row) => row.total > 0),
    [records],
  );

  const projectRows = useMemo(() => {
    if (!areaId) return [];
    const map = new Map<string, Requisition[]>();
    records
      .filter((r) => PROJECT_AREA[r.project] === areaId)
      .forEach((r) => map.set(r.project, [...(map.get(r.project) ?? []), r]));
    return Array.from(map.entries()).map(([project, reqs]) => ({
      project,
      reqs,
      pending: reqs.filter((r) => r.status === 'Quotation review').length,
      done: reqs.filter((r) => r.status === 'Payment slip uploaded').length,
      value: reqs.reduce((sum, r) => sum + (r.quotes.find((q) => q.id === r.selectedQuoteId)?.amount ?? r.budgetCeiling), 0),
    }));
  }, [areaId, records]);

  const activeReqs = useMemo(
    () => records.filter((r) => !projectId || r.project === projectId),
    [projectId, records],
  );

  const historyFiltered = useMemo(
    () =>
      records.filter((h) => {
        const q = historySearch.trim().toLowerCase();
        const matchesSearch = [h.id, h.item, h.project, h.requestedBy].some((v) => v.toLowerCase().includes(q));
        const matchesStatus = historyStatus === 'all' || h.status === historyStatus;
        return matchesSearch && matchesStatus;
      }),
    [records, historySearch, historyStatus],
  );

  const patchReq = (id: string, patch: (req: Requisition) => Partial<Requisition>) =>
    setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch(r) } : r)));

  const auditEntry = (action: string, actor: string, detail: string): ProcAuditEntry => ({
    action,
    actor,
    date: procurementStamp(),
    detail,
  });

  const createPO = (req: Requisition) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const poNo = `PO-${req.id.replace('REQ-', '')}-${Math.floor(Math.random() * 900 + 100)}`;
    patchReq(req.id, (r) => ({
      status: 'PO Created',
      purchaseOrderNo: poNo,
      audit: [...r.audit, auditEntry('Purchase order created', 'Finance Manager', `PO ${poNo} generated for ${r.quotes.find((q) => q.id === r.selectedQuoteId)?.vendor ?? 'selected vendor'}.`)],
    }));
  };

  const advance = (id: string, status: ProcurementStatus, action: string, actor: string, detail: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    patchReq(id, (r) => ({ status, audit: [...r.audit, auditEntry(action, actor, detail)] }));
  };

  const selectQuote = (quote: Requisition['quotes'][number]) => {
    if (!reviewReq || reviewReq.selectedQuoteId === quote.id) return;
    Haptics.selectionAsync().catch(() => {});
    patchReq(reviewReq.id, (r) => ({
      selectedQuoteId: quote.id,
      audit: [...r.audit, auditEntry('Quote selected', 'Finance Manager', `${quote.vendor} selected at ${formatRupees(quote.amount)} after comparison.`)],
    }));
  };

  const approveSelected = () => {
    if (!reviewReq || !selectedQuote) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    patchReq(reviewReq.id, (r) => ({
      status: 'Approved',
      audit: [...r.audit, auditEntry('Procurement approved', 'Finance Approver', `${selectedQuote.vendor} approved for ${formatRupees(selectedQuote.amount)}.`)],
    }));
  };

  const attachSlip = () => {
    if (!slipReq) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const fileName = slipReq.paymentSlip ?? `payment-slip-${slipReq.id}.pdf`;
    patchReq(slipReq.id, (r) => ({
      status: 'Payment slip uploaded',
      paymentSlip: fileName,
      audit: [...r.audit, auditEntry(r.paymentSlip ? 'Payment slip replaced' : 'Payment slip uploaded', 'Accounts Executive', `${fileName} attached after payment processing.`)],
    }));
    setSlipId(null);
  };

  const toggleExpanded = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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

  const renderRow = (req: Requisition, withActions: boolean) => {
    const quote = req.quotes.find((q) => q.id === req.selectedQuoteId);
    const isOpen = Boolean(expanded[req.id]);
    return (
      <Card key={req.id} padding={0} style={styles.requestCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleExpanded(req.id)}
          style={({ pressed }) => [styles.requestTop, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.requestBody}>
            <View style={styles.titleRow}>
              <Text style={[styles.requestItem, { color: theme.colors.text }]} numberOfLines={2}>{req.item}</Text>
              <StatusChip status={STATUS_LABELS[req.status]} tone={chipTones[req.status]} />
              {req.priority === 'High' ? <StatusChip status="High" tone="danger" dot={false} /> : null}
            </View>
            <Text style={[styles.requestSub, { color: theme.colors.brandPrimary }]}>
              {req.id} · {req.requestedBy} · {formatDate(req.date)}
            </Text>
            {req.purchaseOrderNo ? (
              <Text style={[styles.poLine, { color: theme.isDark ? '#c084fc' : '#7c3aed' }]}>PO: {req.purchaseOrderNo}</Text>
            ) : null}
          </View>
          <View style={styles.requestRight}>
            <Text style={[styles.amountValue, { color: theme.colors.text }]} numberOfLines={1}>
              {formatRupees(quote?.amount ?? req.budgetCeiling)}
            </Text>
            <Text style={[styles.amountCaption, { color: theme.colors.textSubtle }]}>{quote ? 'selected' : 'ceiling'}</Text>
          </View>
          <Icon name="ChevronDown" size={15} color={theme.colors.textMuted} style={isOpen ? styles.chevronUp : undefined} />
        </Pressable>
        {isOpen ? <ProcExpanded req={req} /> : null}
        {withActions ? (
          <View style={styles.actionRow}>
            {req.status === 'Quotation review' ? (
              <Button label="Review" icon="Scale" variant="emerald" size="sm" onPress={() => setReviewId(req.id)} />
            ) : null}
            {req.status === 'Approved' ? (
              <Button label="Create PO" icon="FileText" variant="primary" size="sm" onPress={() => createPO(req)} />
            ) : null}
            {req.status === 'PO Created' ? (
              <Button label="Send PO" icon="Send" variant="primary" size="sm" onPress={() => advance(req.id, 'PO Sent', 'Purchase order sent', 'Finance Manager', `${req.purchaseOrderNo} dispatched to vendor via email.`)} />
            ) : null}
            {req.status === 'PO Sent' ? (
              <Button label="Invoice Reminder" icon="Receipt" variant="primary" size="sm" onPress={() => advance(req.id, 'Invoice Reminder Sent', 'Invoice reminder sent', 'Accounts Executive', `Payment reminder sent to ${req.vendor}.`)} />
            ) : null}
            {req.status === 'Invoice Reminder Sent' ? (
              <Button label="Upload Payment" icon="Upload" variant="outline" size="sm" onPress={() => setSlipId(req.id)} />
            ) : null}
            {req.status === 'Payment slip uploaded' ? (
              <StatusChip status="Complete" tone="emerald" dot={false} />
            ) : null}
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.finance}
        badge={{ icon: 'ShoppingCart', label: 'Procurement' }}
        title="Procurement tracker"
        description="Manage requests by project or review the history of all procurement requests."
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
        actions={[{ label: 'Payments', icon: 'CreditCard', variant: 'white', onPress: () => navigation.navigate('Payments') }]}
      />

      <Tabs
        items={[
          { key: 'requests', label: 'Requests', icon: 'ShoppingCart', count: requisitions.length },
          { key: 'history', label: 'History', icon: 'History', count: records.length },
        ]}
        activeKey={tab}
        onChange={setTab}
        accent={theme.colors.financeAccent}
      />

      {tab === 'requests' ? (
        <View style={styles.section}>
          <View style={styles.breadcrumb}>
            <Pressable
              onPress={() => { setStep(0); setProjectId(null); setAreaId(null); }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.crumbText, step === 0 && styles.crumbActive, { color: step === 0 ? theme.colors.text : theme.colors.textMuted }]}>
                Thematic Areas
              </Text>
            </Pressable>
            {areaId ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <Pressable
                  onPress={() => { setStep(1); setProjectId(null); }}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
                >
                  <Text style={[styles.crumbText, step === 1 && styles.crumbActive, { color: step === 1 ? theme.colors.text : theme.colors.textMuted }]}>
                    {financeAreas.find((a) => a.id === areaId)?.name ?? ''}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {projectId ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <View style={styles.crumbItem}>
                  <Text numberOfLines={1} style={[styles.crumbText, styles.crumbActive, { color: theme.colors.text }]}>
                    {projectId}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {step === 0 && (
            <View style={[styles.grid, isMd && styles.gridWide]}>
              {areaStats.map(({ area, projects, total, done, value }) => (
                <ProcAreaCard
                  key={area.id}
                  name={area.name}
                  color={area.color}
                  projects={projects}
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
            <View style={styles.list}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.stepHint, { color: theme.colors.textSubtle }]}>
                  {projectRows.length} project{projectRows.length !== 1 ? 's' : ''} — select one to view requests
                </Text>
                <Button
                  label="Back to Thematic Areas"
                  icon="ChevronLeft"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setAreaId(null);
                    setStep(0);
                  }}
                />
              </View>
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
            </View>
          )}

          {step === 2 ? (
            <View style={styles.list}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.stepHint, { color: theme.colors.textSubtle }]}>
                  {activeReqs.length} request{activeReqs.length !== 1 ? 's' : ''} for {projectId}
                </Text>
                <Button
                  label="Back to Projects"
                  icon="ChevronLeft"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setProjectId(null);
                    setStep(1);
                  }}
                />
              </View>
              {activeReqs.map((req) => renderRow(req, true))}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.historyHead}>
            <Text style={[styles.historyTitle, { color: theme.colors.text }]}>Procurement request history</Text>
            <Text style={[styles.historyDesc, { color: theme.colors.textMuted }]}>
              All requests across every thematic area and project, from submission through payment. Expand a request to review its quotations and recorded events.
            </Text>
          </View>
          <View style={styles.historyFilters}>
            <TextField value={historySearch} onChangeText={setHistorySearch} placeholder="Search requests, projects or requesters" containerStyle={styles.historySearch} />
            <SelectField value={historyStatus} onChange={setHistoryStatus} options={STATUS_OPTIONS} placeholder="All statuses" containerStyle={styles.historySelect} />
          </View>
          <Text style={[styles.historyCount, { color: theme.colors.textSubtle }]}>
            {historyFiltered.length} of {records.length} requests
          </Text>
          {historyFiltered.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              {records.length ? 'No matching requests. Try another search or status filter.' : 'No procurement requests yet.'}
            </Text>
          ) : (
            <View style={styles.list}>{historyFiltered.map((h) => renderRow(h, false))}</View>
          )}
        </View>
      )}

      <ModalSheet
        visible={Boolean(reviewReq)}
        onClose={() => setReviewId(null)}
        label="Procurement approval"
        title={reviewReq?.item ?? ''}
        description={reviewReq ? `${reviewReq.id} · ${reviewReq.project} · Requested by ${reviewReq.requestedBy}` : undefined}
        size="lg"
        footer={
          <View style={styles.reviewFooter}>
            <View style={styles.reviewFooterLeft}>
              <Text style={[styles.footerCaption, { color: theme.colors.textSubtle }]}>Selected quotation</Text>
              <Text numberOfLines={1} style={[styles.footerValue, { color: theme.colors.text }]}>
                {selectedQuote ? `${selectedQuote.vendor} · ${formatRupees(selectedQuote.amount)}` : 'Select one of the three quotations'}
              </Text>
            </View>
            <Button label="Close" variant="outline" size="sm" onPress={() => setReviewId(null)} />
            <Button
              label={reviewReq?.status === 'Quotation review' ? 'Approve selected quotation' : 'Request approved'}
              icon="CheckCircle2"
              variant="emerald"
              size="sm"
              disabled={!selectedQuote || reviewReq?.status !== 'Quotation review'}
              onPress={approveSelected}
            />
          </View>
        }
      >
        {reviewReq ? (
          <>
            <View style={styles.statGrid}>
              <SpecTile label="Budget ceiling" value={formatRupees(reviewReq.budgetCeiling)} />
              <SpecTile label="Quantity" value={reviewReq.quantity} />
              <SpecTile label="Department" value={reviewReq.department} />
              <SpecTile label="Status" value={STATUS_LABELS[reviewReq.status]} />
            </View>
            <View style={[styles.specBox, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
              <Text style={[styles.specBoxLabel, { color: theme.colors.textSubtle }]}>Procurement specification</Text>
              <Text style={[styles.specBoxText, { color: theme.colors.textMuted }]}>{reviewReq.specification}</Text>
            </View>
            <View style={styles.compareHead}>
              <View style={[styles.compareIcon, { backgroundColor: theme.colors.infoSoft }]}>
                <Icon name="Scale" size={17} color={theme.colors.infoText} />
              </View>
              <View style={styles.compareHeadText}>
                <Text style={[styles.compareTitle, { color: theme.colors.text }]}>Compare three quotations</Text>
                <Text style={[styles.compareSub, { color: theme.colors.textSubtle }]}>Select the best-value compliant quotation before approval.</Text>
              </View>
            </View>
            <View style={[styles.quoteRow, !isMd && { flexDirection: 'column' }]}>
              {reviewReq.quotes.map((quote) => {
                const lowest = Math.min(...reviewReq.quotes.map((q) => q.amount));
                return (
                  <ReviewQuoteCard
                    key={quote.id}
                    quote={quote}
                    ceiling={reviewReq.budgetCeiling}
                    selected={quote.id === reviewReq.selectedQuoteId}
                    lowest={quote.amount === lowest}
                    canSelect={reviewReq.status === 'Quotation review'}
                    onView={() => setPreview({ req: reviewReq, quote })}
                    onSelect={() => selectQuote(quote)}
                  />
                );
              })}
            </View>
            <Text style={[styles.auditTitle, { color: theme.colors.text }]}>Audit trail</Text>
            <Timeline
              items={reviewReq.audit.map((entry, index) => ({
                key: `${entry.action}-${index}`,
                title: entry.action,
                actor: entry.actor,
                detail: entry.detail,
                time: entry.date,
              }))}
              accent={theme.colors.financeAccent}
            />
          </>
        ) : null}
      </ModalSheet>

      <ModalSheet
        visible={Boolean(preview)}
        onClose={() => setPreview(null)}
        label="Uploaded vendor quotation"
        title={preview?.quote.vendor ?? ''}
        description={preview ? `${preview.quote.id} · ${preview.quote.file}` : undefined}
        size="md"
        footer={<Button label="Close quotation" variant="primary" onPress={() => setPreview(null)} />}
      >
        {preview ? <QuoteDocument req={preview.req} quote={preview.quote} /> : null}
      </ModalSheet>

      <ModalSheet
        visible={Boolean(slipReq)}
        onClose={() => setSlipId(null)}
        label="Post-approval payment evidence"
        title="Upload payment slip"
        description={slipReq ? `${slipReq.id} · ${slipReq.item}` : undefined}
        size="sm"
        footer={
          <View style={styles.slipFooter}>
            <Button label="Close" variant="outline" size="sm" onPress={() => setSlipId(null)} />
            <Button label="Attach & mark complete" icon="CheckCircle2" variant="emerald" size="sm" onPress={attachSlip} />
          </View>
        }
      >
        {slipReq ? (
          <>
            <View style={[styles.dropzone, { borderColor: theme.colors.brandRing, backgroundColor: theme.colors.brandSoft }]}>
              <View style={[styles.dropIcon, { backgroundColor: theme.colors.infoSoft }]}>
                <Icon name="Upload" size={16} color={theme.colors.infoText} />
              </View>
              <View style={styles.dropText}>
                <Text numberOfLines={1} style={[styles.dropTitle, { color: theme.colors.text }]}>
                  {slipReq.paymentSlip ?? 'Upload payment slip'}
                </Text>
                <Text style={[styles.dropSub, { color: theme.colors.textSubtle }]}>PDF, JPG or PNG · Maximum 10 MB</Text>
              </View>
            </View>
            <Text style={[styles.notice, { color: theme.colors.textMuted }]}>
              Demo build — attaching simulates the upload, records the audit entry and marks the request Complete.
            </Text>
          </>
        ) : null}
      </ModalSheet>
    </View>
  );
};

const SpecTile: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const QuoteDocument: React.FC<{ req: Requisition; quote: Requisition['quotes'][number] }> = ({ req, quote }) => {
  const { theme } = useTheme();
  const subtotal = quote.amount / 1.18;
  return (
    <View style={[styles.paper, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
      <View style={[styles.paperHead, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.paperHeadLeft}>
          <Text style={[styles.paperVendor, { color: theme.colors.text }]}>{quote.vendor}</Text>
          <Text style={[styles.paperSub, { color: theme.colors.textSubtle }]}>GST-registered procurement vendor</Text>
        </View>
        <StatusChip status="QUOTATION" tone="info" dot={false} />
      </View>
      <View style={styles.paperGrid}>
        <PaperField label="Quotation number" value={quote.id} />
        <PaperField label="Quotation date" value={formatDate(req.date)} />
        <PaperField label="Issued to" value="Pantiss Foundation" />
        <PaperField label="Project" value={req.project} />
      </View>
      <View style={[styles.paperLine, { borderColor: theme.colors.border }]}>
        <View style={[styles.paperLineHead, { backgroundColor: theme.colors.surfaceSoft }]}>
          <Text style={[styles.paperColLabel, { color: theme.colors.textSubtle }]}>Description</Text>
          <Text style={[styles.paperColLabel, { color: theme.colors.textSubtle }]}>Amount</Text>
        </View>
        <View style={styles.paperLineBody}>
          <View style={styles.paperLineDesc}>
            <Text style={[styles.paperLineTitle, { color: theme.colors.text }]}>{req.item}</Text>
            <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>{req.specification}</Text>
            <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>Quantity: {req.quantity}</Text>
          </View>
          <Text style={[styles.paperLineAmount, { color: theme.colors.text }]}>{formatRupees(quote.amount)}</Text>
        </View>
      </View>
      <View style={styles.totals}>
        <View style={styles.totalsRow}>
          <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>Subtotal</Text>
          <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>{formatRupees(subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>GST {quote.gstIncluded ? '(included)' : '(extra)'}</Text>
          <Text style={[styles.paperSub, { color: theme.colors.textMuted }]}>
            {quote.gstIncluded ? formatRupees(quote.amount - subtotal) : 'As applicable'}
          </Text>
        </View>
        <View style={[styles.totalsRow, styles.totalsFinal, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{formatRupees(quote.amount)}</Text>
        </View>
      </View>
      <View style={styles.paperTiles}>
        <PaperField label="Delivery" value={`${quote.deliveryDays} days`} />
        <PaperField label="Warranty" value={quote.warranty} />
        <PaperField label="Technical score" value={`${quote.technicalScore}/100`} />
      </View>
      <View style={[styles.paperFoot, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.paperSub, { color: theme.colors.textSubtle }]}>Authorized vendor signature</Text>
        <Text style={[styles.paperSub, { color: theme.colors.textSubtle }]}>Valid for 30 days</Text>
      </View>
      <View style={[styles.paperFoot, { borderTopColor: theme.colors.border }]}>
        <Text numberOfLines={1} style={[styles.paperSub, { color: theme.colors.textSubtle }]}>{quote.file}</Text>
        <Text style={[styles.paperSub, { color: theme.colors.textSubtle }]}>Uploaded through Pantiss ERP</Text>
      </View>
    </View>
  );
};

const PaperField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.paperField}>
      <Text style={[styles.paperFieldLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.paperFieldValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const GlassChip: React.FC<{ value: string }> = ({ value }) => (
  <View style={styles.glassChip}>
    <Text style={styles.glassChipText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 16 },
  glassChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  glassChip: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexGrow: 1 },
  glassChipText: { color: '#ffffff', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  section: { gap: 14 },
  breadcrumb: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingVertical: 4 },
  crumbItem: { paddingVertical: 4, paddingHorizontal: 4 },
  crumb: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 220 },
  crumbText: { fontSize: 12, fontWeight: '500' },
  crumbActive: { fontWeight: '700' },
  stepHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  stepHint: { fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'wrap' },
  list: { gap: 12 },
  requestCard: { gap: 0, overflow: 'hidden', borderRadius: 16 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  requestBody: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  requestItem: { fontSize: 13.5, fontWeight: '700', lineHeight: 18, flexShrink: 1 },
  requestSub: { fontSize: 11, fontWeight: '600' },
  poLine: { fontSize: 11, fontWeight: '700' },
  requestRight: { alignItems: 'flex-end', gap: 2 },
  amountValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  amountCaption: { fontSize: 9.5 },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128, 144, 168, 0.16)', padding: 14, paddingTop: 12 },
  historyHead: { gap: 4 },
  historyTitle: { fontSize: 16, fontWeight: '700' },
  historyDesc: { fontSize: 12, lineHeight: 17 },
  historyFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historySearch: { flexGrow: 1, flexBasis: 220 },
  historySelect: { flexGrow: 1, flexBasis: 170 },
  historyCount: { fontSize: 11.5, fontWeight: '600' },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: { flexGrow: 1, flexBasis: '45%', minWidth: 130, borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  statValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  specBox: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  specBoxLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  specBoxText: { fontSize: 12, lineHeight: 17 },
  compareHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  compareIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  compareHeadText: { flex: 1, minWidth: 0 },
  compareTitle: { fontSize: 14, fontWeight: '700' },
  compareSub: { fontSize: 10.5, marginTop: 1 },
  quoteRow: { flexDirection: 'row', gap: 10 },
  auditTitle: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  reviewFooter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewFooterLeft: { flex: 1, minWidth: 0 },
  footerCaption: { fontSize: 9.5 },
  footerValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  slipFooter: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  dropzone: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', padding: 14 },
  dropIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dropText: { flex: 1, minWidth: 0, gap: 2 },
  dropTitle: { fontSize: 12.5, fontWeight: '700' },
  dropSub: { fontSize: 10.5 },
  notice: { fontSize: 11.5, lineHeight: 16 },
  paper: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 14 },
  paperHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, paddingBottom: 12 },
  paperHeadLeft: { flex: 1, minWidth: 0 },
  paperVendor: { fontSize: 15, fontWeight: '700' },
  paperSub: { fontSize: 10.5, marginTop: 2 },
  paperGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  paperField: { flexBasis: '45%', flexGrow: 1, minWidth: 120, gap: 3 },
  paperFieldLabel: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  paperFieldValue: { fontSize: 12, fontWeight: '700' },
  paperLine: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  paperLineHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9 },
  paperColLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  paperLineBody: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(128, 144, 168, 0.16)' },
  paperLineDesc: { flex: 1, minWidth: 0 },
  paperLineTitle: { fontSize: 12.5, fontWeight: '700' },
  paperLineAmount: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  totals: { alignSelf: 'stretch', marginLeft: 'auto', width: 200, gap: 6 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalsFinal: { borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  paperTiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paperFoot: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, paddingTop: 10 },
});
