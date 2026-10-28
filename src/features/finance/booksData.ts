import { financeAreas } from './data';
import { budgetCategories, BudgetCategory } from './budgetCategories';

export const booksProjects = financeAreas.flatMap((area) => area.projects);

export interface BookAuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface BookEntry {
  audit?: BookAuditEvent[];
  id: string;
  projectId: string;
  head: BudgetCategory;
  date: string;
  payee: string;
  reference: string;
  narration: string;
  amount: number; // in INR
  /** Bounded payment date (web record modal field, FY 2026–27). */
  paymentDate?: string;
  /** "Invoice / payment reference" from the record modal (falls back to reference). */
  invoiceReference?: string;
  exportedAt?: string;
  source?: 'tally' | 'manual';
  importedAt?: string;
  sourceCompany?: string;
  sourceVoucherId?: string;
  sourceCostCentre?: string;
  openingIncluded?: boolean;
}

export interface TallySettings {
  company: string;
  bankLedger: string;
  costCategory: string;
  ledgers: Record<BudgetCategory, string>;
  costCentres: Record<string, string>;
}

export const defaultTallySettings: TallySettings = {
  company: 'Pantiss Foundation HQ',
  bankLedger: 'State Bank of India - 1042',
  costCategory: 'Primary Cost Category',
  ledgers: Object.fromEntries(
    budgetCategories.map((head) => [head, head])
  ) as Record<BudgetCategory, string>,
  costCentres: Object.fromEntries(
    booksProjects.map((project) => [project.id, project.name])
  ),
};

/** Portfolio-level cost centre used when no single project is selected. */
export const DEFAULT_COST_CENTRE_KEY = 'default';

/** FY bounds for the record modal's "Payment date" field. */
export const FY_PAYMENT_DATE_HINT = 'FY 2026–27 · 01 Apr 2026 – 31 Mar 2027';
export const FY_START = '2026-04-01';
export const FY_END = '2027-03-31';

export const sampleBookEntries: BookEntry[] = [
  {
    id: 'VCH-2026-001',
    projectId: 'FIN-SKI-01',
    head: 'Equipment & materials',
    date: '2026-07-15',
    payee: 'Apex Tooling Systems Ltd',
    reference: 'INV/2026/884',
    narration: 'Electrical lab testing kits and wire coils for PMKVY batch',
    amount: 148500,
    source: 'manual',
    openingIncluded: true,
  },
  {
    id: 'VCH-2026-002',
    projectId: 'FIN-HEA-01',
    head: 'Travel & field operations',
    date: '2026-07-18',
    payee: 'Swasthya Logistics Fleet',
    reference: 'SLF/OD/2026/09',
    narration: 'Fuel and driver allowances for tribal mobile screening clinic',
    amount: 64200,
    source: 'manual',
    openingIncluded: true,
  },
  {
    id: 'VCH-2026-003',
    projectId: 'FIN-LIV-01',
    head: 'Programme activities',
    date: '2026-07-22',
    payee: 'Mayurbhanj Farmer Collective',
    reference: 'MFC-SEED-41',
    narration: 'Organic seed procurement and soil test kits for 120 households',
    amount: 215000,
    source: 'manual',
    openingIncluded: true,
  },
  {
    id: 'VCH-2026-004',
    projectId: 'FIN-RES-01',
    head: 'Monitoring & evaluation',
    date: '2026-07-28',
    payee: 'DataMetrics Research LLP',
    reference: 'DMR-SURVEY-26',
    narration: 'Midline community survey tablet licensing & field enumerator stipend',
    amount: 98000,
    source: 'manual',
    openingIncluded: true,
  },
  {
    id: 'VCH-2026-005',
    projectId: 'FIN-SKI-02',
    head: 'Administration',
    date: '2026-08-02',
    payee: 'Odisha Internet & Telecom',
    reference: 'OIT-AUG-551',
    narration: 'Broadband optical fiber lease for rural incubation centre',
    amount: 32400,
    source: 'manual',
    openingIncluded: false,
  },
];
