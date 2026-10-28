# Pantiss ERP — Mobile (React Native / Expo)

A React Native (Expo) replication of the [Pantiss ERP](../Pantiss_ERP) web application, covering the **Human Resources** and **Finance** modules with the web app's exact design system — themes, gradients, layout grammar and interactions — rebuilt mobile-first.

Dark mode is the default experience, matching the web.

## Quick start

```bash
npm install
npm start          # Expo dev server — press i (iOS) / a (Android) / w (web)
```

- Requires Node 20+ and the [Expo Go](https://expo.dev/go) app (or an iOS/Android simulator).
- Web build: `npx expo export --platform web` (output in `dist/`).

### Demo credentials

| Role | User ID | Password | Lands on |
|---|---|---|---|
| Finance Manager | `finance.manager@pantiss.org` | `Finance@123` | Finance dashboard |
| HR Manager | `hr.manager@pantiss.org` | `HR@123` | HR dashboard |

Sign in from any Finance / HR module card, or via the full-page login. The login form has one-tap demo autofill. All data is local demo data; changes made in HR approvals, payroll, books and alerts persist on-device (AsyncStorage).

## Modules & screens

**Finance (16 screens)** — Dashboard, Area Dashboard (`/finance/area/:areaId`), Budget, Books, Banking, Vendor Management, Procurement, Salary, Reimbursement, Payments, Taxation, Audit Trails, Projects, Invoices, Investments, Alerts.

**HR (10 screens)** — Dashboard, Recruitment & Hiring, Employee Onboarding, Project Assignment, Job Designations, Salary Approvals, Attendance, Leave Management, KBI Metrics, Year-end Appraisals.

Plus the public surface: workspace landing, workspace modules grid, sign-in (modal + page), 404.

## Architecture

```
index.js                  # entry: registerRootComponent(App)
src/
├── App.tsx               # providers, Inter font gate, one-time splash, <RootNavigator/>
├── navigation/
│   ├── RootNavigator.tsx # NavigationContainer(linking) + root Drawer (custom content)
│   ├── linking.ts        # web-parity URL map (/ , /modules/:categoryId , /finance/* , /hr/*)
│   ├── types.ts          # typed param lists + navigation prop types
│   ├── guards.tsx        # useModuleGate hook + <ModuleGate> (per-module auth)
│   └── stacks/
│       ├── PublicStack.tsx   # Landing / Modules / Login / NotFound
│       ├── FinanceStack.tsx  # 16 Finance screens
│       └── HrStack.tsx       # 10 HR screens (inside HRProvider)
├── screens/
│   ├── landing/  modules/  auth/  notFound/
│   ├── finance/          # 16 thin screens → ModuleGate + ModuleShell + feature views
│   └── hr/               # 10 thin screens → ModuleGate + ModuleShell + feature views
├── theme/                # single source of visual truth
│   ├── colors.ts         # exact port of web globals.css :root/.dark tokens
│   ├── gradients.ts      # hero/accent/avatar/bar gradients (exact web stops)
│   ├── shadows.ts        # theme-aware shadows (--shadow-card equivalents)
│   ├── typography.ts     # Inter scale + tabular-nums metric style
│   ├── spacing.ts        # spacing, radii (web scale), layout metrics
│   └── breakpoints.ts    # web-aligned sm 640 / md 768 / lg 1024 / xl 1280
├── components/
│   ├── ui/               # primitives: Card, MetricCard, DataTable, ModalSheet,
│   │                     # Tabs, TextField, SelectField, StatusChip, Timeline,
│   │                     # Donut, FunnelBars, AnimatedNumber, EmptyState…
│   ├── layout/           # ModuleShell (header + notices + heading + footnote),
│   │                     # AppDrawerContent (navigator drawer content), headers
│   ├── auth/             # LoginForm (shared), LoginModal
│   ├── cards/  navigation/  animations/
├── context/  hooks/      # Theme, Auth, Category providers + useBreakpoint etc.
├── features/
│   ├── hr/               # types, seed, store (AsyncStorage), helpers, views
│   └── finance/          # data modules, stores, views
├── data/                 # modules registry, demo accounts
└── utils/                # storage wrapper, currency/date formatting
```

### Navigation

Explicit **React Navigation** navigators (no file-based routing):

- **Root `Drawer`** — three branches: `PublicStack`, `FinanceStack`, `HrStack`. Permanent 260/80px collapsible sidebar ≥1024px, slide-in drawer (300px / 90vw) below, swipe edge 60px, `rgba(2,6,23,0.55)` scrim. The drawer content (`AppDrawerContent`) derives the active module from the navigation state and renders the matching `financeNavItems` / `hrNavItems` menu with the module accent.
- **Stacks** — `@react-navigation/native-stack`, headers hidden, fade transitions; `HrStack` wraps the HR store provider.
- **Linking** — `src/navigation/linking.ts` mirrors the web URLs: `/`, `/modules/:categoryId`, `/login`, `/finance/*` (dashboard, area/:areaId, budget, books, banking, vendor-management, procurement, salary, reimbursement, payments, taxation, audit-trails, projects, invoices, investments, alerts), `/hr/*` (dashboard, recruitment, employee-onboarding, project-assignment, job-designations, salary, attendance, leave-management, kbi-metrics, appraisals), `*` → 404.
- **Auth gates** — each module screen wraps in `<ModuleGate moduleId="finance">` / `<ModuleGate moduleId="human-resources" role="hr-manager">`: loading overlay while the session restores, inline module login for unauthorized visitors (the web redirects to the module login), workspace content once authorized.

### Conventions

- **Tokens only** — screens never hardcode theme colors; module accents come from `theme.colors.financeAccent` (emerald) / `brandPrimary` (HR blue).
- **Responsive** — `useBreakpoint()` mirrors the web's Tailwind breakpoints; tables render as real tables ≥1024px and stacked cards below; the navigator drawer is permanent ≥1024px and a slide-in drawer below.
- **Primitives first** — no screen reimplements cards, tabs, inputs, modals or status pills; everything composes `src/components/ui`.
- **Typed icons** — a static registry (`ui/Icon.tsx`), no runtime namespace lookups.
- **Stores** — `useBooksStore`, `useSalaryRecords`, `useFinanceAlerts`, HR store persist through the typed AsyncStorage wrapper (`utils/storage.ts`).

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` / `ios` / `web` | Platform targets |
| `npm run lint` | ESLint (expo config) |
| `npx tsc --noEmit` | Type check (strict) |

## Web parity

`../PLAN.md` documents the full web→mobile parity plan (design tokens, per-screen checklist, phases). `ARCHITECTURE.md` covers deeper implementation details.

> Demo environment: institutional banking, statutory filings, attendance evidence and email delivery are simulated. No live APIs.
