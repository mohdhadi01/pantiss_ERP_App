
import { financeAreas, FinanceArea } from './data';
import { initialRequisitions, Requisition } from './data/procurementData';
import { SalaryRecord, salaryKey, salaryMonthLabel, salaryDateLabel } from './salaryData';
import { formatRupees } from '../../utils/formatCurrency';

export interface PaymentListRecord {
  id: string;
  source: 'Procurement' | 'Center' | 'Salary';
  title: string;
  project: string;
  thematicArea?: string;
  center: string;
  payee: string;
  amount: number;
  status: 'Approved' | 'In progress' | 'Payment slip uploaded';
  paymentSlip?: string;
  paidOn?: string;
  reference?: string;
  bankName?: string;
  accountNumber?: string;
  audit?: { action: string; actor: string; date: string; detail: string }[];
}

export interface PaymentArea {
  name: string;
  projects: {
    name: string;
    records: PaymentListRecord[];
  }[];
}

interface CatalogueArea {
  name: string;
  projects: { name: string }[];
}

export function buildPaymentHierarchy(records: PaymentListRecord[], catalogue: CatalogueArea[]): PaymentArea[] {
  const areas: PaymentArea[] = catalogue.map((area) => ({
    name: area.name,
    projects: area.projects.map((project) => ({ name: project.name, records: [] })),
  }));

  for (const record of records) {
    const areaName =
      catalogue.find((area) => area.projects.some((project) => project.name === record.project))?.name ??
      record.thematicArea ??
      'Other / unassigned';

    let area = areas.find((a) => a.name === areaName);
    if (!area) {
      area = { name: areaName, projects: [] };
      areas.push(area);
    }

    let project = area.projects.find((p) => p.name === record.project);
    if (!project) {
      project = { name: record.project, records: [] };
      area.projects.push(project);
    }
    project.records.push(record);
  }

  return areas;
}

export const paymentRecordKey = (record: Pick<PaymentListRecord, 'id' | 'source'>) => `${record.source}:${record.id}`;

export const paymentStatusLabel = (record: PaymentListRecord) =>
  record.status === 'Approved' ? 'Ready to pay' : record.status === 'In progress' ? 'Awaiting payment slip' : 'Paid';

export function paymentHistory(records: PaymentListRecord[]): PaymentListRecord[] {
  return records
    .filter((record) => record.status !== 'Approved')
    .sort((a, b) => (b.paidOn ?? '').localeCompare(a.paidOn ?? ''));
}

