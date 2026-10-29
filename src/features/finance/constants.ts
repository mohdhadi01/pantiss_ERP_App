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
