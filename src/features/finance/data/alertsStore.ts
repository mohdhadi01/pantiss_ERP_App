import { useState, useEffect, useCallback } from 'react';
import { FinanceAlert, financeAlertSeeds } from './alertsData';
import { storage } from '../../../utils/storage';

const ALERTS_STORAGE_KEY = 'finance_alerts_v2';

/**
 * Persisted finance alerts store. The unread count feeds the header bell
 * across every Finance screen (web: amber dot → /finance/alerts).
 */
export function useFinanceAlerts() {
  const [alerts, setAlerts] = useState<FinanceAlert[]>(financeAlertSeeds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await storage.get<FinanceAlert[] | null>(ALERTS_STORAGE_KEY, null);
        if (mounted && saved && Array.isArray(saved)) setAlerts(saved);
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

  const persist = useCallback(async (next: FinanceAlert[]) => {
    setAlerts(next);
    await storage.set(ALERTS_STORAGE_KEY, next);
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      persist(alerts.filter((a) => a.id !== id));
    },
    [alerts, persist],
  );

  const markAllRead = useCallback(() => {
    persist(alerts.map((a) => ({ ...a, unread: false })));
  }, [alerts, persist]);

  const unreadCount = alerts.filter((a) => a.unread).length;

  return { alerts, loading, unreadCount, dismiss, markAllRead };
}
