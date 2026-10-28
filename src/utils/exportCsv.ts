import { Share } from 'react-native';
import { storage } from './storage';

export interface ExportCsvResult {
  ok: boolean;
  /** User-facing notice line (web sets a status notice after the download). */
  message: string;
}

function csvCell(value: string | number): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC-4180-style CSV string: header row + one line per record. */
export function buildCsv(headers: string[], rows: Array<Array<string | number>>): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/**
 * Web parity for the register "Export CSV" buttons (Books, ledger, salary…).
 * Uses the React Native share sheet when available (no extra deps); falls
 * back to AsyncStorage when sharing is unavailable or cancelled by the OS.
 */
export async function exportCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
): Promise<ExportCsvResult> {
  const csv = buildCsv(headers, rows);
  try {
    if (Share && typeof Share.share === 'function') {
      await Share.share({ title: filename, message: csv });
      return { ok: true, message: `${rows.length} rows exported as ${filename}.` };
    }
  } catch {
    // Share sheet unavailable (web / TV) — persist locally instead.
  }
  const saved = await storage.set(`csv_exports:${filename}`, csv);
  return saved
    ? { ok: true, message: `${filename} saved to local app storage (${rows.length} rows).` }
    : { ok: false, message: 'Export failed — local storage is unavailable.' };
}
