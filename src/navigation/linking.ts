import type { LinkingOptions } from '@react-navigation/native';

import type { RootDrawerParamList } from './types';

/**
 * Web-parity URL map — the explicit replacement for expo-router's
 * file-based deep links. Paths mirror the web app routes:
 * `/`, `/modules/:categoryId`, `/login`, `/finance/*`, `/hr/*`.
 */
export const linking: LinkingOptions<RootDrawerParamList> = {
  prefixes: [],
  enabled: true,
  config: {
    screens: {
      PublicStack: {
        path: '',
        screens: {
          Landing: '',
          Modules: 'modules/:categoryId',
          Login: 'login',
          NotFound: '*',
        },
      },
      FinanceStack: {
        path: 'finance',
        screens: {
          FinanceDashboard: 'dashboard',
          AreaDashboard: 'area/:areaId',
          Budget: 'budget',
          Books: 'books',
          Banking: 'banking',
          VendorManagement: 'vendor-management',
          Procurement: 'procurement',
          FinanceSalary: 'salary',
          Reimbursement: 'reimbursement',
          Payments: 'payments',
          Taxation: 'taxation',
          AuditTrails: 'audit-trails',
          Projects: 'projects',
          Invoices: 'invoices',
          Investments: 'investments',
          Alerts: 'alerts',
        },
      },
      HrStack: {
        path: 'hr',
        screens: {
          HrDashboard: 'dashboard',
          Recruitment: 'recruitment',
          EmployeeOnboarding: 'employee-onboarding',
          ProjectAssignment: 'project-assignment',
          JobDesignations: 'job-designations',
          HrSalary: 'salary',
          Attendance: 'attendance',
          LeaveManagement: 'leave-management',
          KbiMetrics: 'kbi-metrics',
          Appraisals: 'appraisals',
        },
      },
    },
  },
};
