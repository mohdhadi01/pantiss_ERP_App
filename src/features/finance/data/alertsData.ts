
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
  date: string;
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
    id: 'alert-001',
    title: 'Advance overdue — Project MNRE-027',
    body: '₹3.2 L advance unsettled for 48 days. Settlement vouchers not received from Odisha field office. Immediate action required from project accountant.',
    category: 'Action Required',
    time: '2 hrs ago',
    date: '28 Sep 2026',
    unread: true,
  },
  {
    id: 'alert-002',
    title: 'TDS return filing due in 3 days',
    body: 'Q2 FY26-27 TDS return filing deadline — 7 Oct 2026. Challan payments must be completed before filing. Contact: CA Ramesh Mehta.',
    category: 'Compliance',
    time: '5 hrs ago',
    date: '28 Sep 2026',
    unread: true,
  },
  {
    id: 'alert-003',
    title: 'Payment voucher awaiting Level-2 approval',
    body: '₹18.6 L vendor payment to M/s EduBuild Infra Pvt. Ltd. for construction milestone 3 — pending Level-2 finance approval since 26 Sep 2026.',
    category: 'Approvals',
    time: 'Yesterday',
    date: '27 Sep 2026',
    unread: true,
  },
  {
    id: 'alert-004',
    title: 'FD maturity — SBI/FD/389102948',
    body: 'Fixed Deposit of ₹1.00 Cr with State Bank of India matures on 15 Dec 2026. Renewal or liquidation instructions required from Finance Head.',
    category: 'Investments',
    time: 'Today, 9:30 AM',
    date: '28 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-005',
    title: 'Budget variance exceeds 15% — NHM-014',
    body: 'Travel & accommodation line has exceeded the sanctioned budget by ₹1.1 L. A formal re-appropriation request is pending approval from Programme Director.',
    category: 'Budget',
    time: '27 Sep',
    date: '27 Sep 2026',
    unread: true,
  },
  {
    id: 'alert-006',
    title: 'Donor UC submitted — WASH-041',
    body: 'Utilisation certificate for UNICEF grant (Project WASH-041) submitted successfully. ₹42.8 L utilisation confirmed and acknowledged.',
    category: 'Completed',
    time: '28 Sep',
    date: '28 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-007',
    title: 'Salary disbursed — September 2026',
    body: 'Payroll of ₹74.2 L disbursed to 284 employees across 7 field offices. No exceptions or failed transactions flagged.',
    category: 'Salary',
    time: '26 Sep',
    date: '26 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-008',
    title: 'GST Return GSTR-3B due — October 2026',
    body: 'Monthly GSTR-3B return for October 2026 is due by 20 Oct 2026. Ensure all purchase invoices are reconciled in GSTR-2B before filing.',
    category: 'Compliance',
    time: '25 Sep',
    date: '25 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-009',
    title: 'Procurement approval — IT Equipment (₹8.4 L)',
    body: 'Purchase request for IT equipment (laptops and accessories) submitted by Admin team. Awaiting Finance Manager approval before PO issuance.',
    category: 'Approvals',
    time: '24 Sep',
    date: '24 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-010',
    title: 'Unsettled advance — Rajan Pillai',
    body: 'Travel advance of ₹48,000 issued to Rajan Pillai (Accounts Executive) on 5 Aug 2026 remains unsettled after 54 days. HR and Finance action required.',
    category: 'Action Required',
    time: '22 Sep',
    date: '22 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-011',
    title: 'MF NAV update — HDFC Overnight Fund',
    body: 'HDFC Overnight Fund Direct Plan NAV updated to ₹372.24. Current portfolio value: ₹48.2 L (investment: ₹45 L). XIRR: 7.1%.',
    category: 'Investments',
    time: '20 Sep',
    date: '20 Sep 2026',
    unread: false,
  },
  {
    id: 'alert-012',
    title: 'Bank reconciliation completed — Canara Bank',
    body: 'Monthly bank reconciliation for Canara Bank A/C 7320100028471 completed and certified. Zero unreconciled items as of 30 Aug 2026.',
    category: 'Completed',
    time: '18 Sep',
    date: '18 Sep 2026',
    unread: false,
  },
];
