/**
 * Pantiss ERP color tokens — exact port of the web app's
 * `src/styles/globals.css` `:root` / `.dark` CSS variables.
 * Dark mode is the default experience, matching the web.
 */

export const lightColors = {
  // Brand (web --brand-*)
  brandPrimary: '#2563eb',
  brandHover: '#1d4ed8',
  brandAccent: '#0891b2',
  brandSoft: '#dbeafe',
  brandRing: 'rgba(37, 99, 235, 0.16)',

  // Backgrounds & surfaces (web --background, --surface-*, --module-bg, --nav-bg)
  background: '#f6f8fc',
  surface: '#ffffff',
  surfaceSoft: 'rgba(255, 255, 255, 0.58)',
  surfaceStrong: 'rgba(255, 255, 255, 0.82)',
  surfaceMuted: '#eef2f7',
  cardBg: '#ffffff',
  cardBgAlt: '#f8fafc',
  moduleBg: 'rgba(255, 255, 255, 0.94)',
  navBg: 'rgba(246, 248, 252, 0.96)',
  visualBg: 'rgba(15, 23, 42, 0.045)',
  visualMuted: 'rgba(30, 41, 59, 0.48)',

  // Text (web --text-*)
  text: '#10131a',
  textMuted: '#626b7b',
  textSubtle: '#9098a7',
  textGhost: '#aab1bf',
  textInverted: '#ffffff',

  // Borders (web --border, --border-strong)
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.15)',
  borderFocus: '#2563eb',

  // Inputs
  inputBg: '#ffffff',

  // Semantic status (web: emerald-500 / amber-500 / red-500 at 10% tints)
  success: '#10b981',
  successSoft: 'rgba(16, 185, 129, 0.10)',
  successText: '#059669',
  successBorder: 'rgba(16, 185, 129, 0.25)',

  warning: '#f59e0b',
  warningSoft: 'rgba(245, 158, 11, 0.10)',
  warningText: '#d97706',
  warningBorder: 'rgba(245, 158, 11, 0.25)',

  danger: '#ef4444',
  dangerSoft: 'rgba(239, 68, 68, 0.10)',
  dangerText: '#dc2626',
  dangerBorder: 'rgba(239, 68, 68, 0.25)',

  info: '#3b82f6',
  infoSoft: 'rgba(59, 130, 246, 0.10)',
  infoText: '#2563eb',

  // Finance module accent (web: emerald-600 light / emerald-400 dark)
  financeAccent: '#059669',
  financeAccentSoft: 'rgba(16, 185, 129, 0.10)',
  financeAccentStrong: '#047857',

  // Public / M&E red accent (web: red-600 #dc2626)
  redAccent: '#dc2626',
  redAccentSoft: 'rgba(220, 38, 38, 0.10)',
  redAccentHover: '#b91c1c',
  rose: '#fb7185',

  // Module palette (Tailwind scale values used across the web app)
  emerald: '#10b981',
  emeraldDark: '#047857',
  emeraldSoft: 'rgba(16, 185, 129, 0.12)',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#9333ea',
  amber: '#d97706',
  orange: '#ea580c',
  sky: '#0284c7',
};

export const darkColors = {
  // Brand (web .dark --brand-*)
  brandPrimary: '#3b82f6',
  brandHover: '#60a5fa',
  brandAccent: '#38bdf8',
  brandSoft: 'rgba(59, 130, 246, 0.12)',
  brandRing: 'rgba(59, 130, 246, 0.22)',

  // Backgrounds & surfaces (web .dark values)
  background: '#09090b',
  surface: '#12141a',
  surfaceSoft: 'rgba(255, 255, 255, 0.035)',
  surfaceStrong: 'rgba(255, 255, 255, 0.06)',
  surfaceMuted: '#1a1e27',
  cardBg: '#131822',
  cardBgAlt: '#0f131a',
  moduleBg: 'rgba(14, 18, 27, 0.96)',
  navBg: 'rgba(9, 9, 11, 0.94)',
  visualBg: 'rgba(0, 0, 0, 0.13)',
  visualMuted: 'rgba(255, 255, 255, 0.35)',

  // Text (web .dark --text-*)
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  textGhost: '#535b69',
  textInverted: '#09090b',

  // Borders (web .dark --border 0.075 / --border-strong 0.15)
  border: 'rgba(255, 255, 255, 0.075)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  borderFocus: '#3b82f6',

  // Inputs (web dark: white 4% bg / 10% border)
  inputBg: 'rgba(255, 255, 255, 0.04)',

  // Semantic status (web dark: emerald-400 / amber-400 / red-400 at 10%)
  success: '#34d399',
  successSoft: 'rgba(52, 211, 153, 0.10)',
  successText: '#34d399',
  successBorder: 'rgba(52, 211, 153, 0.25)',

  warning: '#fbbf24',
  warningSoft: 'rgba(251, 191, 36, 0.10)',
  warningText: '#fbbf24',
  warningBorder: 'rgba(251, 191, 36, 0.25)',

  danger: '#f87171',
  dangerSoft: 'rgba(248, 113, 113, 0.10)',
  dangerText: '#f87171',
  dangerBorder: 'rgba(248, 113, 113, 0.25)',

  info: '#60a5fa',
  infoSoft: 'rgba(96, 165, 250, 0.10)',
  infoText: '#60a5fa',

  // Finance module accent (web .dark: emerald-400)
  financeAccent: '#34d399',
  financeAccentSoft: 'rgba(52, 211, 153, 0.10)',
  financeAccentStrong: '#10b981',

  // Public / M&E red accent
  redAccent: '#ef4444',
  redAccentSoft: 'rgba(239, 68, 68, 0.10)',
  redAccentHover: '#dc2626',
  rose: '#fb7185',

  // Module palette (.dark variants)
  emerald: '#34d399',
  emeraldDark: '#059669',
  emeraldSoft: 'rgba(52, 211, 153, 0.12)',
  teal: '#2dd4bf',
  cyan: '#22d3ee',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#a855f7',
  purple: '#c084fc',
  amber: '#f59e0b',
  orange: '#f97316',
  sky: '#38bdf8',
};

export type ColorTokens = typeof lightColors;
