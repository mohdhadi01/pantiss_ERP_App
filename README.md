# Pantiss ERP — Mobile (React Native / Expo)

A high-performance React Native (Expo) replication of the [Pantiss ERP](../Pantiss_ERP) web application, unifying **Human Resources** and **Finance Division** governance for non-profit operations with the web app's exact design system — themes, gradients, layout grammar and interactions — rebuilt mobile-first.

Dark mode is the default experience, matching the web.

---

## Quick start

```bash
npm install
npm start          # Expo dev server — press a (Android) / i (iOS) / w (web)
```

- Requires Node 20+ and the [Expo Go](https://expo.dev/go) app (or an Android/iOS emulator).
- Web build: `npx expo export --platform web` (output in `dist/`).
- Android Release APK: `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` (output in `android/app/build/outputs/apk/release/app-release.apk` or `PantissERP-release.apk`).

### Demo credentials

| Role | User ID | Password | Default Workspace |
|---|---|---|---|
| Finance Manager | `finance.manager@pantiss.org` | `Finance@123` | Finance dashboard |
| HR Manager | `hr.manager@pantiss.org` | `HR@123` | HR dashboard |

Sign in from any Finance / HR module card, or via the full-page login. The login form includes one-tap demo autofill. All data is local demo data; changes made in HR approvals, payroll, books and alerts persist on-device via asynchronous storage.

---

## App Flow & Navigation

The application follows an intentional, sequential 4-tier navigation architecture:

1. **Welcome Screen (`/`)** — Interactive branded splash with orbital telemetry rings, leaf mark with breathing radial aura, live non-profit metrics, and a soothing **"Enter workspace →"** action.
2. **Workspace Selection (`/workspaces`)** — 01 Core Operations, 02 Thematic Areas, 03 Operations & Programs. Allows return to Welcome via the top bar back button.
3. **Module Selection (`/modules/:categoryId`)** — Live operational telemetry cards (Finance, HR) with 1-click role-based demo access.
4. **Functional Workspaces (`/finance/*` and `/hr/*`)** — Drawer-backed operational suites with safe-area protection, breadcrumb navigation, and an instant return link (`← All Workspaces & Modules`).

---

## Modules & screens

**Finance (16 screens)** — Dashboard, Area Dashboard (`/finance/area/:areaId`), Budget, Books, Banking, Vendor Management, Procurement, Salary, Reimbursement, Payments, Taxation, Audit Trails, Projects, Invoices, Investments, Alerts.

**HR (10 screens)** — Dashboard, Recruitment & Hiring, Employee Onboarding, Project Assignment, Job Designations, Salary Approvals, Attendance, Leave Management, KBI Metrics, Year-end Appraisals.

**Public & Entry Screens** — Welcome Splash, Workspace Landing Deck, Workspace Modules Grid, Sign-in (Modal + Page), 404 Recovery.

---

## Architecture

```
index.js                  # Entry: registerRootComponent(App)
src/
├── App.tsx               # Providers (Theme, Auth, Category), Inter font gate, <RootNavigator/>
├── navigation/
│   ├── RootNavigator.tsx # NavigationContainer(linking) + Root Drawer (collapsible safe-area content)
│   ├── linking.ts        # Web-parity deep linking (/ , /workspaces , /modules/:categoryId , /finance/* , /hr/*)
│   ├── types.ts          # Typed param lists + navigation prop types
│   ├── guards.tsx        # useModuleGate hook + <ModuleGate> (per-module auth gates)
│   └── stacks/
│       ├── PublicStack.tsx   # Welcome -> Landing -> Modules -> Login -> NotFound
│       ├── FinanceStack.tsx  # 16 Finance screens
│       └── HrStack.tsx       # 10 HR screens (wrapped in HRProvider)
├── screens/
│   ├── welcome/          # Welcome Screen (interactive animated entry)
│   ├── landing/          # Workspaces Selection Deck
│   ├── modules/          # Module Selection & Telemetry
│   ├── auth/             # Login Screen
│   ├── notFound/         # 404 Screen
│   ├── finance/          # 16 Finance thin screens -> ModuleGate + ModuleShell + feature views
│   └── hr/               # 10 HR thin screens -> ModuleGate + ModuleShell + feature views
├── theme/                # Single source of visual truth
│   ├── colors.ts         # Exact port of web globals.css :root/.dark tokens (dark default)
│   ├── gradients.ts      # Hero, accent, avatar, and bar gradients
│   ├── shadows.ts        # Theme-aware shadows
│   ├── typography.ts     # Inter scale + tabular-nums metric style
│   ├── spacing.ts        # Spacing, radii (web scale), layout metrics
│   └── breakpoints.ts    # Web-aligned sm 640 / md 768 / lg 1024 / xl 1280
├── components/
│   ├── ui/               # Primitives: Card, MetricCard, DataTable, ModalSheet,
│   │                     # Tabs, TextField, SelectField, StatusChip, Timeline,
│   │                     # Donut, FunnelBars, AnimatedNumber, EmptyState, Icon...
│   ├── layout/           # ModuleShell, DashboardHeader, AppDrawerContent, ScreenWrapper
│   ├── auth/             # LoginForm (shared), LoginModal
│   ├── cards/            # CategoryCard, ModuleCard, WorkspaceArtwork
│   ├── navigation/       # WorkspaceRail, Breadcrumb
│   └── animations/       # WelcomeSplash (orbital animation, metrics, brand aura)
├── context/              # ThemeContext, AuthContext, CategoryContext
├── hooks/                # useTheme, useAuth, useCategory, useBreakpoint
├── features/
│   ├── hr/               # Types, seed, HR store (AsyncStorage), helpers, views
│   └── finance/          # Data models, domain stores (books, alerts, drafts), views
├── data/                 # Modules registry, demo accounts
└── utils/                # Soothing haptics, storage wrapper, currency/date formatting, CSV export
```

---

## Design System & Key Conventions

- **Dark-First OLED UI** — True black `#09090b` and slate `#0f172a` surfaces with emerald, teal, and rose accents.
- **Soothing Haptic Hierarchy** — Gentle tactile clicks (`haptics.selection()`) and soft feedback (`haptics.light()`); harsh vibrations were eliminated.
- **Intentional Colocation** — Screen titles and section headers are defined locally where they live, avoiding artificial dictionary indirection and preventing duplicate heading banners.
- **Responsive Layout** — `useBreakpoint()` mirrors Tailwind breakpoints; tables convert to stacked cards on mobile; sidebar adapts from permanent ≥1024px to a gesture-enabled drawer below.
- **Persistent Domain Stores** — `useBooksStore`, `useSalaryRecords`, `useFinanceAlerts`, and `useHRStore` persist locally via the typed `@pantiss_erp:*` storage wrapper.

---

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` | Run on Android device / emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run on web browser |
| `npm run lint` | ESLint check (Expo + React hooks + TypeScript) |
| `npx tsc --noEmit` | Strict TypeScript type checking |
| `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` | Build optimized 36MB release APK |

---

> **Demo environment**: Institutional banking accounts, statutory filings, employee photo attendance, and email delivery are simulated on-device. No live external backend required.
