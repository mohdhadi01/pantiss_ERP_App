/**
 * Pantiss ERP gradient registry — exact port of the web app's gradients.
 *
 * Web gradients are Tailwind utilities like `bg-gradient-to-br from-slate-950
 * via-emerald-950 to-emerald-700`. Each entry here carries the identical hex
 * stops plus an expo-linear-gradient start/end point pair:
 *   `to-br` → start {0,0} end {1,1}   ·   `to-r` → start {0,0} end {1,0}
 */

export interface GradientPreset {
  /** expo-linear-gradient requires a tuple of ≥2 colors. */
  colors: [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

const TO_BR = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

const TO_R = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
} as const;

const br = (colors: [string, string, ...string[]]): GradientPreset => ({ colors, ...TO_BR });
const r = (colors: [string, string, ...string[]]): GradientPreset => ({ colors, ...TO_R });

/** Hero banners (`bg-gradient-to-br from-slate-950 …`). Dark in both modes, as on the web. */
export const heroGradients = {
  /** finance dashboard / budget / procurement: slate-950 → emerald-950 → emerald-700 */
  finance: br(['#020617', '#022c22', '#047857']),
  /** banking: slate-950 → emerald-950 → emerald-800 */
  banking: br(['#020617', '#022c22', '#065f46']),
  /** vendor management / staff reimbursement: slate-950 → teal-950 → emerald-900 */
  vendor: br(['#020617', '#042f2e', '#064e3b']),
  /** projects: slate-950 → emerald-950 → teal-900 */
  projects: br(['#020617', '#022c22', '#134e4a']),
  /** alerts: slate-950 → amber-950 → red-900 */
  alerts: br(['#020617', '#451a03', '#7f1d1d']),
  /** salary (120deg): slate-950 → emerald-900 */
  salary: br(['#020617', '#064e3b']),
} satisfies Record<string, GradientPreset>;

/** Module accent tiles & icon chips (`bg-gradient-to-br ${module.accent}`). */
export const accentGradients = {
  finance: br(['#34d399', '#22d3ee']), // emerald-400 → cyan-400
  hr: br(['#3b82f6', '#818cf8']), // blue-500 → indigo-400
  coreOperations: br(['#2563eb', '#22d3ee']), // blue-600 → cyan-400
  thematicAreas: br(['#22d3ee', '#2563eb']), // cyan-400 → blue-600
  cxo: br(['#7c3aed', '#c084fc']), // violet-600 → purple-400
} satisfies Record<string, GradientPreset>;

/** Avatar tiles (header/profile). */
export const avatarGradients = {
  finance: br(['#059669', '#2dd4bf']), // emerald-600 → teal-400
  brand: br(['#2563eb', '#06b6d4']), // blue-600 → cyan-400
  hr: br(['#3b82f6', '#818cf8']),
} satisfies Record<string, GradientPreset>;

/** Progress / funnel bars. */
export const barGradients = {
  emerald: r(['#059669', '#2dd4bf']), // emerald-600 → teal-400
  red: r(['#dc2626', '#fb7185']), // red-600 → rose-400
  blue: r(['#2563eb', '#22d3ee']),
  violet: r(['#8b5cf6', '#c4b5fd']),
} satisfies Record<string, GradientPreset>;

/** Recruitment pipeline stage colors (web rec-funnel). */
export const funnelStages = [
  { key: 'applied', label: 'Applied', color: '#2563eb' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#f59e0b' },
  { key: 'interviews', label: 'Interviews', color: '#8b5cf6' },
  { key: 'selected', label: 'Selected', color: '#06b6d4' },
  { key: 'offered', label: 'Offered', color: '#10b981' },
  { key: 'onboarded', label: 'Onboarded', color: '#059669' },
] as const;

/** Thematic-area identity colors (web `src/features/finance/data.ts`). */
export const areaColors = {
  'skill-development': '#dc2626',
  livelihood: '#059669',
  entrepreneurship: '#f97316',
  nutrition: '#ca8a04',
  health: '#e11d48',
  sanitation: '#0891b2',
  'climate-change': '#16a34a',
  'research-analytics': '#7c3aed',
} as const;

/** Card surface gradient (web `--card-bg`, 152deg) — the only theme-dependent gradient. */
export const cardGradients: Record<'light' | 'dark', GradientPreset> = {
  light: {
    colors: ['rgba(255, 255, 255, 0.96)', 'rgba(242, 245, 251, 0.84)'],
    start: { x: 0, y: 0 },
    end: { x: 0.47, y: 0.88 },
  },
  dark: {
    colors: ['rgba(19, 24, 34, 0.96)', 'rgba(11, 14, 21, 0.92)'],
    start: { x: 0, y: 0 },
    end: { x: 0.47, y: 0.88 },
  },
};
