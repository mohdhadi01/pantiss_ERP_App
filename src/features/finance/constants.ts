import { NavItem } from '../../types/navigation';

export const financeNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/(finance)/dashboard', iconName: 'LayoutDashboard' },
  { id: 'budget', label: 'Budget', route: '/(finance)/budget', iconName: 'WalletCards' },
  { id: 'books', label: 'Books', route: '/(finance)/books', iconName: 'BookOpen' },
  { id: 'banking', label: 'Banking', route: '/(finance)/banking', iconName: 'Landmark' },
  { id: 'vendor-management', label: 'Vendor Management', route: '/(finance)/vendor-management', iconName: 'Users' },
  { id: 'procurement', label: 'Procurement', route: '/(finance)/procurement', iconName: 'ShoppingCart' },
  { id: 'salary', label: 'Salary', route: '/(finance)/salary', iconName: 'Coins' },
  { id: 'reimbursement', label: 'Reimbursement', route: '/(finance)/reimbursement', iconName: 'Receipt' },
  { id: 'payments', label: 'Payments', route: '/(finance)/payments', iconName: 'BadgeIndianRupee' },
  { id: 'taxation', label: 'Taxation', route: '/(finance)/taxation', iconName: 'Scale' },
  { id: 'audit-trails', label: 'Audit Trails', route: '/(finance)/audit-trails', iconName: 'ShieldCheck' },
  { id: 'projects', label: 'Projects', route: '/(finance)/projects', iconName: 'FolderKanban' },
  { id: 'invoices', label: 'Invoices', route: '/(finance)/invoices', iconName: 'FileText' },
];

export const financeSectionTitles: Record<string, string> = {
  dashboard: 'Overall finance dashboard',
  budget: 'Budget planning & allocations',
  books: 'Books & project expenditure',
  banking: 'Banking & treasury operations',
  'vendor-management': 'Vendor directory & contracts',
  procurement: 'Procurement & requisitions',
  salary: 'Salary register & payroll rollout',
  reimbursement: 'Staff expense claims & advances',
  payments: 'Payments',
  taxation: 'Filings, credits & tax deducted',
  'audit-trails': 'Audit trail',
  projects: 'Project finances & grant utilization',
  invoices: 'Client Invoices',
  investments: 'Mutual Funds & Fixed Deposits Portfolio',
  alerts: 'Alerts & Highlights',
};

export const financeSectionDescriptions: Record<string, string> = {
  dashboard: 'Every rupee, from grant to impact — tracked across the portfolio.',
  budget: 'Portfolio budgets, revisions and approvals for FY 2026–27.',
  books: 'Every expenditure, against the right project and budget.',
  banking: 'Real-time liquidity and bank feeds across institutional accounts.',
  'vendor-management': 'Empaneled vendor master directory and compliance.',
  procurement: 'Manage requests by project or review the history of all procurement requests.',
  salary: 'Salary approvals and payment forwarding for the payroll month.',
  reimbursement: 'Centre operating expenses and staff travel claims.',
  payments: 'Pay approved requests or look up a previous payment.',
  taxation: 'Monitor GST filing, track input tax credit, and review total TDS with payment and return-filing status in one place.',
  'audit-trails': 'Follow every employee invoice, from submission to disbursement.',
  projects: 'Grant utilization across thematic project portfolios.',
  invoices: 'Select a thematic area and project to review tranche amounts, tentative dates and approval status before raising an invoice.',
  investments: 'Capital preservation and yield optimization across institutional fixed deposits and SEBI-regulated liquid mutual funds compliant with trust investment regulations.',
  alerts: 'Real-time alerts on advances, compliance deadlines, approval queues, investment events, and budget exceptions across all active finance modules.',
};
