import { useWindowDimensions } from 'react-native';
import { breakpoints, Breakpoint } from '@/theme/breakpoints';

export interface BreakpointState {
  width: number;
  height: number;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  breakpoint: Breakpoint;
}

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
