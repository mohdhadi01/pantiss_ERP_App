# Pantiss ERP Mobile — Architecture

Deep-dive companion to `README.md`. The web reference (`../Pantiss_ERP`) and the parity plan (`../PLAN.md`) are the source documents.

## 1. Layering

```
index.js → src/App.tsx (providers)         entry, font gate, one-time splash
  └── navigation/                          explicit React Navigation navigators
        ├── RootNavigator                  root Drawer (custom content) + linking
        └── stacks/*                       PublicStack / FinanceStack / HrStack
              └── screens/*                thin screens: ModuleGate → ModuleShell
                    └── components/layout/ModuleShell   shared chrome: header + heading + footnote
                          └── features/*/components/*View   module screens
                                ├── components/ui/*          primitives (no feature imports)
                                ├── features/*/data, *Store  data + persistence
                                └── theme/*                  tokens
```

Dependency direction is strictly inward: `theme` ← `components/ui` ← `components/layout` ← `features` ← `screens`/`navigation`. Feature modules may import primitives and theme, never each other's internals (the HR seed reads one Finance salary dataset through a single import — the one sanctioned cross-module edge).

## 2. Theme system (`src/theme/`)

The web's Tailwind v4 CSS-first config (`globals.css`) is ported 1:1:

| Web | RN |
|---|---|
| `:root` / `.dark` CSS variables | `colors.ts` `lightColors` / `darkColors` (exact values incl. alpha stops) |
| Tailwind gradient utilities | `gradients.ts` named registry (`heroGradients`, `accentGradients`, `avatarGradients`, `barGradients`, `cardGradients`) with `LinearGradient` start/end points |
| `--shadow-card` / `--shadow-nav` | `shadows.ts` `createShadows(isDark)` (iOS triplet / Android elevation / web boxShadow) |
| Inter font stack | `typography.ts` + `@expo-google-fonts/inter` loaded in `src/App.tsx` |
| `sm/md/lg/xl` variants | `breakpoints.ts` (640/768/1024/1280) via `hooks/useBreakpoint` |
| radii / spacing utilities | `spacing.ts` (`radii.card 16`, `.panel 22`, `.hero 30`, `.deck 32`; `layout.headerHeight 80`, `sidebarWidth 260/80`) |

