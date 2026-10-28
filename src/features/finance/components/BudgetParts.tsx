import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { FinanceArea, FinanceProject } from '../data';
import { budgetCategories, allocationShares } from '../budgetCategories';
import { formatRupees } from '../../../utils/formatCurrency';
import { BudgetDraft } from '../data/budgetDraftsStore';
import { SectionCard } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';

/**
 * Web "Budget documents and workflow" (FinanceOperationsViews.tsx:101-180):
 * approved version row, draft version cards with approval transitions and the
 * budget comparison table.
 */

const statusChipTone = (status: BudgetDraft['status']) =>
  status === 'Approved' ? 'success' : status === 'Pending approval' ? 'info' : status === 'Changes requested' ? 'warning' : 'neutral';

interface ComparisonRow {
  name: string;
  approved: number | null;
  draft: number | null;
}

const COMPARE_COLUMNS: Array<DataColumn<ComparisonRow>> = [
  { key: 'name', label: 'Cost head', flex: 1.6 },
  { key: 'approved', label: 'Approved', flex: 1.1, align: 'right' },
  { key: 'draft', label: 'Draft', flex: 1.1, align: 'right' },
  { key: 'variance', label: 'Variance', flex: 1.2, align: 'right' },
];

export const BudgetWorkflowSection: React.FC<{
  area: FinanceArea;
  project: FinanceProject;
  drafts: BudgetDraft[];
  onSubmit: (id: string) => void;
  onReturn: (id: string) => void;
  onApprove: (id: string) => void;
  onNotify: (message: string) => void;
}> = ({ area, project, drafts, onSubmit, onReturn, onApprove, onNotify }) => {
  const { theme } = useTheme();
  const [compareId, setCompareId] = useState<string | null>(null);
  const compareDraft = drafts.find((draft) => draft.id === compareId) ?? null;

  const approvedLines = useMemo(
    () => budgetCategories.map((category) => ({ name: category, amount: project.approved * allocationShares[category] })),
    [project.approved],
  );

  return (
    <SectionCard
      title="Budget documents and workflow"
      description="Preview, compare, download and move budget versions through approval"
    >
      <View style={styles.rows}>
        {/* Approved version row (web ProjectBudgetDetail approvedPdf row) */}
        <View style={[styles.versionRow, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
          <View style={styles.versionInfo}>
            <Text style={[styles.versionTitle, { color: theme.colors.text }]}>Approved budget · Version 1.0</Text>
            <Text style={[styles.versionSub, { color: theme.colors.textSubtle }]}>FY 2026–27 · Approved 02 Apr 2026</Text>
          </View>
          <View style={styles.versionActions}>
            <StatusChip status="Approved" tone="success" dot={false} />
            <View style={styles.actionRow}>
              <Button
                label="Preview"
                icon="Eye"
                variant="outline"
                size="sm"
                onPress={() => onNotify('Budget PDF preview opens in the desktop build.')}
              />
              <Button
                label="Summary"
                icon="Download"
                variant="secondary"
                size="sm"
                onPress={() => onNotify('Budget allocation summary export queued.')}
              />
              <Button
                label="Full report"
                icon="Download"
                variant="emerald"
                size="sm"
                onPress={() => onNotify('Full budget report export queued.')}
              />
            </View>
          </View>
        </View>

        {drafts.map((draft) => {
          const total = draft.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
          const owner =
            draft.status === 'Pending approval'
              ? 'Finance Approver'
              : draft.status === 'Approved'
                ? 'Finance Control'
                : 'Budget Owner';
          return (
            <View key={draft.id} style={[styles.versionRow, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
              <View style={styles.versionInfo}>
                <Text style={[styles.versionTitle, { color: theme.colors.text }]}>{draft.title}</Text>
                <Text style={[styles.versionSub, { color: theme.colors.textSubtle }]} numberOfLines={2}>
                  {draft.fiscalYear} · {draft.fundingSource} · {draft.lines.length} custom cost heads · {formatRupees(Math.round(total))}
                </Text>
              </View>
              <View style={styles.versionActions}>
                <View style={styles.actionRow}>
                  <StatusChip status={draft.status} tone={statusChipTone(draft.status)} dot={false} />
                  <Button label="Compare" icon="GitCompareArrows" variant="secondary" size="sm" onPress={() => setCompareId(draft.id)} />
                </View>
              </View>
              <View style={[styles.ownerRow, { borderTopColor: theme.colors.border }]}>
                <View style={styles.ownerBlock}>
                  <Text style={[styles.ownerLabel, { color: theme.colors.textSubtle }]}>Current owner</Text>
                  <Text style={[styles.ownerValue, { color: theme.colors.text }]}>{owner}</Text>
                </View>
                <View style={styles.ownerBlock}>
                  <Text style={[styles.ownerLabel, { color: theme.colors.textSubtle }]}>Approval timeline</Text>
                  <View style={styles.historyRow}>
                    {draft.history.map((entry, index) => (
                      <View key={`${entry.action}-${index}`} style={[styles.historyChip, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                        <Text style={[styles.historyText, { color: theme.colors.textSubtle }]} numberOfLines={1}>
                          {entry.action} · {entry.date}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              {(draft.status === 'Draft' || draft.status === 'Changes requested' || draft.status === 'Pending approval') && (
                <View style={styles.transitionRow}>
                  {(draft.status === 'Draft' || draft.status === 'Changes requested') && (
                    <Button label="Submit for approval" icon="Send" variant="primary" size="sm" onPress={() => onSubmit(draft.id)} />
                  )}
                  {draft.status === 'Pending approval' && (
                    <>
                      <Button label="Return for revision" variant="outline" size="sm" onPress={() => onReturn(draft.id)} />
                      <Button label="Approve budget" icon="CheckCircle2" variant="emerald" size="sm" onPress={() => onApprove(draft.id)} />
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {!drafts.length ? (
          <Text style={[styles.emptyHint, { color: theme.colors.textMuted }]}>
            No draft versions yet — create a budget and &ldquo;Save as draft&rdquo; to start a revision workflow.
          </Text>
        ) : null}
      </View>

      {compareDraft ? (
        <ComparisonSheet
          area={area}
          project={project}
          draft={compareDraft}
          approvedLines={approvedLines}
          onClose={() => setCompareId(null)}
        />
      ) : null}
    </SectionCard>
  );
};

const ComparisonSheet: React.FC<{
  area: FinanceArea;
  project: FinanceProject;
  draft: BudgetDraft;
  approvedLines: Array<{ name: string; amount: number }>;
  onClose: () => void;
}> = ({ area, project, draft, approvedLines, onClose }) => {
  const { theme } = useTheme();
  const draftLines = draft.lines.map((line) => ({ name: line.name || 'Unnamed cost head', amount: line.quantity * line.rate }));
  const rows: ComparisonRow[] = [
    ...new Set([...approvedLines.map((l) => l.name), ...draftLines.map((l) => l.name)]),
  ].map((name) => ({
    name,
    approved: approvedLines.find((l) => l.name === name)?.amount ?? null,
    draft: draftLines.find((l) => l.name === name)?.amount ?? null,
  }));
  const approvedTotal = rows.reduce((sum, row) => sum + (row.approved ?? 0), 0);
  const draftTotal = rows.reduce((sum, row) => sum + (row.draft ?? 0), 0);
  const variance = draftTotal - approvedTotal;

  const renderCompareCell = (row: ComparisonRow, col: DataColumn<ComparisonRow>) => {
    switch (col.key) {
      case 'name':
        return <Text style={[styles.compareName, { color: theme.colors.text }]} numberOfLines={1}>{row.name}</Text>;
      case 'approved':
        return <Text style={[styles.compareValue, { color: theme.colors.textMuted }]}>{row.approved !== null ? formatRupees(Math.round(row.approved)) : '—'}</Text>;
      case 'draft':
        return <Text style={[styles.compareValue, { color: theme.colors.textMuted }]}>{row.draft !== null ? formatRupees(Math.round(row.draft)) : '—'}</Text>;
      case 'variance': {
        const diff = (row.draft ?? 0) - (row.approved ?? 0);
        const change = row.approved === null ? 'Added' : row.draft === null ? 'Removed' : Math.abs(diff) < 0.001 ? 'Unchanged' : 'Changed';
        return (
          <View style={styles.varianceCell}>
            <Text style={[styles.compareValue, { color: diff > 0 ? theme.colors.dangerText : theme.colors.successText }]}>
              {diff >= 0 ? '+' : '-'}
              {formatRupees(Math.round(Math.abs(diff)))}
            </Text>
            <Text style={[styles.varianceChange, { color: theme.colors.textSubtle }]}>{change}</Text>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <ModalSheet
      visible
      onClose={onClose}
      label="Version comparison"
      title={`Approved budget vs ${draft.title}`}
      description={`${area.name} · ${project.id} — added, removed and changed cost heads are highlighted below.`}
      size="lg"
      footer={<Button label="Close" variant="outline" onPress={onClose} />}
    >
      <View style={styles.compareStats}>
        {[
          ['Approved total', formatRupees(Math.round(approvedTotal))],
          ['Draft total', formatRupees(Math.round(draftTotal))],
          ['Net variance', `${variance >= 0 ? '+' : '-'}${formatRupees(Math.round(Math.abs(variance)))}`],
        ].map(([statLabel, value]) => (
          <View key={statLabel} style={[styles.compareStat, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[styles.compareStatLabel, { color: theme.colors.textSubtle }]}>{statLabel}</Text>
            <Text style={[styles.compareStatValue, { color: theme.colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>
      <DataTable
        columns={COMPARE_COLUMNS}
        rows={rows}
        keyExtractor={(row) => row.name}
        renderCell={renderCompareCell}
        renderMobileCard={(row) => (
          <View style={[styles.compareMobile, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
            <View style={styles.compareMobileHead}>
              <Text style={[styles.compareName, { color: theme.colors.text }]} numberOfLines={1}>{row.name}</Text>
              {renderCompareCell(row, COMPARE_COLUMNS[3])}
            </View>
            <View style={styles.compareMobileRow}>
              <Text style={[styles.compareStatLabel, { color: theme.colors.textSubtle }]}>Approved</Text>
              {renderCompareCell(row, COMPARE_COLUMNS[1])}
            </View>
            <View style={styles.compareMobileRow}>
              <Text style={[styles.compareStatLabel, { color: theme.colors.textSubtle }]}>Draft</Text>
              {renderCompareCell(row, COMPARE_COLUMNS[2])}
            </View>
          </View>
        )}
        emptyTitle="Nothing to compare"
        emptyDescription="This draft has no cost heads."
      />
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  rows: { gap: 12 },
  versionRow: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  versionInfo: { gap: 3 },
  versionTitle: { fontSize: 13, fontWeight: '600' },
  versionSub: { fontSize: 11, lineHeight: 15 },
  versionActions: { gap: 8 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  ownerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  ownerBlock: { flexGrow: 1, flexBasis: '40%', minWidth: 130, gap: 5 },
  ownerLabel: { fontSize: 9.5, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  ownerValue: { fontSize: 11.5, fontWeight: '600' },
  historyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  historyChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, maxWidth: '100%' },
  historyText: { fontSize: 9.5 },
  transitionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  emptyHint: { fontSize: 12, lineHeight: 17 },
  compareStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  compareStat: { flexGrow: 1, flexBasis: '30%', minWidth: 120, borderRadius: 12, padding: 13, gap: 3 },
  compareStatLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  compareStatValue: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  compareName: { fontSize: 12.5, fontWeight: '600' },
  compareValue: { fontSize: 12, fontVariant: ['tabular-nums'] },
  varianceCell: { alignItems: 'flex-end', gap: 1 },
  varianceChange: { fontSize: 9.5 },
  compareMobile: { borderWidth: 1, borderRadius: 14, padding: 13, gap: 9 },
  compareMobileHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  compareMobileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
});
