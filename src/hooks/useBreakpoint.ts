import { useWindowDimensions } from 'react-native';
import { breakpoints, Breakpoint } from '@/theme/breakpoints';

export interface BreakpointState {
  width: number;
  height: number;
  /** ≥640 */
  isSm: boolean;
  /** ≥768 */
  isMd: boolean;
  /** ≥1024 — sidebar becomes permanent, tables render as grids */
  isLg: boolean;
  /** ≥1280 — 3-column grids */
  isXl: boolean;
  breakpoint: Breakpoint;
}

/**
 * Web-aligned responsive helper. Mirrors the web app's
 * `sm:`/`md:`/`lg:`/`xl:` Tailwind variants.
 */
export function useBreakpoint(): BreakpointState {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= breakpoints.xl
      ? 'xl'
      : width >= breakpoints.lg
        ? 'lg'
        : width >= breakpoints.md
          ? 'md'
          : width >= breakpoints.sm
            ? 'sm'
            : 'sm';

  return {
    width,
    height,
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl,
    breakpoint,
  };
}
