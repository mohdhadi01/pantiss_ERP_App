import { useState, useEffect, useCallback } from 'react';
import {
  BookEntry,
  TallySettings,
  defaultTallySettings,
  sampleBookEntries,
} from './booksData';
import { storage } from '../../utils/storage';

const BOOKS_STORAGE_KEY = 'finance_books_entries_v2';
const TALLY_SETTINGS_STORAGE_KEY = 'finance_tally_settings_v1';

export function useBooksStore() {
  const [entries, setEntries] = useState<BookEntry[]>(sampleBookEntries);
  const [settings, setSettings] = useState<TallySettings>(defaultTallySettings);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const savedEntries = await storage.get<BookEntry[] | null>(
        BOOKS_STORAGE_KEY,
        null
      );
      if (savedEntries && Array.isArray(savedEntries)) {
        setEntries(savedEntries);
      } else {
        setEntries(sampleBookEntries);
      }
      const savedSettings = await storage.get<Partial<TallySettings> | null>(
        TALLY_SETTINGS_STORAGE_KEY,
        null
      );
      if (savedSettings && typeof savedSettings === 'object') {
        setSettings({ ...defaultTallySettings, ...savedSettings });
      }
    } catch {
      setEntries(sampleBookEntries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEntry = async (entry: Omit<BookEntry, 'id'>) => {
    const newEntry: BookEntry = {
      ...entry,
      id: `VCH-${new Date().getFullYear()}-${String(entries.length + 1).padStart(3, '0')}`,
    };
    const next = [newEntry, ...entries];
    setEntries(next);
    await storage.set(BOOKS_STORAGE_KEY, next);
    return newEntry;
  };

  const deleteEntry = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    await storage.set(BOOKS_STORAGE_KEY, next);
  };

  const saveSettings = async (next: TallySettings) => {
    setSettings(next);
    await storage.set(TALLY_SETTINGS_STORAGE_KEY, next);
  };

  return {
    entries,
    settings,
    loading,
    addEntry,
    deleteEntry,
    setSettings,
    saveSettings,
  };
}