export const SEED_CENTRE_EXPENSES = [
  { id: 'CTR-RENT-0182', center: 'Angul Skill Development Center', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 142000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-FOOD-0181', center: 'Angul Skill Development Center', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Food', amount: 96000, submitted: '02 Aug 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-ELEC-0178', center: 'Angul Skill Development Center', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Electricity', amount: 28000, submitted: '01 Aug 2026', documents: 2, status: 'In progress' },
  { id: 'CTR-TADA-0175', center: 'Angul Skill Development Center', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'TA/DA', amount: 64000, submitted: '31 Jul 2026', documents: 6, status: 'Ready' },
  { id: 'CTR-RENT-0191', center: 'Bhubaneswar Technical Center', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 162000, submitted: '03 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0174', center: 'Keonjhar Skills Center', project: 'Project Udaan', month: 'August 2026', type: 'Rental', amount: 118000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0168', center: 'Dibrugarh Health Training Unit', project: 'Swasthya Mobile Clinics', month: 'August 2026', type: 'Rental', amount: 136000, submitted: '30 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0159', center: 'Ranchi Enterprise Hub', project: 'Saksham Women Enterprise', month: 'August 2026', type: 'Rental', amount: 124000, submitted: '29 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0162', center: 'Koraput Regional Office', project: 'Samriddhi Livelihoods Programme', month: 'August 2026', type: 'Rental', amount: 92000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0165', center: 'Angul Nutrition Hub', project: 'Poshan Community Network', month: 'August 2026', type: 'Rental', amount: 84000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0170', center: 'Balasore Field Unit', project: 'Jal Suraksha Mission', month: 'August 2026', type: 'Rental', amount: 76000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0172', center: 'Mayurbhanj Climate Lab', project: 'Green Village Resilience', month: 'August 2026', type: 'Rental', amount: 88000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0177', center: 'Bhubaneswar Research Desk', project: 'Household Welfare Survey', month: 'August 2026', type: 'Rental', amount: 105000, submitted: '03 Aug 2026', documents: 3, status: 'Ready' },
];

export function buildUnifiedPaymentRecords(
  salaryRecords: SalaryRecord[],
  procurement: Requisition[] = initialRequisitions,
  centreExpenses = SEED_CENTRE_EXPENSES,
): PaymentListRecord[] {
  const procurementPayments: PaymentListRecord[] = procurement
    .filter((req) => req.status !== 'Quotation review')
    .map((req) => {
      const quote = req.quotes.find((item) => item.id === req.selectedQuoteId);
      const isComplete = req.status === 'Payment slip uploaded';
      const isInProgress = req.status === 'PO Sent' || req.status === 'Invoice Reminder Sent';
      return {
        id: req.id,
        source: 'Procurement',
        title: req.item,
        project: req.project,
        thematicArea: req.department,
        center: 'Central Procurement',
        payee: quote?.vendor ?? req.vendor,
        amount: quote?.amount ?? req.budgetCeiling,
        status: isComplete ? 'Payment slip uploaded' : isInProgress ? 'In progress' : 'Approved',
        paymentSlip: req.paymentSlip,
        paidOn: isComplete ? req.date : isInProgress ? req.date : undefined,
        reference: req.purchaseOrderNo ?? `PO-${req.id}`,
        bankName: 'State Bank of India',
        accountNumber: `•••• •••• ${req.id.replace(/\D/g, '').slice(-4) || '9182'}`,
        audit: req.audit,
      };
    });

  const centerRecords: PaymentListRecord[] = centreExpenses.map((expense) => {
    const isReady = expense.status === 'Ready';
    return {
      id: expense.id,
      source: 'Center',
      title: `${expense.type} · ${expense.month}`,
      project: expense.project,
      center: expense.center,
      payee: expense.center,
      amount: expense.amount,
      status: isReady ? 'Approved' : 'In progress',
      paymentSlip: !isReady ? `slip-${expense.id.toLowerCase()}.pdf` : undefined,
      paidOn: !isReady ? expense.submitted : undefined,
      reference: !isReady ? `CTR-UTR-${expense.id.slice(-4)}` : undefined,
      bankName: 'Axis Bank',
      accountNumber: '•••• •••• 5510',
      audit: [
        {
          action: 'Expense submitted',
          actor: 'Center Manager',
          date: `${expense.submitted} · 10:00`,
          detail: `${expense.type} bill submitted with ${expense.documents} supporting documents.`,
        },
        {
          action: 'Center clearance verified',
          actor: 'Finance Manager',
          date: `${expense.submitted} · 14:30`,
          detail: `${formatRupees(expense.amount)} cleared for release.`,
        },
      ],
    };
  });

  const salaryPayments: PaymentListRecord[] = salaryRecords
    .filter((record) => record.approvalStatus === 'Approved' && record.forwardedAt && record.status !== 'Hold')
    .map((record) => {
      const area = financeAreas.find((a) => a.projects.some((p) => p.id === record.projectId));
      const project = area?.projects.find((p) => p.id === record.projectId);
      const isDisbursed = record.status === 'Disbursed';
      return {
        id: salaryKey(record),
        source: 'Salary',
        title: `Salary · ${salaryMonthLabel(record.month)}`,
        project: project?.name ?? record.projectId ?? 'Core Operations',
        thematicArea: area?.name ?? 'General',
        center: record.location,
        amount: record.netPay,
        status: isDisbursed ? 'Payment slip uploaded' : 'Approved',
        paymentSlip: isDisbursed ? `payment-slip-${record.id}-${record.month}.pdf` : undefined,
        paidOn: record.paidOn,
        reference: record.reference,
        payee: `${record.name} (${record.designation})`,
        bankName: record.bankName,
        accountNumber: record.bankAccount,
        audit: [
          ...(record.approvedBy && record.approvedOn
            ? [
                {
                  action: 'Salary approved',
                  actor: record.approvedBy,
                  date: salaryDateLabel(record.approvedOn),
                  detail: `${formatRupees(record.netPay)} approved for ${salaryMonthLabel(record.month)}.`,
                },
              ]
            : []),
          {
            action: 'Forwarded for payment',
            actor: record.forwardedBy ?? 'Finance Manager',
            date: salaryDateLabel(record.forwardedAt),
            detail: 'Approved salary forwarded to the payment desk.',
          },
          ...(isDisbursed && record.paidOn
            ? [
                {
                  action: 'Salary payment recorded',
                  actor: 'Payment desk',
                  date: salaryDateLabel(record.paidOn),
                  detail: `Bank reference: ${record.reference ?? 'Recorded'}.`,
                },
              ]
            : []),
        ],
      };
    });

  return [...procurementPayments, ...centerRecords, ...salaryPayments];
}
