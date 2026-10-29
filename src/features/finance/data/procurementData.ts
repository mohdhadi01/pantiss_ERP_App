
export type ProcurementStatus =
  | 'Quotation review'
  | 'Approved'
  | 'PO Created'
  | 'PO Sent'
  | 'Invoice Reminder Sent'
  | 'Payment slip uploaded';

export interface ProcQuote {
  id: string;
  vendor: string;
  amount: number;
  deliveryDays: number;
  warranty: string;
  technicalScore: number;
  gstIncluded: boolean;
  file: string;
}

export interface ProcAuditEntry {
  action: string;
  actor: string;
  date: string;
  detail: string;
}

export interface Requisition {
  id: string;
  project: string;
  department: string;
  item: string;
  quantity: string;
  budgetCeiling: number;
  requestedBy: string;
  date: string;
  vendor: string;
  status: ProcurementStatus;
  priority?: 'High' | 'Normal';
  specification?: string;
  quotes: ProcQuote[];
  selectedQuoteId?: string;
  purchaseOrderNo?: string;
  paymentSlip?: string;
  audit: ProcAuditEntry[];
}

export const STATUS_LABELS: Record<ProcurementStatus, string> = {
  'Quotation review': 'Quotation Review',
  Approved: 'Approved',
  'PO Created': 'PO Created',
  'PO Sent': 'PO Sent',
  'Invoice Reminder Sent': 'Invoice Reminder Sent',
  'Payment slip uploaded': 'Complete',
};

export const statusLabel = (status: ProcurementStatus) => STATUS_LABELS[status];

export const procurementStamp = () =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date())
    .replace(',', ' ·');

export const PROJECT_AREA: Record<string, string> = {
  'PMKVY 4.0 Odisha Skills': 'skill-development',
  'Project Udaan': 'skill-development',
  'Samriddhi Livelihoods Programme': 'livelihood',
  'Tribal Producer Collective': 'livelihood',
  'Saksham Women Enterprise': 'entrepreneurship',
  'Poshan Community Network': 'nutrition',
  'First 1,000 Days': 'nutrition',
  'Swasthya Mobile Clinics': 'health',
  'Maternal Health Continuum': 'health',
  'Jal Suraksha Mission': 'sanitation',
  'Green Village Resilience': 'climate-change',
  'Household Welfare Survey': 'research-analytics',
};

