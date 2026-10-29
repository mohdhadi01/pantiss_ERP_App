
export interface BankAccount {
  id: string;
  bankName: string;
  maskedNo: string;
  ifsc: string;
  type: string;
  balance: number;
  color: string;
}

export const BANK_COLORS = {
  sbi: '#0284c7',
  hdfc: '#2563eb',
  icici: '#ea580c',
  axis: '#9333ea',
} as const;

export const BANK_ACCOUNTS: BankAccount[] = [
  { id: 'sbi-op', bankName: 'State Bank of India', maskedNo: '•••• 8210', ifsc: 'SBIN0001042', type: 'Operational', balance: 184200000, color: BANK_COLORS.sbi },
  { id: 'hdfc-disb', bankName: 'HDFC Bank', maskedNo: '•••• 8412', ifsc: 'HDFC0000284', type: 'Disbursement', balance: 121800000, color: BANK_COLORS.hdfc },
  { id: 'icici-escrow', bankName: 'ICICI Bank', maskedNo: '•••• 1923', ifsc: 'ICIC0000042', type: 'Grant Escrow', balance: 61500000, color: BANK_COLORS.icici },
  { id: 'axis-imprest', bankName: 'Axis Bank', maskedNo: '•••• 8102', ifsc: 'UTIB0000119', type: 'Field Imprest', balance: 17000000, color: BANK_COLORS.axis },
];

export interface BankTx {
  id: string;
  date: string;
  party: string;
  description: string;
  account: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  ref: string;
  status: 'Reconciled' | 'Pending Clearance';
}

export const BANK_TRANSACTIONS: BankTx[] = [
  { id: 'TXN-2026-9041', date: '2026-09-28', party: 'Apex Skill Training Consortium', description: 'Milestone-2 Batch Trainer Fees', account: 'HDFC Bank', category: 'Training Disbursement', amount: 1485000, type: 'debit', ref: 'HDFCR5202609280018', status: 'Reconciled' },
  { id: 'TXN-2026-9040', date: '2026-09-27', party: 'NSDC Central Mission Grant', description: 'PMKVY 4.0 Q2 Installment release', account: 'State Bank of India', category: 'Grant Inflow', amount: 12500000, type: 'credit', ref: 'SBIN4202609270094', status: 'Reconciled' },
  { id: 'TXN-2026-9039', date: '2026-09-27', party: 'Zenith Digital & Hardware Labs', description: 'Computer lab hardware for Keonjhar center', account: 'State Bank of India', category: 'Procurement', amount: 860000, type: 'debit', ref: 'SBINR2202609270114', status: 'Reconciled' },
  { id: 'TXN-2026-9038', date: '2026-09-26', party: 'Tribal SHG Mobilization Unit', description: 'Community venue rental & participant travel', account: 'Axis Bank', category: 'Field Expenses', amount: 340000, type: 'debit', ref: 'AXISR9202609260049', status: 'Pending Clearance' },
  { id: 'TXN-2026-9037', date: '2026-09-25', party: 'Tata Trusts Livelihood Grant', description: 'Farm Prosperity second tranche', account: 'ICICI Bank', category: 'Donor Funding', amount: 8500000, type: 'credit', ref: 'ICICR1202609250081', status: 'Reconciled' },
  { id: 'TXN-2026-9036', date: '2026-09-25', party: 'State Healthcare Mission Supplies', description: 'Diagnostic kits & mobile clinic refits', account: 'HDFC Bank', category: 'Health Supplies', amount: 1825000, type: 'debit', ref: 'HDFCR5202609250033', status: 'Pending Clearance' },
  { id: 'TXN-2026-9035', date: '2026-09-24', party: 'Monthly Central Staff Payroll (142 staff)', description: 'September 2026 net salary batch', account: 'State Bank of India', category: 'Payroll', amount: 4178000, type: 'debit', ref: 'SBINM0202609240001', status: 'Reconciled' },
];
