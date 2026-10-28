import { lightColors, darkColors, ColorTokens } from './colors';
import { spacing, radii, layout } from './spacing';
import { typography, fontStyles } from './typography';
import { shadows } from './shadows';

export { lightColors, darkColors, spacing, radii, layout, typography, fontStyles, shadows };
export type { ColorTokens };

export interface AppTheme {
  isDark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  layout: typeof layout;
  typography: typeof typography;
  fontStyles: typeof fontStyles;
  shadows: typeof shadows;
}

export function createTheme(isDark: boolean): AppTheme {
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    spacing,
    radii,
    layout,
    typography,
    fontStyles,
    shadows,
  };
}
