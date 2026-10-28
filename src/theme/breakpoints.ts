/**
 * Web-aligned breakpoints (`sm 640 / md 768 / lg 1024 / xl 1280`).
 * The workspace sidebar becomes permanent at `lg` (web `lg:block`).
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;
