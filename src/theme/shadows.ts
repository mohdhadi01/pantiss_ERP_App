import { Platform, ViewStyle } from 'react-native';

export interface ThemeShadows {
  none: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  card: ViewStyle;
  nav: ViewStyle;
  heroEmerald: ViewStyle;
}

interface PlatformShadow {
  ios: ViewStyle;
  android: ViewStyle;
  default: ViewStyle;
}

const box = (shadowColor: string, h: number, blur: number, opacity: number, elevation: number): PlatformShadow => ({
  ios: {
    shadowColor,
    shadowOffset: { width: 0, height: h },
    shadowOpacity: opacity,
    shadowRadius: blur / 2,
  },
  android: { elevation },
  default: {
    boxShadow: `0 ${h}px ${blur}px ${hexWithAlpha(shadowColor, opacity)}`,
  },
});

function hexWithAlpha(hex: string, opacity: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function createShadows(isDark: boolean): ThemeShadows {
  const cardColor = isDark ? '#000000' : '#202d46';
  const genericColor = isDark ? '#000000' : '#0f172a';

  return {
    none: {},
    sm: Platform.select<ViewStyle>({
      ios: {
        shadowColor: genericColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: { boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)' } as ViewStyle,
    }),
    md: Platform.select<ViewStyle>({
      ios: {
        shadowColor: genericColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      default: { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' } as ViewStyle,
    }),
    lg: Platform.select<ViewStyle>({
      ios: {
        shadowColor: genericColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
      default: { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' } as ViewStyle,
    }),
    card: Platform.select<ViewStyle>(
      isDark
        ? box(cardColor, 22, 80, 0.25, 8)
        : box(cardColor, 18, 60, 0.08, 6),
    ),
    nav: Platform.select<ViewStyle>(
      isDark
        ? box('#000000', 12, 40, 0.2, 5)
        : box('#1f2937', 10, 35, 0.06, 4),
    ),
    heroEmerald: Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.18,
        shadowRadius: 40,
      },
      android: { elevation: 8 },
      default: { boxShadow: '0 28px 80px rgba(5, 150, 105, 0.18)' } as ViewStyle,
    }),
  };
}

export const shadows = createShadows(true);
