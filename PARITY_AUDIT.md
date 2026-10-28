# Pantiss ERP Mobile — Verified Parity Audit & Remediation Plan

> **Method:** three independent line-by-line audits (Finance screens, HR screens, shell/shared surfaces) comparing every web file in `../Pantiss_ERP/src/features/{finance,hr}` + pages with its app counterpart in `src/features` + `src/app`, quoting exact label strings and file:line on both sides. Intentional mobile adaptations are logged separately so fixes never undo them.
>
> **Totals at audit time:** 15 × P1 (missing section/flow) · 76 × P2 (wrong label/option, inert button, wrong content) · 113 × P3 (minor copy/notes). Screen structure, navigation, data flows and the design-token system otherwise match the web.
>
> **STATUS — remediation executed (see git log after `6fccbf5`):** all P1 sections/flows built (area dashboard, budget workflow, Tally panels, procurement quote flow, TA/DA & bill review depth, month-wise tracking, tranche section, recruitment offer form, attendance evidence), all inert buttons wired, all label/vocab/seed datasets aligned to the web, shell/login/404 corrected. Remaining known deviations are the agreed scope cuts (static PDF/Tally-XML/email/print parity) and the intentional mobile adaptations in §5.

---

## 1. Scorecard

| Area | P1 | P2 | P3 | Notes |
|---|---|---|---|---|
| Finance dashboard | 1 | 2 | 5 | Missing Tranche Fund Allocation section |
| Area dashboard `/finance/{areaId}` | 1 | 2 | 0 | **Entire screen missing** — scorecards route to Projects instead |
| Budget | 2 | 4 | 3 | No version workflow / PDF previews / autosave |
| Books | 2 | 3 | 2 | Tally setup + import panels missing; inert buttons; modal missing 2 fields |
| Banking | 0 | 4 | 3 | KPI math + bank balances differ; transfer modal reduced |
| Vendor Management | 0 | 1 | 3 | Seed dataset differs; detail sheet grouping |
| Procurement | 3 | 4 | 3 | No select-quote→approve, no expandable audit rows, no payment slips |
| Salary | 1 | 3 | 5 | No month-wise tracking; inert Export; metric semantics |
| Reimbursement | 2 | 7 | 4 | TA/DA review modal reduced; centre tabs read-only; wrong filter vocab |
| Payments | 0 | 1 | 3 | Slip upload missing |
| Taxation | 0 | 6 | 3 | Monitor labels, missing GST periods, ITC columns, TDS tiles |
| Audit Trails | 0 | 1 | 3 | Invoice document preview missing |
| Projects | 0 | 2 | 4 | Inert buttons; corpus formula |
| Invoices | 0 | 4 | 4 | Tranche approve never persists; verify gating; list unscoped |
| Investments + Alerts | 0 | 4 | 6 | Hero/KPI labels; dataset; mark-all-read; search |
| HR Dashboard | 0 | 3 | 1 | Detail strings |
| HR Recruitment | 1 | 10 | 9 | Release-Offer modal 2/8 fields; profile modal actions; tab badge semantics |
| HR Onboarding | 0 | 1 | 6 | Area filter missing |
| HR Assignment / Designations | 0 | 0 | 6 | Copy-level |
| HR Salary approvals | 0 | 1 | 5 | Inert Export |
| HR Attendance | 2 | 3 | 5 | Import/export inert; format modal missing; photos never rendered |
| HR Leave | 0 | 0 | 4 | Copy-level |
| HR KBI / Appraisals | 0 | 2 | 11 | Rating labels, locked state, gating |
| Shell (sidebars, login, landing, 404, theme, auth) | 0 | 8 | 15 | Login promo panel + "Forgot password?"; 404 copy; sidebar labels |

## 2. P1 findings (must fix)

| # | Finding | Where |
|---|---|---|
| 1 | **Area dashboard screen missing** — web `/finance/{areaId}`: back link, hero + "Budget utilized" glass card, 8 KPI cards, Monthly overview (cashflow + invoices-to-raise), Books-driven project expenditure ledger with filters + export | web FinanceDashboard.tsx:743-776, MonthlyFinanceRow.tsx, ProjectExpenditureLedger.tsx; app: none — scorecards route to `projects?area=` |
| 2 | **Budget version workflow missing** — "Budget documents and workflow": version rows, Preview/Summary/Full report, Submit/Return/Approve, comparison modal, autosave | web FinanceOperationsViews.tsx:101-180 |
| 3 | **Books Tally setup + Import panels missing** — both buttons inert | web BooksView.tsx:105-106 + TallyImportPanel.tsx |
| 4 | **Procurement quotation flow incomplete** — no Select quote → Approve, no ceiling/warranty/tech-score, no expandable "Quotations & Bill"/"Audit Trail" rows, no payment-slip workspace | web FinanceOperationsViews.tsx:1130-1490 |
| 5 | **Reimbursement TA/DA + bill review modals reduced** — no 4 stats, no per-bill documents, no ERP verification checklist, no Raise query/Verify/Approve | web FinanceOperationsViews.tsx:479-534 |
| 6 | **Salary "Month-wise payment tracking" section missing** | web SalaryView.tsx:628-678 |
| 7 | **Dashboard "Tranche Fund Allocation" section missing** | web FinanceDashboard.tsx:633-741 |
| 8 | **Recruitment Release-Offer modal has 2 of 8 fields**; candidate Profile modal missing Offer Letter Status card + Schedule/Release/Reject actions; letter modal missing Print/Email/Accept/Decline actions | web RecruitmentViews.tsx:2315-2445, 1465-1557, 2582-2647 |
| 9 | **HR Attendance Import/Export inert + "Import format" modal missing + punch photos never rendered** (`photoUrl` exists in the data model) | web AttendanceView.tsx:27-56 |

