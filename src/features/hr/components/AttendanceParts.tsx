/**
 * Sub-components + import plumbing for AttendanceView (web-parity UI only).
 * Web reference: Pantiss_ERP/src/features/hr/AttendanceView.tsx.
 */
import React, { useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { AttendanceRecord, Employee, Punch } from '../types';
import { isDate } from '../helpers';

/** Web `timestampLabel`: "{day} {mon}, hh:mm AM/PM" in IST. */
export function timestampLabel(value?: string): string {
  if (!value) return 'Not received';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

/** Web `formatExample` — integration-format JSON sample (web AttendanceView.tsx:42). */
export function formatExample(employeeId?: string): string {
  return JSON.stringify(
    [
      {
        id: 'PUNCH-001',
        employeeId,
        date: '2026-10-09',
        punchIn: {
          time: '2026-10-09T09:20:00+05:30',
          latitude: 20.844,
          longitude: 85.151,
          accuracy: 15,
          photoUrl: 'https://your-platform.example/punch-in.jpg',
        },
        punchOut: {
          time: '2026-10-09T18:00:00+05:30',
          latitude: 20.844,
          longitude: 85.151,
          accuracy: 12,
          photoUrl: 'https://your-platform.example/punch-out.jpg',
        },
      },
    ],
    null,
    2,
  );
}

/** Compact port of web `parseAttendance` (web model.ts:552-577). */
export function parseAttendance(text: string, employees: Employee[]): AttendanceRecord[] {
  const rows: unknown = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length > 5000 || rows.length === 0) {
    throw new Error('Upload a JSON array containing 1–5,000 attendance records.');
  }
  const keys = new Set<string>();
  return rows.map((row: unknown) => {
    if (!row || typeof row !== 'object') throw new Error('Invalid attendance record.');
    const r = row as Record<string, unknown>;
    if (
      typeof r.id !== 'string' ||
      !r.id.trim() ||
      typeof r.employeeId !== 'string' ||
      !employees.some((e) => e.id === r.employeeId) ||
      typeof r.date !== 'string' ||
      !isDate(r.date)
    ) {
      throw new Error('Each record needs an ID, a known employee ID and a valid date.');
    }
    const key = `${r.employeeId}:${r.date}`;
    if (keys.has(key)) {
      throw new Error('Only one daily punch pair per employee is supported; remove duplicate employee/date entries.');
    }
    keys.add(key);
    const punch = (value: unknown): Punch | undefined => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== 'object') throw new Error('Invalid punch evidence.');
      const p = value as Record<string, unknown>;
      if (
        typeof p.time !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(p.time) ||
        Number.isNaN(Date.parse(p.time)) ||
        typeof p.latitude !== 'number' ||
        Math.abs(p.latitude) > 90 ||
        typeof p.longitude !== 'number' ||
        Math.abs(p.longitude) > 180 ||
        typeof p.accuracy !== 'number' ||
        p.accuracy < 0 ||
        ![p.latitude, p.longitude, p.accuracy].every(Number.isFinite)
      ) {
        throw new Error('Punch evidence requires a timestamp with timezone, valid GPS coordinates and accuracy in metres.');
      }
      if (p.photoUrl !== undefined && (typeof p.photoUrl !== 'string' || !/^https:\/\/[^\s]+$/.test(p.photoUrl))) {
        throw new Error('Photo URLs must use HTTPS.');
      }
      return { time: p.time, latitude: p.latitude, longitude: p.longitude, accuracy: p.accuracy, photoUrl: p.photoUrl as string };
    };
    const punchIn = punch(r.punchIn);
    const punchOut = punch(r.punchOut);
    if (!punchIn && !punchOut) throw new Error('Include at least one punch event per record.');
    if (punchIn && punchOut && Date.parse(punchOut.time) <= Date.parse(punchIn.time)) {
      throw new Error('Punch-out must be after punch-in.');
    }
    return { id: r.id, employeeId: r.employeeId, date: r.date, punchIn, punchOut, source: 'Platform export' };
  });
}

/* ------------------------------- Evidence card ------------------------------ */

