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

**Finance (15 screens)** — Dashboard, Budget, Books, Banking, Vendor Management, Procurement, Salary, Reimbursement, Payments, Taxation, Audit Trails, Projects, Invoices, Investments, Alerts.

**HR (10 screens)** — Dashboard, Recruitment & Hiring, Employee Onboarding, Project Assignment, Job Designations, Salary Approvals, Attendance, Leave Management, KBI Metrics, Year-end Appraisals.

Plus the public surface: workspace landing, workspace modules grid, sign-in (modal + page), 404.

## Architecture

```
src/
├── app/                  # expo-router file tree
│   ├── _layout.tsx       # providers, Inter font loading, root stack
│   ├── index.tsx         # workspace landing
│   ├── modules/[categoryId].tsx
│   ├── (auth)/login.tsx
│   ├── (hr)/             # 10 HR screens → ModuleShell + feature views
│   └── (finance)/        # 15 Finance screens → ModuleShell + feature views
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
│   ├── layout/           # ModuleShell (260/80 sidebar + 80px header), headers
│   ├── auth/             # LoginForm (shared), LoginModal
│   ├── cards/  navigation/  animations/
├── context/  hooks/      # Theme, Auth, Category providers + useBreakpoint etc.
├── features/
│   ├── hr/               # types, seed, store (AsyncStorage), helpers, views
│   └── finance/          # data modules, stores, views
├── data/                 # modules registry, demo accounts
└── utils/                # storage wrapper, currency/date formatting
```

### Conventions

- **Tokens only** — screens never hardcode theme colors; module accents come from `theme.colors.financeAccent` (emerald) / `brandPrimary` (HR blue).
- **Responsive** — `useBreakpoint()` mirrors the web's Tailwind breakpoints; tables render as real tables ≥1024px and stacked cards below; the sidebar is permanent ≥1024px and a drawer below.
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