export const initialRequisitions: Requisition[] = [
  {
    id: 'REQ-2026-081',
    project: 'PMKVY 4.0 Odisha Skills',
    department: 'Skill Development',
    item: 'Smart Classroom Interactive Flat Panels (65 inch)',
    quantity: '4 panel units',
    budgetCeiling: 380000,
    requestedBy: 'Subhashree Ray (SPM)',
    date: '2026-10-04',
    vendor: 'Zenith Labs Pvt Ltd',
    status: 'Quotation review',
    priority: 'High',
    specification: 'Industrial-grade 65-inch interactive flat panels with wall mounts, styluses and trainer orientation.',
    quotes: [
      { id: 'QT-081-A', vendor: 'Zenith Labs Pvt Ltd', amount: 372400, deliveryDays: 14, warranty: '24 months', technicalScore: 94, gstIncluded: true, file: 'zenith-labs-quotation.pdf' },
      { id: 'QT-081-B', vendor: 'EduLab Equipment India', amount: 361800, deliveryDays: 21, warranty: '18 months', technicalScore: 88, gstIncluded: true, file: 'edulab-quotation.pdf' },
      { id: 'QT-081-C', vendor: 'Bharat Technical Solutions', amount: 386500, deliveryDays: 12, warranty: '24 months', technicalScore: 91, gstIncluded: true, file: 'bharat-tech-quotation.pdf' },
    ],
    audit: [
      { action: 'Request submitted', actor: 'Subhashree Ray', date: '04 Oct 2026 · 10:24', detail: 'Procurement request and three quotations submitted.' },
      { action: 'RFQ released to empaneled vendors', actor: 'Procurement Cell', date: '05 Oct 2026 · 09:10', detail: 'Three quotations invited from the vendor master directory.' },
    ],
  },
  {
    id: 'REQ-2026-082',
    project: 'Swasthya Mobile Clinics',
    department: 'Health & Nutrition',
    item: 'Portable Digital ECG Machines & Consumables',
    quantity: '2 diagnostic kits',
    budgetCeiling: 165000,
    requestedBy: 'Dr. Priyadarshini Mohapatra (CMO)',
    date: '2026-10-02',
    vendor: 'MedTech Diagnostics',
    status: 'Quotation review',
    priority: 'High',
    specification: 'Portable ECG machines with consumable electrodes, thermal paper and field carrying cases.',
    quotes: [
      { id: 'QT-082-A', vendor: 'MediField Technologies', amount: 158600, deliveryDays: 10, warranty: '24 months', technicalScore: 96, gstIncluded: true, file: 'medifield-quotation.pdf' },
      { id: 'QT-082-B', vendor: 'Care Diagnostics India', amount: 156400, deliveryDays: 18, warranty: '12 months', technicalScore: 86, gstIncluded: true, file: 'care-diagnostics-quotation.pdf' },
      { id: 'QT-082-C', vendor: 'Aarogya Devices LLP', amount: 167900, deliveryDays: 12, warranty: '24 months', technicalScore: 92, gstIncluded: false, file: 'aarogya-devices-quotation.pdf' },
    ],
    audit: [
      { action: 'Request submitted', actor: 'Dr. Priyadarshini Mohapatra', date: '02 Oct 2026 · 15:40', detail: 'Technical specifications and three sealed quotations uploaded.' },
    ],
  },
  {
    id: 'REQ-2026-083',
    project: 'Poshan Community Network',
    department: 'Health & Nutrition',
    item: 'Anthropometric Infant Weighing Scales & MUAC Tapes',
    quantity: '25 screening sets',
    budgetCeiling: 85000,
    requestedBy: 'Kavita Soren (Supervisor)',
    date: '2026-09-28',
    vendor: 'NutriTech Instruments',
    status: 'Approved',
    priority: 'Normal',
    specification: 'Digital infant weighing scales, stadiometers, MUAC tapes and protective transit cases.',
    selectedQuoteId: 'QT-083-B',
    quotes: [
      { id: 'QT-083-A', vendor: 'HealthMeasure India', amount: 82400, deliveryDays: 16, warranty: '18 months', technicalScore: 91, gstIncluded: true, file: 'healthmeasure-quotation.pdf' },
      { id: 'QT-083-B', vendor: 'NutriTech Instruments', amount: 79600, deliveryDays: 14, warranty: '24 months', technicalScore: 93, gstIncluded: true, file: 'nutritech-quotation.pdf' },
      { id: 'QT-083-C', vendor: 'Community Health Supplies', amount: 81200, deliveryDays: 20, warranty: '12 months', technicalScore: 87, gstIncluded: true, file: 'community-health-quotation.pdf' },
    ],
    audit: [
      { action: 'Request submitted', actor: 'Kavita Soren', date: '28 Sep 2026 · 11:12', detail: 'Request created with three compliant quotations.' },
      { action: 'Quote selected', actor: 'Finance Manager', date: '30 Sep 2026 · 14:18', detail: 'NutriTech Instruments selected based on price, warranty and technical score.' },
      { action: 'Procurement approved', actor: 'Finance Approver', date: '30 Sep 2026 · 14:26', detail: 'Approved value ₹79,600 within sanctioned ceiling.' },
    ],
  },
  {
    id: 'REQ-2026-084',
    project: 'Samriddhi Livelihoods Programme',
    department: 'Livelihood & Agriculture',
    item: 'Grain Moisture Meters & Precision Seed Sorters',
    quantity: '10 field units',
    budgetCeiling: 145000,
    requestedBy: 'Sunita Majhi (Cluster Lead)',
    date: '2026-10-01',
    vendor: 'AgriTech Tools India',
    status: 'Quotation review',
    priority: 'Normal',
    specification: 'Digital grain moisture meters with calibrated grain scales and field carry cases.',
    quotes: [
      { id: 'QT-084-A', vendor: 'AgriTech Tools India', amount: 138000, deliveryDays: 14, warranty: '24 months', technicalScore: 92, gstIncluded: true, file: 'agritech-tools-quote.pdf' },
      { id: 'QT-084-B', vendor: 'Krishi Instruments LLP', amount: 142000, deliveryDays: 10, warranty: '12 months', technicalScore: 89, gstIncluded: true, file: 'krishi-inst-quote.pdf' },
      { id: 'QT-084-C', vendor: 'Eastern Agri Solutions', amount: 144500, deliveryDays: 12, warranty: '24 months', technicalScore: 90, gstIncluded: true, file: 'eastern-agri-quote.pdf' },
    ],
    audit: [
      { action: 'Request submitted', actor: 'Sunita Majhi', date: '01 Oct 2026 · 11:30', detail: 'Procurement specifications uploaded for tribal FPO harvest.' },
    ],
  },
  {
    id: 'REQ-2026-085',
    project: 'Saksham Women Enterprise',
    department: 'Enterprise Development',
    item: 'Commercial Food Processing & Packaging Equipment',
    quantity: '3 unit sets',
    budgetCeiling: 210000,
    requestedBy: 'Anita Mahato (Incubation Mgr)',
    date: '2026-09-25',
    vendor: 'Utkal Machinery Hub',
    status: 'Approved',
    priority: 'High',
    specification: 'Semi-automatic vacuum packaging machines, weighing scales and induction sealers.',
    selectedQuoteId: 'QT-085-A',
    quotes: [
      { id: 'QT-085-A', vendor: 'Utkal Machinery Hub', amount: 198000, deliveryDays: 15, warranty: '24 months', technicalScore: 95, gstIncluded: true, file: 'utkal-machinery-quote.pdf' },
      { id: 'QT-085-B', vendor: 'Bharat Agro Pack', amount: 204000, deliveryDays: 20, warranty: '18 months', technicalScore: 88, gstIncluded: true, file: 'bharat-pack-quote.pdf' },
      { id: 'QT-085-C', vendor: 'Apex Processing Tech', amount: 208500, deliveryDays: 12, warranty: '12 months', technicalScore: 91, gstIncluded: true, file: 'apex-processing-quote.pdf' },
    ],
    audit: [
      { action: 'Request submitted', actor: 'Anita Mahato', date: '25 Sep 2026 · 14:10', detail: 'Requisition submitted with three verified quotes.' },
      { action: 'Quote selected', actor: 'Finance Manager', date: '27 Sep 2026 · 11:20', detail: 'Utkal Machinery Hub selected for comprehensive warranty and score.' },
      { action: 'Procurement approved', actor: 'Finance Approver', date: '27 Sep 2026 · 12:45', detail: 'Sanction approved for ₹1,98,000.' },
    ],
  },
  {
    id: 'REQ-2026-086',
    project: 'Jal Suraksha Mission',
    department: 'WASH & Sanitation',
    item: 'Water Testing Field Photometer Kits',
    quantity: '8 testing kits',
    budgetCeiling: 120000,
    requestedBy: 'Bishnu Charan Das (Field Officer)',
    date: '2026-09-20',
    vendor: 'AquaPure Solutions',
    status: 'PO Created',
    priority: 'Normal',
    purchaseOrderNo: 'PO-2026-086-104',
    specification: 'Multi-parameter digital water testing photometers for village testing.',
    quotes: [],
    audit: [
      { action: 'Request submitted', actor: 'Bishnu Charan Das', date: '20 Sep 2026 · 10:15', detail: 'WASH water testing field kit requisition.' },
      { action: 'Purchase order created', actor: 'Finance Manager', date: '22 Sep 2026 · 15:40', detail: 'PO-2026-086-104 generated for AquaPure Solutions.' },
    ],
  },
  {
    id: 'REQ-2026-087',
    project: 'Green Village Resilience',
    department: 'Climate Change & Forestry',
    item: 'Solar Micro-Irrigation Pump Units (2 HP)',
    quantity: '2 pump sets',
    budgetCeiling: 260000,
    requestedBy: 'Ramesh Murmu (Technical Lead)',
    date: '2026-09-18',
    vendor: 'Surya Green Tech',
    status: 'PO Sent',
    priority: 'High',
    purchaseOrderNo: 'PO-2026-087-219',
    specification: 'DC solar surface pumps with 1.8kW PV panels and MPPT controller.',
    quotes: [],
    audit: [
      { action: 'Purchase order created', actor: 'Finance Manager', date: '20 Sep 2026 · 11:00', detail: 'PO-2026-087-219 generated for Surya Green Tech.' },
      { action: 'Purchase order sent', actor: 'Finance Manager', date: '21 Sep 2026 · 09:30', detail: 'PO dispatched to vendor.' },
    ],
  },
  {
    id: 'REQ-2026-088',
    project: 'Household Welfare Survey',
    department: 'Research & Analytics',
    item: 'GPS-enabled CAPI Survey Tablets & Power Banks',
    quantity: '15 survey tablets',
    budgetCeiling: 225000,
    requestedBy: 'Manoj Kumar (Data Coordinator)',
    date: '2026-09-15',
    vendor: 'Zenith Labs Pvt Ltd',
    status: 'Payment slip uploaded',
    purchaseOrderNo: 'PO-2026-088-305',
    paymentSlip: 'payment-slip-PO-2026-088.pdf',
    specification: 'Ruggedized Android tablets with GPS, offline survey app capability and 20,000 mAh rugged power packs.',
    quotes: [],
    audit: [
      { action: 'Purchase order created', actor: 'Finance Manager', date: '16 Sep 2026 · 14:00', detail: 'PO-2026-088-305 generated for Zenith Labs Pvt Ltd.' },
      { action: 'Payment slip uploaded', actor: 'Accounts Executive', date: '22 Sep 2026 · 17:15', detail: 'payment-slip-PO-2026-088.pdf attached after NEFT processing.' },
    ],
  },
];

