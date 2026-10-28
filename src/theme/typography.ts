import { TextStyle } from 'react-native';

/**
 * The web app uses the stack "Inter, SF Pro Display, SF Pro Text, -apple-system, …".
 * We load Inter via @expo-google-fonts/inter in the root layout so all platforms
 * render identical typography. If a weight fails to load, RN falls back to system.
 */
export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: 'Menlo',
  },
  fontSize: {
    '2xs': 10,
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.5,
    // web eyebrow tracking: 0.18em ≈ 1.62px at 9px, 1.8px at 10px
    wider: 1.6,
    widest: 2.0,
  },
};

export const fontStyles = {
  hero: {
    fontSize: 32,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -1.4, // web tracking -0.045em
    lineHeight: 38,
  },
  h1: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.7, // web tracking -0.025/-0.03em
    lineHeight: 30,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  /** web micro-caps: text-[9px]/[10px] font-semibold uppercase tracking-[0.18em] */
  eyebrow: {
    fontSize: 10,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 1.8,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  /** KPI values: web uses tabular-nums + tracking -0.04em */
  metric: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.96,
    lineHeight: 30,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  mono: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    letterSpacing: 0.5,
  },
};
