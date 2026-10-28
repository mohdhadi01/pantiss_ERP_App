import { FinanceProject, financeAreas } from '../data';

/**
 * Tranche seeds. The web dashboard reads tranches from the project-onboarding
 * localStorage draft; the mobile app uses this static seed instead (agreed
 * scope). Dates are generated relative to "today" so overdue / due-soon
 * states stay meaningful and the current month always has scheduled inflows.
 */

const DAY_MS = 86_400_000;

const isoIn = (days: number): string =>
  new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);

export interface ProjectTranche {
  id: string;
  projectId: string;
  areaId: string;
  /** Share of the project's approved budget, in %. */
  percentage: number;
  tentativeDate: string; // YYYY-MM-DD
  adminApproved: boolean;
  invoiceId: string | null;
}

/** One row per scheduled tranche across the portfolio (2–3 areas seeded). */
export const projectTranches: ProjectTranche[] = [
  { id: 'TR-SKI-01', projectId: 'FIN-SKI-01', areaId: 'skill-development', percentage: 30, tentativeDate: isoIn(-18), adminApproved: true, invoiceId: null },
  { id: 'TR-SKI-02', projectId: 'FIN-SKI-02', areaId: 'skill-development', percentage: 25, tentativeDate: isoIn(-5), adminApproved: true, invoiceId: null },
  { id: 'TR-SKI-03', projectId: 'FIN-SKI-03', areaId: 'skill-development', percentage: 20, tentativeDate: isoIn(8), adminApproved: false, invoiceId: null },
  { id: 'TR-SKI-04', projectId: 'FIN-SKI-04', areaId: 'skill-development', percentage: 25, tentativeDate: isoIn(24), adminApproved: true, invoiceId: 'INV-SKI-02' },
  { id: 'TR-LIV-01', projectId: 'FIN-LIV-01', areaId: 'livelihood', percentage: 35, tentativeDate: isoIn(-9), adminApproved: true, invoiceId: null },
  { id: 'TR-LIV-02', projectId: 'FIN-LIV-02', areaId: 'livelihood', percentage: 30, tentativeDate: isoIn(3), adminApproved: true, invoiceId: null },
  { id: 'TR-LIV-03', projectId: 'FIN-LIV-03', areaId: 'livelihood', percentage: 35, tentativeDate: isoIn(31), adminApproved: false, invoiceId: null },
  { id: 'TR-HEA-01', projectId: 'FIN-HEA-01', areaId: 'health', percentage: 25, tentativeDate: isoIn(-12), adminApproved: true, invoiceId: null },
  { id: 'TR-HEA-02', projectId: 'FIN-HEA-02', areaId: 'health', percentage: 30, tentativeDate: isoIn(1), adminApproved: false, invoiceId: null },
  { id: 'TR-HEA-03', projectId: 'FIN-HEA-03', areaId: 'health', percentage: 25, tentativeDate: isoIn(15), adminApproved: true, invoiceId: null },
  { id: 'TR-WAS-01', projectId: 'FIN-WAS-01', areaId: 'sanitation', percentage: 40, tentativeDate: isoIn(6), adminApproved: true, invoiceId: null },
  { id: 'TR-WAS-02', projectId: 'FIN-WAS-02', areaId: 'sanitation', percentage: 35, tentativeDate: isoIn(28), adminApproved: false, invoiceId: null },
];

export function trancheAmountLakhs(project: FinanceProject, tranche: ProjectTranche): number {
  return (project.approved * tranche.percentage) / 100;
}

// ---------------------------------------------------------------------------
// Dashboard "Tranche Fund Allocation" — a single programme's tranche ladder
// (web FinanceDashboard.tsx:633-741 · 50% Corpus + 50% Operations per tranche).
// ---------------------------------------------------------------------------

export type FundTrancheState = 'overdue' | 'due-soon' | 'scheduled';

export interface FundTranche {
  id: string;
  label: string;
  percentage: number;
  /** Tranche value in rupees (programme budget × percentage). */
  amount: number;
  corpus: number; // 50% of amount
  operations: number; // 50% of amount
  tentativeDate: string;
  invoiceRaised: boolean;
  /** Whole days until the tentative date (negative = overdue). */
  daysUntil: number;
  state: FundTrancheState;
}

const programme = financeAreas[0].projects[0]; // PMKVY 4.0 Odisha Skills

const fundTrancheSeeds = [
  { label: 'Tranche 1 · Mobilisation', percentage: 30, dayOffset: -12, invoiceRaised: false },
  { label: 'Tranche 2 · Batch delivery', percentage: 25, dayOffset: -3, invoiceRaised: false },
  { label: 'Tranche 3 · Assessment', percentage: 20, dayOffset: 6, invoiceRaised: true },
  { label: 'Tranche 4 · Placement & close-out', percentage: 25, dayOffset: 27, invoiceRaised: false },
];

export const trancheFund: {
  programme: string;
  budgetRupees: number;
  tranches: FundTranche[];
} = {
  programme: programme.name,
  budgetRupees: Math.round(programme.approved * 100000),
  tranches: fundTrancheSeeds.map((seed, index) => {
    const amount = Math.round((programme.approved * 100000 * seed.percentage) / 100);
    const daysUntil = seed.dayOffset;
    return {
      id: `fund-tranche-${index + 1}`,
      label: seed.label,
      percentage: seed.percentage,
      amount,
      corpus: Math.round(amount / 2),
      operations: Math.round(amount / 2),
      tentativeDate: isoIn(seed.dayOffset),
      invoiceRaised: seed.invoiceRaised,
      daysUntil,
      state: daysUntil < 0 ? 'overdue' : daysUntil <= 14 ? 'due-soon' : 'scheduled',
    };
  }),
};