export const purchaseOrderHistory: Requisition[] = [
  {
    id: 'PO-2026-044',
    project: 'Poshan Community Network',
    department: 'Nutrition',
    item: 'Community Nutrition Fellows — Field Tablets (12 units)',
    quantity: '12 field tablets',
    budgetCeiling: 296000,
    requestedBy: 'Programme Office',
    date: '2026-09-12',
    vendor: 'Zenith Labs Pvt Ltd',
    status: 'PO Sent',
    purchaseOrderNo: 'PO-2026-044',
    quotes: [],
    audit: [
      { action: 'Purchase order created', actor: 'Finance Manager', date: '08 Sep 2026 · 12:05', detail: 'PO-2026-044 generated for Zenith Labs Pvt Ltd.' },
      { action: 'Purchase order sent', actor: 'Finance Manager', date: '12 Sep 2026 · 10:41', detail: 'PO-2026-044 dispatched to vendor via email.' },
    ],
  },
  {
    id: 'PO-2026-041',
    project: 'Swasthya Mobile Clinics',
    department: 'Health & Nutrition',
    item: 'Mobile Clinic Fuel & Fleet AMC Contract',
    quantity: '1 annual contract',
    budgetCeiling: 412000,
    requestedBy: 'Fleet Desk',
    date: '2026-08-30',
    vendor: 'MTR Logistics',
    status: 'Invoice Reminder Sent',
    purchaseOrderNo: 'PO-2026-041',
    quotes: [],
    audit: [
      { action: 'Purchase order created', actor: 'Finance Manager', date: '24 Aug 2026 · 09:55', detail: 'PO-2026-041 generated for MTR Logistics.' },
      { action: 'Invoice reminder sent', actor: 'Accounts Executive', date: '30 Aug 2026 · 16:20', detail: 'Payment reminder sent to MTR Logistics.' },
    ],
  },
  {
    id: 'PO-2026-038',
    project: 'PMKVY 4.0 Odisha Skills',
    department: 'Skill Development',
    item: 'Incubation Lab Workstations & Networking',
    quantity: '18 workstations',
    budgetCeiling: 538000,
    requestedBy: 'Training Operations',
    date: '2026-08-14',
    vendor: 'Kalinga Tech',
    status: 'Payment slip uploaded',
    purchaseOrderNo: 'PO-2026-038',
    paymentSlip: 'payment-slip-PO-2026-038.pdf',
    quotes: [],
    audit: [
      { action: 'Purchase order created', actor: 'Finance Manager', date: '05 Aug 2026 · 11:30', detail: 'PO-2026-038 generated for Kalinga Tech.' },
      { action: 'Payment slip uploaded', actor: 'Accounts Executive', date: '14 Aug 2026 · 16:05', detail: 'payment-slip-PO-2026-038.pdf attached after payment processing.' },
    ],
  },
];
