import { useCallback, useEffect, useState } from 'react';
import { storage } from '../../../utils/storage';

/**
 * Persisted budget drafts (web localStorage `pantiss:finance-budget-drafts`,
 * FinanceOperationsViews.tsx:23-73). "Save as draft" writes here and the
 * project drill's "Budget documents and workflow" section lists the versions.
 */

export type BudgetStatus = 'Draft' | 'Pending approval' | 'Changes requested' | 'Approved';

export interface BudgetDraftLine {
  name: string;
  quantity: number;
  rate: number;
}

export interface BudgetHistoryEntry {
  action: string;
  actor: string;
  date: string;
  note?: string;
}

export interface BudgetDraft {
  id: string;
  areaId: string;
  projectId: string;
  title: string;
  fiscalYear: string;
  fundingSource: string;
  created: string;
  currency: string;
  trackingMethod: string;
  threshold: string;
  notes: string;
  lines: BudgetDraftLine[];
  status: BudgetStatus;
  history: BudgetHistoryEntry[];
}

const DRAFTS_STORAGE_KEY = 'finance_budget_drafts_v1';

export function useBudgetDrafts() {
  const [drafts, setDrafts] = useState<BudgetDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await storage.get<BudgetDraft[] | null>(DRAFTS_STORAGE_KEY, null);
        if (mounted && saved && Array.isArray(saved)) setDrafts(saved);
      } catch {
        // seeds already in place
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: BudgetDraft[]) => {
    setDrafts(next);
    await storage.set(DRAFTS_STORAGE_KEY, next);
  }, []);

  const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const addDraft = useCallback(
    async (draft: Omit<BudgetDraft, 'id' | 'status' | 'history'>) => {
      const next: BudgetDraft = {
        ...draft,
        id: `BUD-${Date.now().toString(36).toUpperCase()}`,
        status: 'Draft',
        history: [{ action: 'Draft created', actor: 'Finance Manager', date: today() }],
      };
      await persist([next, ...drafts]);
      return next;
    },
    [drafts, persist],
  );

  const updateDraft = useCallback(
    async (id: string, changes: Partial<BudgetDraft>) => {
      await persist(drafts.map((draft) => (draft.id === id ? { ...draft, ...changes } : draft)));
    },
    [drafts, persist],
  );

  /** Draft / Changes requested → Pending approval. */
  const submitForApproval = useCallback(
    (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      if (!draft) return;
      void updateDraft(id, {
        status: 'Pending approval',
        history: [...draft.history, { action: 'Submitted for approval', actor: 'Finance Manager', date: today() }],
      });
    },
    [drafts, updateDraft],
  );

  /** Pending approval → Changes requested. */
  const returnForRevision = useCallback(
    (id: string, note?: string) => {
      const draft = drafts.find((d) => d.id === id);
      if (!draft) return;
      void updateDraft(id, {
        status: 'Changes requested',
        history: [...draft.history, { action: 'Changes requested', actor: 'Finance Approver', date: today(), note }],
      });
    },
    [drafts, updateDraft],
  );

  /** Pending approval → Approved. */
  const approveBudget = useCallback(
    (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      if (!draft) return;
      void updateDraft(id, {
        status: 'Approved',
        history: [...draft.history, { action: 'Budget approved', actor: 'Finance Approver', date: today() }],
      });
    },
    [drafts, updateDraft],
  );

  return { drafts, loading, addDraft, updateDraft, submitForApproval, returnForRevision, approveBudget };
}
