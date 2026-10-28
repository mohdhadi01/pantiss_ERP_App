import { Share } from 'react-native';

/**
 * Web-parity CSV export (web `src/features/hr/data.ts exportCSV`): quotes every
 * cell, neutralises spreadsheet formula injection and joins with CRLF. On
 * mobile there is no download link, so the CSV text is handed to the OS share
 * sheet (save to Files / email) instead.
 */
export async function exportCsv(filename: string, rows: (string | number)[][]): Promise<void> {
  const cell = (value: string | number) =>
    `"${String(value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(cell).join(',')).join('\r\n');
  await Share.share({
    title: `${filename}.csv`,
    message: csv,
  });
}
