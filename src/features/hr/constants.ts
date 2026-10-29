import { NavItem } from '../../types/navigation';
import { LeaveRequest } from './types';

export const reviewYears = ['2026–27', '2025–26'];

export const indicators = [
  {
    id: 'collaboration',
    name: 'Collaboration',
    weight: 30,
    detail: 'Teamwork, knowledge sharing and constructive feedback.',
  },
  {
    id: 'ownership',
    name: 'Ownership',
    weight: 30,
    detail: 'Accountability, delivery and problem solving.',
  },
  {
    id: 'leadership',
    name: 'People leadership',
    weight: 20,
    detail: 'Coaching, inclusion and support for colleagues.',
  },
  {
    id: 'conduct',
    name: 'Values & conduct',
    weight: 20,
    detail: 'Integrity, respect and responsible decisions.',
  },
];

export const leaves: LeaveRequest[] = [
  {
    id: 'LV-1041',
    employeeId: 'PAN-EMP-0102',
    type: 'Earned leave',
    start: '2026-10-12',
    end: '2026-10-14',
    days: 3,
    balance: 12,
    reason: 'Family commitment. Training handover completed with the centre lead.',
    adminStatus: 'Approved',
    adminBy: 'Programme Admin (demo)',
    adminAt: '2026-10-08',
    adminNote: 'Backup trainer confirmed; team coverage approved.',
  },
  {
    id: 'LV-1042',
    employeeId: 'PAN-EMP-0104',
    type: 'Casual leave',
    start: '2026-10-15',
    end: '2026-10-15',
    days: 1,
    balance: 5,
    reason: 'Personal appointment. Field visit rescheduled.',
    adminStatus: 'Pending',
  },
  {
    id: 'LV-1043',
    employeeId: 'PAN-EMP-0103',
    type: 'Earned leave',
    start: '2026-10-19',
    end: '2026-10-20',
    days: 2,
    balance: 8,
    reason: 'Personal travel.',
    adminStatus: 'Rejected',
    adminBy: 'Centre Admin (demo)',
    adminAt: '2026-10-08',
    adminNote: 'Assessment week requires trainer coverage; alternate dates requested.',
  },
];

export const hrNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/(hr)/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'recruitment',
    label: 'Recruitment & Hiring',
    route: '/(hr)/recruitment',
    iconName: 'UserCheck',
  },
  {
    id: 'employee-onboarding',
    label: 'Employee Onboarding',
    route: '/(hr)/employee-onboarding',
    iconName: 'UserPlus',
  },
  {
    id: 'project-assignment',
    label: 'Project Assignment',
    route: '/(hr)/project-assignment',
    iconName: 'Network',
  },
  {
    id: 'job-designations',
    label: 'Job Designations',
    route: '/(hr)/job-designations',
    iconName: 'BriefcaseBusiness',
  },
  {
    id: 'salary',
    label: 'Salary Approvals',
    route: '/(hr)/salary',
    iconName: 'Wallet',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    route: '/(hr)/attendance',
    iconName: 'CalendarCheck',
  },
  {
    id: 'leave-management',
    label: 'Leave Management',
    route: '/(hr)/leave-management',
    iconName: 'CalendarDays',
  },
  {
    id: 'kbi-metrics',
    label: 'KBI Metrics',
    route: '/(hr)/kbi-metrics',
    iconName: 'Target',
  },
  {
    id: 'appraisals',
    label: 'Year-end Appraisals',
    route: '/(hr)/appraisals',
    iconName: 'Award',
  },
];
