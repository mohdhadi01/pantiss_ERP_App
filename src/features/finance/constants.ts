import { NavItem } from '../../types/navigation';

export const financeNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/(finance)/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'budget',
    label: 'Budget',
    route: '/(finance)/budget',
    iconName: 'WalletCards',
  },
  {
    id: 'books',
    label: 'Books',
    route: '/(finance)/books',
    iconName: 'BookOpen',
  },
  {
    id: 'banking',
    label: 'Banking',
    route: '/(finance)/banking',
    iconName: 'Landmark',
  },
  {
    id: 'vendor-management',
    label: 'Vendor Management',
    route: '/(finance)/vendor-management',
    iconName: 'Users',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    route: '/(finance)/procurement',
    iconName: 'ShoppingCart',
  },
  {
    id: 'salary',
    label: 'Salary',
    route: '/(finance)/salary',
    iconName: 'Coins',
  },
  {
    id: 'reimbursement',
    label: 'Reimbursement',
    route: '/(finance)/reimbursement',
    iconName: 'Receipt',
  },
  {
    id: 'payments',
    label: 'Payments',
    route: '/(finance)/payments',
    iconName: 'BadgeIndianRupee',
  },
  {
    id: 'taxation',
    label: 'Taxation',
    route: '/(finance)/taxation',
    iconName: 'Scale',
  },
  {
    id: 'audit-trails',
    label: 'Audit Trails',
    route: '/(finance)/audit-trails',
    iconName: 'ShieldCheck',
  },
  {
    id: 'projects',
    label: 'Projects',
    route: '/(finance)/projects',
    iconName: 'FolderKanban',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    route: '/(finance)/invoices',
    iconName: 'FileText',
  },
  {
    id: 'investments',
    label: 'Investments',
    route: '/(finance)/investments',
    iconName: 'TrendingUp',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    route: '/(finance)/alerts',
    iconName: 'Bell',
    badge: '3',
  },
];

export const financeSectionDescriptions: Record<string, string> = {
  dashboard: 'Overall organizational portfolio and financial health.',
  budget: 'Annual budget allocations and utilization across programs.',
  books: 'Real-time project-wise expenditure book and ledger records.',
  banking: 'Treasury bank accounts, liquid liquidity, and cash flow.',
  'vendor-management': 'Registered vendors, active contracts, and payment history.',
  procurement: 'Purchase orders, requisitions, and vendor quotation approvals.',
  salary: 'Staff payroll register, approval gates, and disbursement rollout.',
  reimbursement: 'Employee travel claims, field expenses, and advance settlements.',
  payments: 'Disbursement queue, batch releases, and banking UTR logging.',
  taxation: 'Statutory GST returns, TDS deductions, and compliance filings.',
  'audit-trails': 'Comprehensive verification audit trail of employee invoices.',
  projects: 'Donor grants, utilization certificates, and committed balances.',
  invoices: 'Client invoicing, incoming internal claims, and payment receipts.',
  investments: 'Fixed deposits, mutual investments, and interest yields.',
  alerts: 'High-priority financial triggers, advance expiries, and budget caps.',
};
