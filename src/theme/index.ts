import { lightColors, darkColors, ColorTokens } from './colors';
import { spacing, radii, layout } from './spacing';
import { typography, fontStyles } from './typography';
import { createShadows, ThemeShadows } from './shadows';
import {
  heroGradients,
  accentGradients,
  avatarGradients,
  barGradients,
  cardGradients,
  funnelStages,
  areaColors,
  GradientPreset,
} from './gradients';
import { breakpoints, Breakpoint } from './breakpoints';

export {
  lightColors,
  darkColors,
  spacing,
  radii,
  layout,
  typography,
  fontStyles,
  breakpoints,
  heroGradients,
  accentGradients,
  avatarGradients,
  barGradients,
  cardGradients,
  funnelStages,
  areaColors,
};
export type { ColorTokens, ThemeShadows, GradientPreset, Breakpoint };

export interface AppTheme {
  isDark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  layout: typeof layout;
  typography: typeof typography;
  fontStyles: typeof fontStyles;
  shadows: ThemeShadows;
  cardGradient: GradientPreset;
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
    shadows: createShadows(isDark),
    cardGradient: cardGradients[isDark ? 'dark' : 'light'],
  };
}
