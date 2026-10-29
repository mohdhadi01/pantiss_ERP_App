import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatRupees } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Card, SectionCard } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusChip } from '../../../components/ui/StatusChip';
import { DataTable, DataColumn } from '../../../components/ui/DataTable';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { financeAreas, FinanceArea, FinanceProject } from '../data';
import {
  CentreExpenseCard,
  ClaimReviewSheet,
  ClaimMobileCard,
  SheetStat,
  CentreExpense,
  Claim,
  ExpenseType,
  EXPENSE_TYPES,
  billsForCenterMonth,
} from './ReimbursementParts';
import { TaDaReviewSheet, ExpenseBillReviewSheet } from './ReimbursementSheets';

const CENTRE_EXPENSES: CentreExpense[] = [
  { id: 'CTR-RENT-0182', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 142000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-FOOD-0181', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Food', amount: 96000, submitted: '02 Aug 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-ELEC-0178', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'Electricity', amount: 28000, submitted: '01 Aug 2026', documents: 2, status: 'Clarification' },
  { id: 'CTR-TADA-0175', center: 'Angul Skill Development Center', centerId: 'CEN-ANG-01', project: 'PMKVY 4.0 Odisha Skills', month: 'July 2026', type: 'TA/DA', amount: 64000, submitted: '31 Jul 2026', documents: 6, status: 'Ready' },
  { id: 'CTR-RENT-0191', center: 'Bhubaneswar Technical Center', centerId: 'CEN-BBS-02', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'Rental', amount: 162000, submitted: '03 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0186', center: 'Bhubaneswar Technical Center', centerId: 'CEN-BBS-02', project: 'PMKVY 4.0 Odisha Skills', month: 'August 2026', type: 'TA/DA', amount: 78000, submitted: '02 Aug 2026', documents: 8, status: 'Ready' },
  { id: 'CTR-RENT-0174', center: 'Keonjhar Skills Center', centerId: 'CEN-KEO-01', project: 'Project Udaan', month: 'August 2026', type: 'Rental', amount: 118000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0167', center: 'Keonjhar Skills Center', centerId: 'CEN-KEO-01', project: 'Project Udaan', month: 'July 2026', type: 'TA/DA', amount: 48000, submitted: '30 Jul 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-RENT-0168', center: 'Dibrugarh Health Training Unit', centerId: 'CEN-DIB-01', project: 'Swasthya Mobile Clinics', month: 'August 2026', type: 'Rental', amount: 136000, submitted: '30 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0158', center: 'Dibrugarh Health Training Unit', centerId: 'CEN-DIB-01', project: 'Swasthya Mobile Clinics', month: 'July 2026', type: 'TA/DA', amount: 88000, submitted: '28 Jul 2026', documents: 7, status: 'Clarification' },
  { id: 'CTR-RENT-0159', center: 'Ranchi Enterprise Hub', centerId: 'CEN-RAN-01', project: 'Saksham Women Enterprise', month: 'August 2026', type: 'Rental', amount: 124000, submitted: '29 Jul 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-TADA-0151', center: 'Ranchi Enterprise Hub', centerId: 'CEN-RAN-01', project: 'Saksham Women Enterprise', month: 'July 2026', type: 'TA/DA', amount: 56000, submitted: '27 Jul 2026', documents: 5, status: 'Ready' },
  { id: 'CTR-RENT-0162', center: 'Koraput Regional Office', centerId: 'CEN-KOR-01', project: 'Samriddhi Livelihoods Programme', month: 'August 2026', type: 'Rental', amount: 92000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-FOOD-0163', center: 'Koraput Regional Office', centerId: 'CEN-KOR-01', project: 'Samriddhi Livelihoods Programme', month: 'July 2026', type: 'Food', amount: 54000, submitted: '30 Jul 2026', documents: 4, status: 'Ready' },
  { id: 'CTR-RENT-0165', center: 'Angul Nutrition Hub', centerId: 'CEN-ANG-02', project: 'Poshan Community Network', month: 'August 2026', type: 'Rental', amount: 84000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-ELEC-0166', center: 'Angul Nutrition Hub', centerId: 'CEN-ANG-02', project: 'Poshan Community Network', month: 'July 2026', type: 'Electricity', amount: 19500, submitted: '29 Jul 2026', documents: 2, status: 'Ready' },
  { id: 'CTR-RENT-0170', center: 'Balasore Field Unit', centerId: 'CEN-BAL-01', project: 'Jal Suraksha Mission', month: 'August 2026', type: 'Rental', amount: 76000, submitted: '01 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0172', center: 'Mayurbhanj Climate Lab', centerId: 'CEN-MAY-01', project: 'Green Village Resilience', month: 'August 2026', type: 'Rental', amount: 88000, submitted: '02 Aug 2026', documents: 3, status: 'Ready' },
  { id: 'CTR-RENT-0177', center: 'Bhubaneswar Research Desk', centerId: 'CEN-BBS-03', project: 'Household Welfare Survey', month: 'August 2026', type: 'Rental', amount: 105000, submitted: '03 Aug 2026', documents: 3, status: 'Ready' },
];

interface ProcurementPO {
  id: string;
  project: string;
  center: string;
  item: string;
  vendor: string;
  value: number;
  status: string;
}

const CENTRE_PROCUREMENT: ProcurementPO[] = [
  { id: 'PO-2026-051', project: 'PMKVY 4.0 Odisha Skills', center: 'Angul Center', item: 'Lab consumables & safety gear — Q3 restock', vendor: 'Apex Tooling Systems', value: 128000, status: 'Center approval pending' },
  { id: 'PO-2026-049', project: 'Samriddhi Livelihoods Programme', center: 'Koraput District', item: 'SHG mobilization field kits (40 units)', vendor: 'MTR Logistics', value: 86000, status: 'Approved' },
  { id: 'PO-2026-054', project: 'Swasthya Mobile Clinics', center: 'Dibrugarh Mobile Unit', item: 'Diagnostic test strips & disposable PPE', vendor: 'MedTech Diagnostics', value: 94000, status: 'Approved' },
  { id: 'PO-2026-057', project: 'Saksham Women Enterprise', center: 'Ranchi Enterprise Hub', item: 'Packaging sealer machines & thermal rolls', vendor: 'Utkal Machinery Hub', value: 112000, status: 'Center approval pending' },
  { id: 'PO-2026-060', project: 'Poshan Community Network', center: 'Angul Nutrition Hub', item: 'Infant growth monitoring charts & stadiometers', vendor: 'NutriTech Instruments', value: 68000, status: 'Approved' },
  { id: 'PO-2026-063', project: 'Jal Suraksha Mission', center: 'Balasore Center', item: 'Field water testing chemical ampoules', vendor: 'AquaPure Solutions', value: 52000, status: 'Approved' },
  { id: 'PO-2026-067', project: 'Household Welfare Survey', center: 'Bhubaneswar HQ', item: 'Survey tablet protective rugged enclosures', vendor: 'Zenith Labs Pvt Ltd', value: 45000, status: 'Approved' },
];

interface SalaryBatch {
  id: string;
  project: string;
  center: string;
  employees: number;
  gross: number;
  status: string;
}

const CENTRE_SALARY: SalaryBatch[] = [
  { id: 'CTR-SAL-09-01', project: 'Project Udaan', center: 'Keonjhar Center', employees: 2, gross: 126180, status: 'Approved' },
  { id: 'CTR-SAL-09-02', project: 'Swasthya Mobile Clinics', center: 'Mayurbhanj District', employees: 1, gross: 41880, status: 'Pending approval' },
  { id: 'CTR-SAL-09-03', project: 'PMKVY 4.0 Odisha Skills', center: 'Angul Skill Development Center', employees: 4, gross: 184500, status: 'Approved' },
  { id: 'CTR-SAL-09-04', project: 'Samriddhi Livelihoods Programme', center: 'Koraput Field Cluster', employees: 3, gross: 132400, status: 'Approved' },
  { id: 'CTR-SAL-09-05', project: 'Saksham Women Enterprise', center: 'Ranchi Enterprise Hub', employees: 2, gross: 98000, status: 'Approved' },
  { id: 'CTR-SAL-09-06', project: 'Poshan Community Network', center: 'Angul Nutrition Hub', employees: 2, gross: 76500, status: 'Pending approval' },
  { id: 'CTR-SAL-09-07', project: 'Green Village Resilience', center: 'Mayurbhanj Climate Lab', employees: 2, gross: 89000, status: 'Approved' },
];

const SAMPLE_CLAIMS: Claim[] = [
  { id: 'CLM-2026-401', claimant: 'Sunita Majhi', employeeId: 'PAN-EMP-0104', project: 'Samriddhi Livelihoods Programme', center: 'Koraput District', category: 'Inter-District Travel', purpose: 'Koraput Field Cluster Tribal SHG Mobilization Travel', date: '2026-10-06', amount: 14200, billsCount: 5, status: 'Pending Verification' },
  { id: 'CLM-2026-402', claimant: 'Ranjan Kumar Jena', employeeId: 'PAN-EMP-0103', project: 'PMKVY 4.0 Odisha Skills', center: 'Angul Center', category: 'Field Mobilization', purpose: 'NSDC Trainer of Trainers Certification Workshop — Cuttack', date: '2026-09-29', amount: 22800, billsCount: 7, status: 'Finance Approved' },
  { id: 'CLM-2026-403', claimant: 'Bishnu Charan Das', employeeId: 'PAN-EMP-0105', project: 'Household Welfare Survey', center: 'Bhubaneswar HQ', category: 'Accommodation & Food', purpose: 'District Monitoring Survey Accommodation & Per Diem', date: '2026-09-22', amount: 18500, billsCount: 4, status: 'Disbursed', bankUtr: 'HDFCR5104925', payoutDate: '25 Sep 2026' },
  { id: 'CLM-2026-404', claimant: 'Alok Kumar Sahoo', employeeId: 'PAN-EMP-0103', project: 'PMKVY 4.0 Odisha Skills', center: 'Keonjhar Center', category: 'Printing & Supplies', purpose: 'Emergency batch study materials and trainer orientation kits', date: '2026-09-26', amount: 14200, billsCount: 2, status: 'Pending Verification' },
  { id: 'CLM-2026-405', claimant: 'Kavita Soren', employeeId: 'PAN-EMP-0107', project: 'Swasthya Mobile Clinics', center: 'Mayurbhanj Mobile Clinic', category: 'Field Mobilization', purpose: 'Community health screening camp mobilization logistics in Baripada', date: '2026-09-25', amount: 6800, billsCount: 3, status: 'Disbursed', bankUtr: 'HDFCR5202609270841', payoutDate: '27 Sep 2026' },
  { id: 'CLM-2026-406', claimant: 'Anita Mahato', employeeId: 'PAN-EMP-0112', project: 'Saksham Women Enterprise', center: 'Ranchi Enterprise Hub', category: 'Accommodation & Food', purpose: 'SHG Women Producers Incubation Workshop Stay & Meals', date: '2026-09-19', amount: 12400, billsCount: 4, status: 'Finance Approved' },
  { id: 'CLM-2026-407', claimant: 'Ramesh Murmu', employeeId: 'PAN-EMP-0118', project: 'Green Village Resilience', center: 'Mayurbhanj Cluster', category: 'Inter-District Travel', purpose: 'Watershed monitoring & community tree nursery evaluation', date: '2026-09-14', amount: 9800, billsCount: 3, status: 'Pending Verification' },
  { id: 'CLM-2026-408', claimant: 'Priya Dhar', employeeId: 'PAN-EMP-0125', project: 'Poshan Community Network', center: 'Angul Center', category: 'Field Mobilization', purpose: 'Adolescent health & nutrition rally materials', date: '2026-09-10', amount: 15600, billsCount: 5, status: 'Disbursed', bankUtr: 'SBINR220260912044', payoutDate: '12 Sep 2026' },
  { id: 'CLM-2026-409', claimant: 'Manas Ranjan', employeeId: 'PAN-EMP-0184', project: 'Project Udaan', center: 'Keonjhar Center', category: 'Inter-District Travel', purpose: 'Training partner verification visit to Barbil and Joda', date: '2026-09-08', amount: 16000, billsCount: 4, status: 'Finance Approved' },
  { id: 'CLM-2026-410', claimant: 'Deepak Pradhan', employeeId: 'PAN-EMP-0130', project: 'Jal Suraksha Mission', center: 'Balasore Center', category: 'Emergency Float', purpose: 'Field water testing photometer reagents and calibration', date: '2026-09-05', amount: 7500, billsCount: 2, status: 'Pending Verification' },
];

const STEPS = ['1 · Project', '2 · Center', '3 · Expense review'];
const CENTRE_TABS = ['Center approvals', 'Procurement approvals', 'Salary approvals'];
const CLAIM_CATEGORIES = ['Inter-District Travel', 'Field Mobilization', 'Accommodation & Food', 'Printing & Supplies', 'Emergency Float'];

const CLAIM_COLUMNS: DataColumn<Claim>[] = [
  { key: 'id', label: 'Claim ID & Date', flex: 1.4 },
  { key: 'claimant', label: 'Claimant', flex: 1.4 },
  { key: 'project', label: 'Project & Center', flex: 1.8, wideOnly: true },
  { key: 'category', label: 'Category', flex: 1.2, wideOnly: true },
  { key: 'amount', label: 'Claim Amount', flex: 1.1, align: 'right' },
  { key: 'receipts', label: 'Receipts', flex: 0.8, align: 'center', wideOnly: true },
  { key: 'status', label: 'Status', flex: 1.1 },
  { key: 'actions', label: 'Actions', flex: 0.7, align: 'right' },
];

export const ReimbursementView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [topTab, setTopTab] = useState<'centre' | 'staff'>('centre');

  const [centreAreaId, setCentreAreaId] = useState<string | null>(null);
  const [centreProjectId, setCentreProjectId] = useState<string | null>(null);

  const [staffAreaId, setStaffAreaId] = useState<string | null>(null);
  const [staffProjectId, setStaffProjectId] = useState<string | null>(null);

  const [centreTab, setCentreTab] = useState(CENTRE_TABS[0]);
  const [monthFilter, setMonthFilter] = useState('All months');
  const [typeFilter, setTypeFilter] = useState<'All' | ExpenseType>('All');
  const [reviewExpense, setReviewExpense] = useState<CentreExpense | null>(null);

  const [claims, setClaims] = useState(SAMPLE_CLAIMS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [claimant, setClaimant] = useState('');
  const [empId, setEmpId] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Inter-District Travel');
  const [billsAttached, setBillsAttached] = useState(false);

  const selectedCentreArea = useMemo(() => financeAreas.find((a) => a.id === centreAreaId) ?? null, [centreAreaId]);
  const selectedCentreProject = useMemo(
    () => selectedCentreArea?.projects.find((p) => p.name === centreProjectId) ?? null,
    [selectedCentreArea, centreProjectId],
  );

  const selectedStaffArea = useMemo(() => financeAreas.find((a) => a.id === staffAreaId) ?? null, [staffAreaId]);
  const selectedStaffProject = useMemo(
    () => selectedStaffArea?.projects.find((p) => p.name === staffProjectId) ?? null,
    [selectedStaffArea, staffProjectId],
  );

  const scopedExpenses = useMemo(() => {
    if (!selectedCentreProject) return [];
    const direct = CENTRE_EXPENSES.filter((e) => e.project === selectedCentreProject.name);
    if (direct.length > 0) return direct;
    return [
      {
        id: `CTR-RENT-${selectedCentreProject.id}`,
        center: `${selectedCentreProject.name} Operations Hub`,
        centerId: `CEN-${selectedCentreProject.id}`,
        project: selectedCentreProject.name,
        month: 'August 2026',
        type: 'Rental' as const,
        amount: 115000,
        submitted: '02 Aug 2026',
        documents: 3,
        status: 'Ready' as const,
      },
      {
        id: `CTR-TADA-${selectedCentreProject.id}`,
        center: `${selectedCentreProject.name} Operations Hub`,
        centerId: `CEN-${selectedCentreProject.id}`,
        project: selectedCentreProject.name,
        month: 'July 2026',
        type: 'TA/DA' as const,
        amount: 46000,
        submitted: '31 Jul 2026',
        documents: 4,
        status: 'Ready' as const,
      },
    ];
  }, [selectedCentreProject]);

  const filteredExpenses = useMemo(() => {
    return scopedExpenses.filter((e) => {
      const matchesMonth = monthFilter === 'All months' || e.month === monthFilter;
      const matchesType = typeFilter === 'All' || e.type === typeFilter;
      return matchesMonth && matchesType;
    });
  }, [scopedExpenses, monthFilter, typeFilter]);

  const months = useMemo(() => ['All months', ...Array.from(new Set(scopedExpenses.map((e) => e.month)))], [scopedExpenses]);

  const centreStats = useMemo(() => {
    const centers = new Set(scopedExpenses.map((e) => e.centerId)).size;
    const value = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const tadaBills = scopedExpenses.reduce(
      (sum, e) => (e.type === 'TA/DA' ? sum + billsForCenterMonth(e.centerId, e.month).length : sum),
      0,
    );
    return { centers, value, tadaBills };
  }, [scopedExpenses]);

  const scopedProcurement = useMemo(() => {
    if (!selectedCentreProject) return [];
    const direct = CENTRE_PROCUREMENT.filter((p) => p.project === selectedCentreProject.name);
    if (direct.length > 0) return direct;
    return [
      {
        id: `PO-${selectedCentreProject.id}-01`,
        project: selectedCentreProject.name,
        center: `${selectedCentreProject.name} Center`,
        item: `${selectedCentreProject.name} Field Kits & Training Consumables`,
        vendor: 'Apex Tooling Systems',
        value: 84000,
        status: 'Approved',
      },
    ];
  }, [selectedCentreProject]);

  const scopedSalary = useMemo(() => {
    if (!selectedCentreProject) return [];
    const direct = CENTRE_SALARY.filter((s) => s.project === selectedCentreProject.name);
    if (direct.length > 0) return direct;
    return [
      {
        id: `CTR-SAL-${selectedCentreProject.id}`,
        project: selectedCentreProject.name,
        center: `${selectedCentreProject.name} Center`,
        employees: 2,
        gross: 94000,
        status: 'Approved',
      },
    ];
  }, [selectedCentreProject]);

  const scopedStaffClaims = useMemo(() => {
    if (!selectedStaffProject) return [];
    const direct = claims.filter((c) => c.project === selectedStaffProject.name);
    if (direct.length > 0) return direct;
    return [
      {
        id: `CLM-${selectedStaffProject.id}-01`,
        claimant: 'Priyanka Sahu',
        employeeId: 'PAN-EMP-0142',
        project: selectedStaffProject.name,
        center: `${selectedStaffProject.name} Field Cluster`,
        category: 'Inter-District Travel',
        purpose: `${selectedStaffProject.name} cluster stakeholder travel and community review`,
        date: '2026-10-02',
        amount: 11800,
        billsCount: 3,
        status: 'Pending Verification' as const,
      },
    ];
  }, [claims, selectedStaffProject]);

  const filteredStaffClaims = useMemo(() => {
    return scopedStaffClaims.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.claimant.toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q) ||
        c.project.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [scopedStaffClaims, search, statusFilter, categoryFilter]);

  const staffKpis = useMemo(() => {
    const pending = scopedStaffClaims.filter((c) => c.status === 'Pending Verification');
    const approved = scopedStaffClaims.filter((c) => c.status === 'Finance Approved');
    const disbursed = scopedStaffClaims.filter((c) => c.status === 'Disbursed');
    return {
      pendingCount: pending.length,
      approvedTotal: approved.reduce((sum, c) => sum + c.amount, 0),
      approvedCount: approved.length,
      disbursedTotal: disbursed.reduce((sum, c) => sum + c.amount, 0),
    };
  }, [scopedStaffClaims]);

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Finance Approved' as const } : c)));
  };

  const handleDisburse = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Disbursed' as const,
              bankUtr: `HDFCR5${Date.now().toString().slice(-8)}`,
              payoutDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            }
          : c,
      ),
    );
  };

  const handleSubmitClaim = () => {
    const numAmount = parseFloat(amount);
    if (!claimant.trim() || isNaN(numAmount) || numAmount <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const projectName = selectedStaffProject?.name ?? 'PMKVY 4.0 Odisha Skills';
    const next: Claim = {
      id: `CLM-2026-${404 + claims.length}`,
      claimant: claimant.trim(),
      employeeId: empId.trim() || 'PAN-EMP-TEMP',
      project: projectName,
      center: costCenter.trim() || `${projectName} Field Office`,
      category,
      purpose: purpose.trim() || 'Out-of-pocket field operational expenses',
      date: new Date().toISOString().slice(0, 10),
      amount: numAmount,
      billsCount: billsAttached ? 2 : 1,
      status: 'Pending Verification',
    };
    setClaims((prev) => [next, ...prev]);
    setClaimant('');
    setEmpId('');
    setCostCenter('');
    setPurpose('');
    setAmount('');
    setBillsAttached(false);
    setFormOpen(false);
  };

  const claimTone = (status: Claim['status']) =>
    status === 'Disbursed' ? 'success' : status === 'Finance Approved' ? 'info' : 'warning';

  const renderClaimCell = (claim: Claim, col: DataColumn<Claim>) => {
    switch (col.key) {
      case 'id':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.brandPrimary }]}>{claim.id}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{formatDate(claim.date)}</Text>
          </View>
        );
      case 'claimant':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.claimant}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{claim.employeeId}</Text>
          </View>
        );
      case 'project':
        return (
          <View>
            <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.project}</Text>
            <Text style={[styles.cellSub, { color: theme.colors.textSubtle }]}>{claim.center}</Text>
          </View>
        );
      case 'category':
        return <Text style={[styles.cellMain, { color: theme.colors.textMuted }]}>{claim.category}</Text>;
      case 'amount':
        return <Text style={[styles.amountText, { color: theme.colors.financeAccent }]}>{formatRupees(claim.amount)}</Text>;
      case 'receipts':
        return <Text style={[styles.cellMain, { color: theme.colors.text }]}>{claim.billsCount} files</Text>;
      case 'status':
        return <StatusChip status={claim.status} tone={claimTone(claim.status)} />;
      case 'actions':
        return (
          <Pressable
            onPress={() => {
              setReviewClaim(claim);
              setClaimOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Review claim ${claim.id}`}
            style={styles.viewBtn}
          >
            <Icon name="Eye" size={15} color={theme.colors.financeAccent} />
          </Pressable>
        );
      default:
        return null;
    }
  };

  const getAreaClaimStats = (area: FinanceArea) => {
    const areaProjectNames = new Set(area.projects.map((p) => p.name));
    const areaClaims = claims.filter((c) => areaProjectNames.has(c.project));
    const pending = areaClaims.filter((c) => c.status === 'Pending Verification').length;
    const totalVal = areaClaims.reduce((s, c) => s + c.amount, 0);
    return { count: areaClaims.length, pending, totalVal };
  };

  const getProjectClaimStats = (projectName: string) => {
    const projClaims = claims.filter((c) => c.project === projectName);
    const pending = projClaims.filter((c) => c.status === 'Pending Verification').length;
    const totalVal = projClaims.reduce((s, c) => s + c.amount, 0);
    return { count: projClaims.length, pending, totalVal };
  };

  return (
    <View style={styles.container}>
      <Tabs
        items={[
          { key: 'centre', label: 'Centre Reimbursement', icon: 'Building2' },
          { key: 'staff', label: 'Staff Reimbursement', icon: 'Receipt' },
        ]}
        activeKey={topTab}
        onChange={(key) => setTopTab(key as 'centre' | 'staff')}
        accent={theme.colors.financeAccent}
      />

      {topTab === 'centre' ? (
        <View style={styles.section}>
          <View style={styles.breadcrumbNav}>
            <Pressable
              onPress={() => {
                setCentreAreaId(null);
                setCentreProjectId(null);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
            >
              <Text
                style={[
                  styles.crumbText,
                  !selectedCentreArea && styles.crumbActive,
                  { color: !selectedCentreArea ? theme.colors.text : theme.colors.textMuted },
                ]}
              >
                Thematic areas
              </Text>
            </Pressable>
            {selectedCentreArea ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <Pressable
                  onPress={() => setCentreProjectId(null)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
                >
                  <Text
                    style={[
                      styles.crumbText,
                      !selectedCentreProject && styles.crumbActive,
                      { color: !selectedCentreProject ? theme.colors.text : theme.colors.textMuted },
                    ]}
                  >
                    {selectedCentreArea.name}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {selectedCentreProject ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <View style={styles.crumbItem}>
                  <Text numberOfLines={1} style={[styles.crumbText, styles.crumbActive, { color: theme.colors.text }]}>
                    {selectedCentreProject.name}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {!selectedCentreArea ? (
            <View style={styles.drillSection}>
              <View style={styles.drillHeader}>
                <Text style={[styles.drillTitle, { color: theme.colors.text }]}>Select a thematic area</Text>
                <Text style={[styles.drillSubtitle, { color: theme.colors.textMuted }]}>
                  Explore thematic areas to view center approvals, procurement orders, and payroll.
                </Text>
              </View>

              <View style={styles.scopeGrid}>
                {financeAreas.map((area) => (
                  <Pressable
                    key={area.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setCentreAreaId(area.id);
                    }}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.scopeCard,
                      {
                        backgroundColor: theme.colors.moduleBg,
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.scopeIconBox, { backgroundColor: theme.colors.financeAccentSoft }]}>
                      <Icon name="Building2" size={20} color={theme.colors.financeAccent} />
                    </View>
                    <View style={styles.scopeMain}>
                      <Text numberOfLines={1} style={[styles.scopeTitle, { color: theme.colors.text }]}>
                        {area.name}
                      </Text>
                      <Text style={[styles.scopeSubtitle, { color: theme.colors.textMuted }]}>
                        {area.projects.length} project{area.projects.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Icon name="ChevronRight" size={16} color={theme.colors.textSubtle} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {selectedCentreArea && !selectedCentreProject ? (
            <View style={styles.drillSection}>
              <View style={[styles.drillHeaderRow, !isMd && styles.drillHeaderStacked]}>
                <View style={styles.drillHeaderCol}>
                  <Text style={[styles.drillTitle, { color: theme.colors.text }]}>Select a project</Text>
                  <Text style={[styles.drillSubtitle, { color: theme.colors.textMuted }]}>
                    {selectedCentreArea.name} — choose a project to review centre reimbursements.
                  </Text>
                </View>
                <Button
                  label="Back to areas"
                  icon="ChevronLeft"
                  variant="outline"
                  size="sm"
                  onPress={() => setCentreAreaId(null)}
                />
              </View>

              <View style={styles.scopeGrid}>
                {selectedCentreArea.projects.map((proj) => (
                  <Pressable
                    key={proj.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setCentreProjectId(proj.name);
                    }}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.scopeCard,
                      {
                        backgroundColor: theme.colors.moduleBg,
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.scopeIconBox, { backgroundColor: theme.colors.financeAccentSoft }]}>
                      <Icon name="FolderKanban" size={20} color={theme.colors.financeAccent} />
                    </View>
                    <View style={styles.scopeMain}>
                      <Text numberOfLines={1} style={[styles.scopeTitle, { color: theme.colors.text }]}>
                        {proj.name}
                      </Text>
                      <Text style={[styles.scopeSubtitle, { color: theme.colors.textMuted }]}>
                        {proj.location} · View centre reimbursements
                      </Text>
                    </View>
                    <Icon name="ChevronRight" size={16} color={theme.colors.textSubtle} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {selectedCentreProject ? (
            <View style={styles.projectDetailSection}>
              <View style={[styles.projectDetailHeader, !isMd && styles.drillHeaderStacked]}>
                <View style={styles.projectDetailTitleCol}>
                  <Text style={[styles.projectScopeBadge, { color: theme.colors.financeAccent }]}>
                    {selectedCentreArea?.name}
                  </Text>
                  <Text style={[styles.projectDetailTitle, { color: theme.colors.text }]}>
                    {selectedCentreProject.name}
                  </Text>
                  <Text style={[styles.projectDetailSubtitle, { color: theme.colors.textMuted }]}>
                    {selectedCentreProject.location} · Donor: {selectedCentreProject.donor}
                  </Text>
                </View>
                <Button
                  label="Back to projects"
                  icon="ChevronLeft"
                  variant="outline"
                  size="sm"
                  onPress={() => setCentreProjectId(null)}
                />
              </View>

              <View style={styles.bigPillRow}>
                {CENTRE_TABS.map((label) => {
                  const active = label === centreTab;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => setCentreTab(label)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.bigPill,
                        {
                          backgroundColor: active ? theme.colors.financeAccent : theme.colors.moduleBg,
                          borderColor: active ? theme.colors.financeAccent : theme.colors.border,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.bigPillText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {centreTab === CENTRE_TABS[0] ? (
                <>
                  <View style={styles.statGrid}>
                    <SheetStat label="Operating centers" value={String(centreStats.centers)} />
                    <SheetStat label="Value awaiting review" value={formatRupees(centreStats.value)} />
                    <SheetStat label="Employee TA/DA bills" value={String(centreStats.tadaBills)} />
                  </View>
                  <View style={styles.stepRow}>
                    {STEPS.map((label, index) => {
                      const active = index === 2;
                      return (
                        <View
                          key={label}
                          style={[
                            styles.stepPill,
                            {
                              backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surfaceMuted,
                              borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.stepText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.filterRow}>
                    <SelectField
                      value={monthFilter}
                      onChange={setMonthFilter}
                      options={months.map((m) => ({ value: m, label: m }))}
                      containerStyle={styles.filterSelect}
                    />
                    <View style={styles.typeChips}>
                      {(['All', ...EXPENSE_TYPES] as const).map((type) => {
                        const active = typeFilter === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setTypeFilter(type)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            style={[
                              styles.typeChip,
                              {
                                backgroundColor: active ? theme.colors.financeAccent : theme.colors.surfaceSoft,
                                borderColor: active ? theme.colors.financeAccent : theme.colors.border,
                              },
                            ]}
                          >
                            <Text style={[styles.typeChipText, { color: active ? '#ffffff' : theme.colors.textMuted }]}>{type}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  {filteredExpenses.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                      No expense requests found for {selectedCentreProject.name} with these filters.
                    </Text>
                  ) : (
                    <View style={[styles.list, isMd && styles.listWide]}>
                      {filteredExpenses.map((expense) => (
                        <CentreExpenseCard
                          key={expense.id}
                          expense={expense}
                          employeeCount={billsForCenterMonth(expense.centerId, expense.month).length}
                          onReview={() => setReviewExpense(expense)}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : null}

              {centreTab === CENTRE_TABS[1] ? (
                <View style={styles.list}>
                  {scopedProcurement.map((po) => (
                    <Card key={po.id} padding={16} style={styles.centreCard}>
                      <View style={styles.centreTop}>
                        <View style={styles.centreTitleCol}>
                          <Text style={[styles.centreName, { color: theme.colors.text }]}>{po.item}</Text>
                          <Text style={[styles.centreSub, { color: theme.colors.brandPrimary }]}>
                            {po.id} · {po.center}
                          </Text>
                          <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>Supplier {po.vendor}</Text>
                        </View>
                        <View style={styles.centreRight}>
                          <StatusChip status={po.status} tone={po.status === 'Approved' ? 'success' : 'warning'} />
                          <Text style={[styles.centreAmount, { color: theme.colors.financeAccent }]}>
                            {formatRupees(po.value)}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              ) : null}

              {centreTab === CENTRE_TABS[2] ? (
                <View style={styles.list}>
                  {scopedSalary.map((batch) => (
                    <Card key={batch.id} padding={16} style={styles.centreCard}>
                      <View style={styles.centreTop}>
                        <View style={styles.centreTitleCol}>
                          <Text style={[styles.centreName, { color: theme.colors.text }]}>{batch.center}</Text>
                          <Text style={[styles.centreMeta, { color: theme.colors.textSubtle }]}>
                            {batch.id} · {batch.employees} employees
                          </Text>
                        </View>
                        <View style={styles.centreRight}>
                          <StatusChip status={batch.status} tone={batch.status === 'Approved' ? 'success' : 'warning'} />
                          <Text style={[styles.centreAmount, { color: theme.colors.financeAccent }]}>
                            {formatRupees(batch.gross)}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.breadcrumbNav}>
            <Pressable
              onPress={() => {
                setStaffAreaId(null);
                setStaffProjectId(null);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
            >
              <Text
                style={[
                  styles.crumbText,
                  !selectedStaffArea && styles.crumbActive,
                  { color: !selectedStaffArea ? theme.colors.text : theme.colors.textMuted },
                ]}
              >
                Thematic areas
              </Text>
            </Pressable>
            {selectedStaffArea ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <Pressable
                  onPress={() => setStaffProjectId(null)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.crumbItem, pressed && { opacity: 0.7 }]}
                >
                  <Text
                    style={[
                      styles.crumbText,
                      !selectedStaffProject && styles.crumbActive,
                      { color: !selectedStaffProject ? theme.colors.text : theme.colors.textMuted },
                    ]}
                  >
                    {selectedStaffArea.name}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {selectedStaffProject ? (
              <>
                <Icon name="ChevronRight" size={13} color={theme.colors.textSubtle} />
                <View style={styles.crumbItem}>
                  <Text numberOfLines={1} style={[styles.crumbText, styles.crumbActive, { color: theme.colors.text }]}>
                    {selectedStaffProject.name}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {!selectedStaffArea ? (
            <View style={styles.drillSection}>
              <View style={[styles.bannerCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <Text style={[styles.bannerTag, { color: theme.colors.financeAccent }]}>Staff expense reimbursements</Text>
                <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>Select a thematic area</Text>
                <Text style={[styles.bannerDesc, { color: theme.colors.textMuted }]}>
                  Explore thematic areas, then select a project to manage its staff reimbursements.
                </Text>
              </View>

              <View style={styles.scopeGrid}>
                {financeAreas.map((area) => {
                  const stats = getAreaClaimStats(area);
                  return (
                    <Pressable
                      key={area.id}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setStaffAreaId(area.id);
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.staffCard,
                        {
                          backgroundColor: theme.colors.moduleBg,
                          borderColor: theme.colors.border,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View style={styles.staffCardTop}>
                        <View style={[styles.scopeIconBox, { backgroundColor: theme.colors.financeAccentSoft }]}>
                          <Icon name="FolderKanban" size={20} color={theme.colors.financeAccent} />
                        </View>
                        <Icon name="ArrowUpRight" size={17} color={theme.colors.textSubtle} />
                      </View>
                      <Text numberOfLines={1} style={[styles.staffCardTitle, { color: theme.colors.text }]}>
                        {area.name}
                      </Text>
                      <Text style={[styles.staffCardSub, { color: theme.colors.textMuted }]}>
                        {area.projects.length} projects · {stats.count} {stats.count === 1 ? 'claim' : 'claims'}
                      </Text>
                      <View style={[styles.staffStatsRow, { borderColor: theme.colors.border }]}>
                        <View style={styles.staffStatCol}>
                          <Text style={[styles.staffStatLabel, { color: theme.colors.textSubtle }]}>Claim value</Text>
                          <Text numberOfLines={1} style={[styles.staffStatValue, { color: theme.colors.text }]}>
                            {formatRupees(stats.totalVal)}
                          </Text>
                        </View>
                        <View style={styles.staffStatCol}>
                          <Text style={[styles.staffStatLabel, { color: theme.colors.textSubtle }]}>Awaiting verification</Text>
                          <Text style={[styles.staffStatValue, { color: theme.colors.text }]}>{stats.pending}</Text>
                        </View>
                      </View>
                      <View style={styles.staffCardFooter}>
                        <Text style={[styles.staffCardLink, { color: theme.colors.financeAccent }]}>View projects</Text>
                        <Icon name="ArrowRight" size={13} color={theme.colors.financeAccent} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {selectedStaffArea && !selectedStaffProject ? (
            <View style={styles.drillSection}>
              <View style={[styles.bannerCard, { backgroundColor: theme.colors.moduleBg, borderColor: theme.colors.border }]}>
                <View style={[styles.drillHeaderRow, !isMd && styles.drillHeaderStacked]}>
                  <View style={styles.drillHeaderCol}>
                    <Text style={[styles.bannerTag, { color: theme.colors.financeAccent }]}>Staff expense reimbursements</Text>
                    <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>{selectedStaffArea.name} projects</Text>
                    <Text style={[styles.bannerDesc, { color: theme.colors.textMuted }]}>
                      Choose a project to review employee claims, verify receipts and track disbursements.
                    </Text>
                  </View>
                  <Button
                    label="Back to areas"
                    icon="ChevronLeft"
                    variant="outline"
                    size="sm"
                    onPress={() => setStaffAreaId(null)}
                  />
                </View>
              </View>

              <View style={styles.scopeGrid}>
                {selectedStaffArea.projects.map((proj) => {
                  const stats = getProjectClaimStats(proj.name);
                  return (
                    <Pressable
                      key={proj.id}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setStaffProjectId(proj.name);
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.staffCard,
                        {
                          backgroundColor: theme.colors.moduleBg,
                          borderColor: theme.colors.border,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View style={styles.staffCardTop}>
                        <View style={[styles.scopeIconBox, { backgroundColor: theme.colors.financeAccentSoft }]}>
                          <Icon name="Receipt" size={20} color={theme.colors.financeAccent} />
                        </View>
                        <Icon name="ArrowUpRight" size={17} color={theme.colors.textSubtle} />
                      </View>
                      <Text numberOfLines={1} style={[styles.staffCardTitle, { color: theme.colors.text }]}>
                        {proj.name}
                      </Text>
                      <Text style={[styles.staffCardSub, { color: theme.colors.textMuted }]}>
                        {stats.count} {stats.count === 1 ? 'claim' : 'claims'}
                      </Text>
                      <View style={[styles.staffStatsRow, { borderColor: theme.colors.border }]}>
                        <View style={styles.staffStatCol}>
                          <Text style={[styles.staffStatLabel, { color: theme.colors.textSubtle }]}>Claim value</Text>
                          <Text numberOfLines={1} style={[styles.staffStatValue, { color: theme.colors.text }]}>
                            {formatRupees(stats.totalVal)}
                          </Text>
                        </View>
                        <View style={styles.staffStatCol}>
                          <Text style={[styles.staffStatLabel, { color: theme.colors.textSubtle }]}>Awaiting verification</Text>
                          <Text style={[styles.staffStatValue, { color: theme.colors.text }]}>{stats.pending}</Text>
                        </View>
                      </View>
                      <View style={styles.staffCardFooter}>
                        <Text style={[styles.staffCardLink, { color: theme.colors.financeAccent }]}>View reimbursements</Text>
                        <Icon name="ArrowRight" size={13} color={theme.colors.financeAccent} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {selectedStaffProject ? (
            <View style={styles.projectDetailSection}>
              <View style={[styles.projectDetailHeader, !isMd && styles.drillHeaderStacked]}>
                <View style={styles.projectDetailTitleCol}>
                  <Text style={[styles.projectScopeBadge, { color: theme.colors.financeAccent }]}>
                    {selectedStaffArea?.name}
                  </Text>
                  <Text style={[styles.projectDetailTitle, { color: theme.colors.text }]}>
                    {selectedStaffProject.name}
                  </Text>
                </View>
                <Button
                  label="Back to projects"
                  icon="ChevronLeft"
                  variant="outline"
                  size="sm"
                  onPress={() => setStaffProjectId(null)}
                />
              </View>

              <HeroBanner
                gradient={heroGradients.vendor}
                badge={{ icon: 'Receipt', label: 'Staff Expense Reimbursement & Travel Advance' }}
                title="Staff Expense Claims"
                description={`Audited employee claims reimbursement pipeline for ${selectedStaffProject.name} with receipt verification, reporting manager pre-clearance, and automated bank disbursement.`}
                actions={[{ label: 'Submit Expense Claim', icon: 'Plus', variant: 'white', onPress: () => setFormOpen(true) }]}
              />

              <View style={styles.metricsGrid}>
                <MetricCard
                  style={styles.metricCard}
                  label="Pending Finance Verification"
                  value={`${staffKpis.pendingCount} Claims`}
                  subtitle="Manager-approved; awaiting voucher audit"
                  icon="Clock"
                  accentColor={theme.colors.warning}
                  arrow
                />
                <MetricCard
                  style={styles.metricCard}
                  label={`Approved for Payout (${staffKpis.approvedCount})`}
                  value={formatRupees(staffKpis.approvedTotal)}
                  subtitle="Scheduled for weekly batch NEFT"
                  icon="CheckCircle2"
                  accentColor={theme.colors.info}
                  arrow
                />
                <MetricCard
                  style={styles.metricCard}
                  label="Disbursed This Month"
                  value={formatRupees(staffKpis.disbursedTotal)}
                  subtitle="Reconciled against bank vouchers"
                  icon="CreditCard"
                  accentColor={theme.colors.emerald}
                  arrow
                />
                <MetricCard
                  style={styles.metricCard}
                  label="Avg Settlement Turnaround"
                  value="2.8 Days"
                  subtitle="From receipt submission to bank credit"
                  icon="ShieldCheck"
                  accentColor={theme.colors.violet}
                  arrow
                />
              </View>

              <SectionCard
                title="Staff Reimbursement Claims Queue"
                description={`Showing ${filteredStaffClaims.length} of ${scopedStaffClaims.length} claims for ${selectedStaffProject.name}`}
              >
                <View style={styles.filterRow}>
                  <TextField
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search staff, ID..."
                    containerStyle={styles.searchGrow}
                  />
                  <SelectField
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'Pending Verification', label: 'Pending Verification' },
                      { value: 'Finance Approved', label: 'Finance Approved' },
                      { value: 'Disbursed', label: 'Disbursed' },
                    ]}
                    containerStyle={styles.filterSelect}
                  />
                  <SelectField
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[{ value: 'all', label: 'All Categories' }, ...CLAIM_CATEGORIES.map((c) => ({ value: c, label: c }))]}
                    containerStyle={styles.filterSelect}
                  />
                </View>
                <DataTable
                  columns={CLAIM_COLUMNS}
                  rows={filteredStaffClaims}
                  keyExtractor={(claim) => claim.id}
                  renderCell={renderClaimCell}
                  renderMobileCard={(claim) => (
                    <ClaimMobileCard
                      claim={claim}
                      onView={() => {
                        setReviewClaim(claim);
                        setClaimOpen(true);
                      }}
                    />
                  )}
                  emptyIcon="Receipt"
                  emptyTitle="No claims match your filters"
                  emptyDescription={`No claims found for ${selectedStaffProject.name}. Submit a new claim to get started.`}
                />
              </SectionCard>
            </View>
          ) : null}
        </View>
      )}

      {reviewExpense && reviewExpense.type === 'TA/DA' ? (
        <TaDaReviewSheet
          key={reviewExpense.id}
          expense={reviewExpense}
          visible={Boolean(reviewExpense)}
          onClose={() => setReviewExpense(null)}
        />
      ) : (
        <ExpenseBillReviewSheet
          key={reviewExpense?.id ?? 'none'}
          expense={reviewExpense}
          visible={Boolean(reviewExpense)}
          onClose={() => setReviewExpense(null)}
        />
      )}

      <ClaimReviewSheet
        claim={reviewClaim}
        visible={claimOpen}
        onClose={() => setClaimOpen(false)}
        onApprove={(id) => {
          handleApprove(id);
          setClaimOpen(false);
        }}
        onDisburse={(id) => {
          handleDisburse(id);
          setClaimOpen(false);
        }}
      />

      <ModalSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        label="Expense Claim"
        title="Submit Staff Expense Reimbursement"
        description={`Submit out-of-pocket expenses incurred during ${selectedStaffProject?.name ?? 'project'} operations.`}
        size="md"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setFormOpen(false)} />
            <Button label="Submit for Approval" variant="emerald" onPress={handleSubmitClaim} />
          </>
        }
      >
        <TextField label="Employee Name *" value={claimant} onChangeText={setClaimant} placeholder="e.g. Sunita Majhi" />
        <TextField label="Employee ID" value={empId} onChangeText={setEmpId} placeholder="e.g. PAN-EMP-0104" />
        <TextField label="Cost Center" value={costCenter} onChangeText={setCostCenter} placeholder="e.g. Koraput Regional Office" />
        <TextField
          label="Purpose & Expense Details"
          value={purpose}
          onChangeText={setPurpose}
          multiline
          placeholder="Describe trip details, dates, attendees or materials purchased..."
        />
        <TextField label="Claim Amount (₹) *" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 8450" />
        <SelectField
          label="Expense Category"
          value={category}
          onChange={setCategory}
          options={CLAIM_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Text style={[styles.attachLabel, { color: theme.colors.textMuted }]}>Attach Bills / Receipts (PDF or Images)</Text>
        <Pressable
          onPress={() => setBillsAttached((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ selected: billsAttached }}
          style={[styles.dropzone, { borderColor: theme.colors.emerald, backgroundColor: theme.colors.emeraldSoft }]}
        >
          <Icon name="Upload" size={17} color={theme.colors.emerald} />
          <View style={styles.dropzoneText}>
            <Text style={[styles.dropzoneTitle, { color: theme.colors.text }]}>
              {billsAttached ? '2 bills attached · Add more' : 'Upload invoice/voucher scans'}
            </Text>
            <Text style={[styles.dropzoneSub, { color: theme.colors.textSubtle }]}>PDF, JPG, PNG · up to 10 MB per bill</Text>
          </View>
        </Pressable>
        <Text style={[styles.attachNote, { color: theme.colors.textSubtle }]}>
          Demo build — attaching simulates taxi-invoice.pdf and hotel-invoice.pdf against this claim.
        </Text>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 14 },

  breadcrumbNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  crumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  crumbText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  crumbActive: {
    fontWeight: '700',
  },

  drillSection: { gap: 14 },
  drillHeader: { gap: 4 },
  drillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  drillHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  drillHeaderCol: { flex: 1, minWidth: 200, gap: 4 },
  drillTitle: { fontSize: 18, fontWeight: '700' },
  drillSubtitle: { fontSize: 13, lineHeight: 18 },

  scopeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scopeCard: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  scopeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeMain: { flex: 1, minWidth: 0, gap: 3 },
  scopeTitle: { fontSize: 14.5, fontWeight: '700' },
  scopeSubtitle: { fontSize: 11.5 },

  bannerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  bannerTag: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  bannerTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  bannerDesc: { fontSize: 13, lineHeight: 19 },

  staffCard: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 260,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  staffCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffCardTitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  staffCardSub: { fontSize: 12 },
  staffStatsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 4,
    gap: 12,
  },
  staffStatCol: { flex: 1, minWidth: 0, gap: 2 },
  staffStatLabel: { fontSize: 10.5, fontWeight: '600' },
  staffStatValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  staffCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  staffCardLink: { fontSize: 12, fontWeight: '700' },

  projectDetailSection: { gap: 14 },
  projectDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 4,
  },
  projectDetailTitleCol: { flex: 1, minWidth: 200, gap: 3 },
  projectScopeBadge: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  projectDetailTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  projectDetailSubtitle: { fontSize: 12 },

  bigPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bigPill: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  bigPillText: { fontSize: 13, fontWeight: '700' },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  stepText: { fontSize: 11, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  typeChipText: { fontSize: 10.5, fontWeight: '700' },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  searchGrow: { flexGrow: 2, flexBasis: 220 },
  list: { gap: 12 },
  listWide: { flexDirection: 'row', flexWrap: 'wrap' },
  centreCard: { gap: 12 },
  centreTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  centreTitleCol: { flex: 1, minWidth: 0 },
  centreName: { fontSize: 14.5, fontWeight: '700' },
  centreSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  centreMeta: { fontSize: 11, marginTop: 2 },
  centreRight: { alignItems: 'flex-end', gap: 6 },
  centreAmount: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  cellMain: { fontSize: 12.5, fontWeight: '600' },
  cellSub: { fontSize: 11, marginTop: 1 },
  amountText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  viewBtn: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  attachLabel: { fontSize: 11.5, fontWeight: '700', marginTop: 4 },
  dropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 14,
  },
  dropzoneText: { flex: 1, minWidth: 0, gap: 2 },
  dropzoneTitle: { fontSize: 12, fontWeight: '700' },
  dropzoneSub: { fontSize: 10 },
  attachNote: { fontSize: 10.5, lineHeight: 15 },
});
