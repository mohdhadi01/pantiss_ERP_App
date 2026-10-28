import { useState, useEffect, useCallback } from 'react';
import { HRState } from './types';
import { createInitialHRState } from './seed';
import { storage } from '../../utils/storage';

const HR_STORAGE_KEY = 'hr_workspace_state_v2';

export function useHRStore() {
  const [data, setData] = useState<HRState>(createInitialHRState());
  const [notice, setNotice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const saved = await storage.get<HRState | null>(HR_STORAGE_KEY, null);
      if (saved && Array.isArray(saved.employees)) {
        setData(saved);
      } else {
        setData(createInitialHRState());
      }
    } catch {
      setError('Saved HR records could not be loaded. Showing default sample data.');
      setData(createInitialHRState());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const commit = async (
    transform: (current: HRState) => HRState,
    successMessage?: string
  ): Promise<boolean> => {
    try {
      const nextState = transform(data);
      setData(nextState);
      await storage.set(HR_STORAGE_KEY, nextState);
      if (successMessage) {
        setNotice(successMessage);
      }
      setError('');
      return true;
    } catch (err: any) {
      setError(err.message || 'Operation failed. Check inputs and try again.');
      return false;
    }
  };

  return {
    data,
    loading,
    notice,
    error,
    commit,
    setNotice,
    setError,
  };
}

export type HRStore = ReturnType<typeof useHRStore>;