## 3. P2 findings (grouped)

**A. Inert buttons where the web acts** — Books Export CSV / Tally buttons; Salary Export CSV; HR Salary-approvals Export; Attendance Import/Export; Projects "Project Onboarding" + "Export Portfolio Report"; Invoices "Download PDF"/"Edit draft".

**B. Broken gating/persistence** — Invoice tranche "Approve (Super Admin)" never persists (Raise stays disabled); "Admin Verify" offered on Draft; invoice list unscoped to the drilled project; Budget "Save as draft" saves nothing; Banking transfer moves no money; Books record modal missing Payment date + Invoice reference fields.

**C. Wrong labels/options/vocab** — Procurement stage names + history filter options; Reimbursement type + category + status vocabularies; Taxation monitor labels, missing GSTR-9/August periods, ITC column set, TDS tile labels; Investments hero + 4 KPI labels; tax shortcut descriptions; audit-trails H1 ("Project-wise…"); Investments sidebar entry (web has 13 items, app 14); section label "Finance Workspace" vs "WORKSPACE"; login error strings; 404 copy entirely different.

**D. Wrong content/data** — seed datasets differ from web (dashboard highlights, vendor master, alerts 12-seeds, investments holdings, banking balances, taxation periods); Corpus formula (`approved×0.055` vs web `released×0.5` "Estimated"); Salary Total-Payroll/Ready-to-Forward value semantics; recruitment tab badge semantics; interview-stage list includes Applied.

**E. Shell/login** — Login promo panel absent; "Forgot password?" missing; remember-me wording/default; HR header eyebrow ("Human Resources" vs "People & culture…"); HR guard omits role check; bell-dot ring hardcodes dark color.

## 4. Remediation plan (verified, batched)

**Batch 1 — Correctness sweep (fast, ~1 session)**
1. Wire every inert button: CSV exports (Books, Salary, HR approvals, Attendance) via a shared `exportCsv(rows, filename)` helper (share sheet / async storage fallback); Projects Onboarding → informational sheet; Export Report → success toast; Invoices Download PDF → notice per agreed scope.
2. Persist interactions: invoice tranche approve (persist adminApproved → enable Raise), verify gating (Raised only), invoice list scoped to project; Budget "Save as draft" persists to a drafts store shown as version rows; Banking transfer mutates balances + appends a "Treasury Transfer" txn.
3. Label/vocab corrections: procurement stages + filters, reimbursement filter/category vocab, taxation monitors + GST rows (5 returns incl. GSTR-9) + ITC columns + TDS tile labels, Investments hero/KPI labels, tax shortcut descriptions, audit-trails H1, "Finance Workspace" section label per module, HR header eyebrow, login error strings + "Forgot password?" link + remember-me copy, 404 copy to web version, bell-dot ring from theme.
4. Seed alignment: replace app seeds for alerts, vendors, investments, banking accounts/balances/IFSCs, taxation periods, dashboard highlight rows with the web's exact data.
5. Small logic fixes: Corpus = released×0.5 "Estimated"; Salary metric semantics (net headline, ready-count); recruitment tab badges + stage lists; punch-in coverage date; leave balance decrement; KBI rating option labels; "Punch-in coverage" date.

**Batch 2 — Missing sections (P1s, larger builds)**
1. `AreaFinanceDashboard` screen + route wiring from dashboard scorecards (hero, 8 KPIs, Monthly overview, ledger sheet with Books-backed entries + filters + export).
2. Books Tally setup sheet + static Tally import panel (per agreed scope: form/preview UI, no XML parsing).
3. Budget version workflow UI (version rows, Preview/Summary/Full report placeholders, Submit/Return/Approve, comparison table) + autosave banner (static).
4. Procurement: select-quote → approve footer, quote fields (ceiling/delivery/warranty/tech/GST), expandable "Quotations & Bill"/"Audit Trail" rows, payment-slip workspace (static upload UI).
5. Reimbursement: full TA/DA review modal (4 stats, per-bill rows, verification checklist, Raise query/Verify/Approve) + centre 4 stat tiles + live Procurement/Salary sub-views.
6. Salary "Month-wise payment tracking" grid; Dashboard "Tranche Fund Allocation" section (static from a tranche seed).
7. Recruitment: full Release-Offer form (8 fields + SalarySummary + terms), Profile modal offer-status card + Schedule/Release-Offer/Reject actions, letter modal actions (Print → share sheet, Draft email → mailto, Mark Accepted/Declined).
8. Attendance: Import-format modal (JSON sample), photo rendering from `photoUrl` with fallbacks, OSM location link, banner 2-state machine.

**Batch 3 — P3 long tail** (~113 copy/detail items: sub-captions, detail lines, footnotes, letter copy, KPI sub-notes) — mechanical pass per screen.

## 5. Intentional deviations ledger (do NOT "fix")
- Bottom sheets instead of right-side Overlays; stacked cards instead of tables <1024px; horizontal month chips; scope chips; compact phone header; drawer "All Workspaces" link; bank-detail bottom sheet; pressable highlight rows; dismiss always visible; functional TopNavigation avatar.
- Agreed scope cuts: no real PDF generation, no Tally XML parsing, no live email/print — static/notice parity instead.
