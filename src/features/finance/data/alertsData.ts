/** Finance alerts — web `/finance/alerts` (12 seeded notifications with category tags). */

export type FinanceAlertCategory =
  | 'Action Required'
  | 'Compliance'
  | 'Approvals'
  | 'Investments'
  | 'Budget'
  | 'Salary'
  | 'Completed';

export interface FinanceAlert {
  id: string;
  title: string;
  body: string;
  category: FinanceAlertCategory;
  time: string;
  unread: boolean;
}

export const financeAlertCategories: FinanceAlertCategory[] = [
  'Action Required',
  'Compliance',
  'Approvals',
  'Investments',
  'Budget',
  'Salary',
  'Completed',
];

export const financeAlertSeeds: FinanceAlert[] = [
  {
    id: 'ALT-01',
    title: 'Advance overdue — Project MNRE-027',
    body: 'Field advance of ₹48,000 issued to Rajib Das is past its 30-day settlement window. Recover or regularise against bills.',
    category: 'Action Required',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'ALT-02',
    title: 'TDS return filing due in 3 days',
    body: 'Form 26Q for Q2 FY 2026–27 must be filed by 31 October. Challan ITNS-281 deductions are reconciled and ready.',
    category: 'Compliance',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 'ALT-03',
    title: 'Vendor payment approval pending',
    body: 'Utkal Tech Systems invoice UTS/2627/118 (₹6.4 L) is awaiting Finance sign-off before PO closure.',
    category: 'Approvals',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'ALT-04',
    title: 'FD maturity — SBI/FD/389102948',
    body: '₹1.35 Cr corporate fixed deposit matures on 20 November 2026. Renewal or sweep-in instructions required.',
    category: 'Investments',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'ALT-05',
    title: 'Budget variance exceeds 15% — NHM-014',
    body: 'Travel & field operations head is running 16% over the approved quarterly allocation.',
    category: 'Budget',
    time: '2 days ago',
    unread: false,
  },
  {
    id: 'ALT-06',
    title: 'Salary disbursed — September 2026',
    body: 'Payroll for 42 employees (net ₹38.6 L) was disbursed via HDFC bulk payment. UTR HDFC2026090012.',
    category: 'Salary',
    time: '3 days ago',
    unread: false,
  },
  {
    id: 'ALT-07',
    title: 'GST GSTR-3B filed for September',
    body: 'ARN AA271026013454K acknowledged. Cash paid ₹2.1 L against net liability after ITC set-off.',
    category: 'Completed',
    time: '4 days ago',
    unread: false,
  },
  {
    id: 'ALT-08',
    title: 'Bank reconciliation pending — Axis ••8102',
    body: 'Field imprest account has 7 unreconciled lines from the October statement import.',
    category: 'Compliance',
    time: '5 days ago',
    unread: false,
  },
  {
    id: 'ALT-09',
    title: 'Donor utilisation certificate due',
    body: 'IBM India CSR requires UC for H1 FY 2026–27 against the Digital Skills grant by 15 November.',
    category: 'Action Required',
    time: '6 days ago',
    unread: false,
  },
  {
    id: 'ALT-10',
    title: 'Tranche 2 release scheduled',
    body: 'PMKVY 4.0 Odisha Skills tranche 2 (₹84.0 L) is scheduled for release upon UC submission.',
    category: 'Approvals',
    time: '1 week ago',
    unread: false,
  },
  {
    id: 'ALT-11',
    title: 'Reimbursement claims settled',
    body: '9 staff travel claims totalling ₹1.12 L were disbursed in the October payout cycle.',
    category: 'Completed',
    time: '1 week ago',
    unread: false,
  },
  {
    id: 'ALT-12',
    title: 'Procurement commitment threshold reached',
    body: 'IT & Hardware category commitments for FY 2026–27 have reached 92% of the annual plan.',
    category: 'Budget',
    time: '2 weeks ago',
    unread: false,
  },
];
