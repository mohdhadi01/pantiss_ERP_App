import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'Courier',
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
    wider: 1.2,
    widest: 2.0,
  },
};

export const fontStyles = {
  hero: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h1: {
    fontSize: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
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
  eyebrow: {
    fontSize: 10,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 1.8,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  mono: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 11,
    letterSpacing: 0.5,
  },
};
