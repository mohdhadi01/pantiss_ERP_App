import { Share } from 'react-native';
import { storage } from './storage';

export interface ExportCsvResult {
  ok: boolean;
  message: string;
}

function csvCell(value: string | number): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export async function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
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