export const PunchEvidenceCard: React.FC<{ title: string; punch?: Punch }> = ({ title, punch }) => {
  const { theme } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(punch?.photoUrl) && !imageFailed;
  return (
    <View style={[styles.evidenceCard, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.evidenceTitle, { color: theme.colors.textSubtle }]}>{title}</Text>
      <Text style={[styles.evidenceTime, { color: theme.colors.text }]}>{timestampLabel(punch?.time)}</Text>
      <View
        style={[
          styles.photoBox,
          { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.visualBg },
        ]}
      >
        {showPhoto ? (
          <Image
            source={{ uri: punch!.photoUrl! }}
            style={styles.photo}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityLabel={`${title} photo supplied by the employee platform`}
          />
        ) : (
          <>
            <Text style={[styles.photoGlyph, { color: theme.colors.textSubtle }]}>◉</Text>
            <Text style={[styles.photoText, { color: theme.colors.textSubtle }]}>
              {imageFailed ? 'Photo could not be loaded' : 'Live photo not received'}
            </Text>
          </>
        )}
      </View>
      {punch ? (
        <>
          <View style={styles.gpsRow}>
            <Text style={[styles.gpsText, { color: theme.colors.textMuted }]}>
              {punch.latitude.toFixed(5)}, {punch.longitude.toFixed(5)}
            </Text>
          </View>
          <Text style={[styles.accuracyText, { color: theme.colors.textSubtle }]}>
            GPS accuracy: ±{punch.accuracy} m
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://www.openstreetmap.org/?mlat=${punch.latitude}&mlon=${punch.longitude}#map=17/${punch.latitude}/${punch.longitude}`,
              ).catch(() => {})
            }
          >
            <Text style={[styles.mapLink, { color: theme.colors.brandPrimary }]}>Open recorded location ↗</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={[styles.accuracyText, { color: theme.colors.textSubtle }]}>No punch event received.</Text>
      )}
    </View>
  );
};

/* ------------------------------ Import format ------------------------------- */

export const ImportFormatSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  employeeId?: string;
}> = ({ visible, onClose, employeeId }) => {
  const { theme } = useTheme();
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Integration format"
      title="Attendance platform export"
      size="lg"
    >      <Text style={[styles.sheetBody, { color: theme.colors.textMuted }]}>
        Upload a JSON array with one daily punch pair per employee. IDs must match the employee register.
        Timestamps require a timezone; the date follows IST. GPS accuracy is in metres. Photos must be HTTPS
        URLs accessible to the reviewer. Missing photos are flagged. The first import replaces the sample
        preview; subsequent imports update matching employee/date pairs.
      </Text>
      <View style={[styles.codeBox, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
        <Text style={[styles.codeText, { color: theme.colors.text }]}>{formatExample(employeeId)}</Text>
      </View>
      <Text style={[styles.sheetBody, { color: theme.colors.textMuted }]}>
        Example URLs are placeholders. Use the actual platform’s secured photo URLs. No credentials or API
        keys should be included in the export.
      </Text>
    </ModalSheet>
  );
};

/* --------------------------------- Import ---------------------------------- */

export const ImportSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onImport: () => void;
  importing: boolean;
  error: string;
}> = ({ visible, onClose, onImport, importing, error }) => {
  const { theme } = useTheme();
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      label="Read-only evidence"
      title="Import attendance export"
      size="md"
      footer={
        <Button onPress={onImport} disabled={importing} label={importing ? 'Importing…' : 'Import sample export'} />
      }
    >
      <Text style={[styles.sheetBody, { color: theme.colors.textMuted }]}>
        Select the JSON export downloaded from the employee attendance platform. On mobile the platform file
        picker is not available; the bundled sample export is parsed instead.
      </Text>
      <View style={[styles.pickZone, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.visualBg }]}>
        <Text style={[styles.pickFile, { color: theme.colors.text }]}>attendance-platform-export.json</Text>
        <Text style={[styles.pickMeta, { color: theme.colors.textSubtle }]}>Sample export · JSON · 1 punch pair</Text>
      </View>
      {error ? <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{error}</Text> : null}
    </ModalSheet>
  );
};

/* --------------------------------- Styles ----------------------------------- */

const styles = StyleSheet.create({
  evidenceCard: {
    flexGrow: 1,
    flexBasis: 260,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  evidenceTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  evidenceTime: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  photoBox: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoGlyph: {
    fontSize: 22,
  },
  photoText: {
    fontSize: 11,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsText: {
    fontSize: 11.5,
  },
  accuracyText: {
    fontSize: 10.5,
  },
  mapLink: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sheetBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    fontSize: 10.5,
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
  pickZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  pickFile: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  pickMeta: {
    fontSize: 11,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
