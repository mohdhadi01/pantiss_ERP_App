
export interface GradientPreset {
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

export const heroGradients = {
  finance: br(['#020617', '#022c22', '#047857']),
  banking: br(['#020617', '#022c22', '#065f46']),
  vendor: br(['#020617', '#042f2e', '#064e3b']),
  projects: br(['#020617', '#022c22', '#134e4a']),
  alerts: br(['#020617', '#451a03', '#7f1d1d']),
  salary: br(['#020617', '#064e3b']),
} satisfies Record<string, GradientPreset>;

export const accentGradients = {
  finance: br(['#34d399', '#22d3ee']), // emerald-400 → cyan-400
  hr: br(['#3b82f6', '#818cf8']), // blue-500 → indigo-400
  coreOperations: br(['#2563eb', '#22d3ee']), // blue-600 → cyan-400
  thematicAreas: br(['#22d3ee', '#2563eb']), // cyan-400 → blue-600
  cxo: br(['#7c3aed', '#c084fc']), // violet-600 → purple-400
} satisfies Record<string, GradientPreset>;

export const avatarGradients = {
  finance: br(['#059669', '#2dd4bf']), // emerald-600 → teal-400
  brand: br(['#2563eb', '#06b6d4']), // blue-600 → cyan-400
  hr: br(['#3b82f6', '#818cf8']),
} satisfies Record<string, GradientPreset>;

export const barGradients = {
  emerald: r(['#059669', '#2dd4bf']), // emerald-600 → teal-400
  red: r(['#dc2626', '#fb7185']), // red-600 → rose-400
  blue: r(['#2563eb', '#22d3ee']),
  violet: r(['#8b5cf6', '#c4b5fd']),
} satisfies Record<string, GradientPreset>;

export const funnelStages = [
  { key: 'applied', label: 'Applied', color: '#2563eb' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#f59e0b' },
  { key: 'interviews', label: 'Interviews', color: '#8b5cf6' },
  { key: 'selected', label: 'Selected', color: '#06b6d4' },
  { key: 'offered', label: 'Offered', color: '#10b981' },
  { key: 'onboarded', label: 'Onboarded', color: '#059669' },
] as const;

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