`createTheme(isDark)` (in `context/ThemeContext`) assembles everything into an `AppTheme`; components consume `useTheme().theme`. Module theming is data-driven: Finance = `financeAccent` (emerald-600/400), HR/public = `brandPrimary`, red = `redAccent` (#dc2626).

## 3. Primitives (`src/components/ui/`)

| Component | Web equivalent | Notes |
|---|---|---|
| `Card` / `SectionCard` | panel div | 16px radius, border token, shadow-card; header w/ eyebrow + action |
| `MetricCard` | `Metric` / finance KPI card | label-above (HR) or icon-tile-above (Finance) layouts, tabular-nums |
| `DataTable<T>` | `.cxo-register` | real table ≥1024px; stacked cards below (`renderMobileCard`) |
| `ModalSheet` | `Overlay.tsx` | bottom sheet <1024px / centered panel ≥1024px; sizes sm–xl |
| `Tabs` | `hr-tabs` / segmented | pill tabs with count badges, accent prop |
| `TextField` / `SelectField` | Zoho login inputs / selects | 48px, 1.5px border, focus ring; select opens a sheet |
| `StatusChip` | `.hr-status` / `.cxo-status` | keyword→tone map + explicit `tone` override |
| `Timeline` | audit/interview rails | left rail + dots |
| `Donut` | conic-gradient donut | SVG stroke-dasharray segments |
| `FunnelBars` | `rec-funnel` | stage colors from `funnelStages` |
| `AnimatedNumber` | `AnimatedNumber.tsx` | easeOutCubic count-up (1200ms) |
| `EmptyState` / `Skeleton` / `ErrorBoundary` | — | required states for all lists/screens |
| `Icon` | lucide-react | static typed registry — no runtime namespace lookup |

## 4. Shell (`components/layout/`)

`ModuleShell` renders the web DashboardLayout/FinancePage content chrome: 80px header (module eyebrow, per-section H1, finance search, bell with amber dot, avatar tile), workspace heading with "Demo workspace" pill, and the demo footnote. The sidebar itself is the **root Drawer navigator's** — `AppDrawerContent` renders the brand block, "All Workspaces & Modules" escape, the active module's menu (`financeNavItems` / `hrNavItems` from the shared constants) with per-module accent, user card and sign-out; screens trigger it via `onOpenDrawer` (`navigation.getParent()?.openDrawer()`). Per-module theming (accent, eyebrow color) is derived from the `currentRoute` identity string — screens pass no colors.

## 5. Data & state

- **No network layer.** Everything is seeded demo data + local writes, mirroring the web's localStorage stores.
- **Persistence**: `utils/storage.ts` (typed AsyncStorage wrapper, `@pantiss_erp:` key prefix). Stores: HR workspace (`hr_workspace_state_v2`), payroll records (`salary_payments_v2`, shared by HR + Finance salary screens), books (`finance_books_entries_v2`), alerts (`finance_alerts_v1`).
- **Derived values** are `useMemo`'d; long registers render through `FlatList` (nested lists use `scrollEnabled={false}`).
- **Money formatting**: single `utils/formatCurrency.ts` — `formatRupees` (₹1,23,456), `formatCurrency` (₹L/₹Cr for portfolio figures), `formatIndianNumber`.

## 6. Navigation & auth

- **Explicit React Navigation navigators** (expo-router removed): `index.js` → `src/App.tsx` (providers + Inter font gate + one-time splash overlay) → `RootNavigator` = `NavigationContainer(linking)` wrapping a root **Drawer** with three branches — `PublicStack`, `FinanceStack`, `HrStack` (native-stack, fade, headers hidden; HrStack wraps the `HRProvider`).
- **Drawer behavior** mirrors the web sidebars: `drawerType` permanent ≥1024px (260px, collapsible to an 80px icon rail) / slide below, width `min(300, 0.9·w)`, swipe edge 60, `rgba(2,6,23,0.55)` scrim. `AppDrawerContent` derives the active section from the drawer state (focused branch + focused stack screen) to highlight the right item and accent; sign-out resets to `PublicStack`/Landing. Public screens opt out (`drawerType: 'front'`, no swipe) — they keep the `TopNavigation` chrome.
- **Linking** (`navigation/linking.ts`) is the explicit web-parity URL map: `/` Landing, `/modules/:categoryId`, `/login`, `/finance/*` and `/hr/*` per-section paths (incl. `/finance/area/:areaId`), `*` → NotFound.
- **`useModuleGate` / `ModuleGate`** (`navigation/guards.tsx`) wraps each module screen: waits for session restore (loading overlay), requires `user.moduleId` to match the module (plus `role === 'hr-manager'` for HR — the web rule), renders the module `LoginScreen` inline ("Sign in to continue") otherwise. Login success resets the root drawer into the target stack (Finance → FinanceDashboard, HR → HrDashboard, else Landing); module cards on the Modules screen validate the account's `moduleId` before navigation, exactly like the web's LoginDialog.
- One `LoginForm` backs the module `LoginModal` (bottom sheet), the full-page `LoginScreen` and the gate's inline login.

## 7. Conventions

- Strict TypeScript; `as any` eliminated from navigation (`as never` typed routes) and icons (typed registry).
- Screens ≤ ~330 lines; larger screens split view-parts files.
- Inline hex allowed **only** for web data-identity colors (thematic area palette, funnel stages, bank brand colors) — everything theme-related lives in `src/theme`.
- ESLint: `eslint-config-expo/flat`; React-Compiler advisory rules (`set-state-in-effect`, `refs`) are warnings by decision.
